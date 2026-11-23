// How the desk hears you. Ported from Barnabas's voice client:
//   DeepgramListener  streaming speech-to-text with the trade's vocabulary boosted; hands-free, and
//                     the echo cancellation that lets you talk over a lead to interrupt.
//   BrowserListener   the browser's own recognition, push-to-talk only.

/** How long a pause ends your turn, in ms. Short feels quick; long is patient with a slow talker. */
export const DEFAULT_PAUSE_MS = 700;

/*
 * Keeping the microphone between conversations. iPhones ask for permission again whenever a page
 * re-opens the mic after letting go of it, so after a turn the stream is held (tracks disabled,
 * nothing captured or sent) for MIC_HOLD_MS and reused without a prompt. It's released after that
 * quiet time, or as soon as you leave the app.
 */
export const MIC_HOLD_MS = 20 * 60 * 1000;
let heldMic = null;
let micTimer = null;
let watchingMic = false;

const micLive = (s) => s.getAudioTracks().some((t) => t.readyState === "live");

export async function takeMic(constraints) {
  if (micTimer) clearTimeout(micTimer);
  micTimer = null;
  const held = heldMic;
  heldMic = null;
  if (held && micLive(held)) {
    held.getAudioTracks().forEach((t) => (t.enabled = true));
    return held;
  }
  return navigator.mediaDevices.getUserMedia(constraints);
}

export function holdMic(stream) {
  if (!micLive(stream) || (typeof document !== "undefined" && document.hidden)) {
    stream.getTracks().forEach((t) => t.stop());
    return;
  }
  stream.getAudioTracks().forEach((t) => (t.enabled = false));
  if (heldMic && heldMic !== stream) heldMic.getTracks().forEach((t) => t.stop());
  heldMic = stream;
  if (micTimer) clearTimeout(micTimer);
  micTimer = setTimeout(releaseMic, MIC_HOLD_MS);
  if (!watchingMic && typeof window !== "undefined") {
    watchingMic = true;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) releaseMic();
    });
    window.addEventListener("pagehide", releaseMic);
  }
}

export function releaseMic() {
  if (micTimer) clearTimeout(micTimer);
  micTimer = null;
  heldMic?.getTracks().forEach((t) => t.stop());
  heldMic = null;
}

export function browserRecognitionAvailable() {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export class DeepgramListener {
  /** events: { onInterim(text), onUtterance(text), onError(message), onClose() } */
  constructor({ events, getToken, terms = [], pauseMs = DEFAULT_PAUSE_MS }) {
    this.events = events;
    this.getToken = getToken;
    this.terms = terms;
    this.pauseMs = pauseMs;
    this.ws = null;
    this.stream = null;
    this.ctx = null;
    this.processor = null;
    this.source = null;
    this.finals = [];
    this.interim = "";
    this.closed = false;
  }

  flush() {
    const text = [...this.finals, this.interim].join(" ").replace(/\s+/g, " ").trim();
    this.finals = [];
    this.interim = "";
    this.events.onInterim("");
    if (text) this.events.onUtterance(text);
  }

  async start() {
    // Create and resume the audio context while still inside the tap: iPhones require it.
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.ctx.resume();
    const token = await this.getToken?.().catch(() => null);
    const terms = this.terms.filter((t) => /^[A-Za-z0-9&.\- ]{2,24}$/.test(t)).slice(0, 40).join(",");
    const tokenRes = await fetch(`/api/voice?op=stt-token${terms ? `&terms=${encodeURIComponent(terms)}` : ""}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!tokenRes.ok) throw new Error((await tokenRes.json().catch(() => ({}))).error || "Couldn't start listening.");
    const { token: grant, keyterms } = await tokenRes.json();

    // Echo cancellation keeps the desk from hearing itself, which is what makes interrupting work.
    this.stream = await takeMic({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });

    const pause = Math.round(Math.min(2000, Math.max(200, this.pauseMs)));
    const q = new URLSearchParams({
      model: "nova-3",
      language: "en",
      smart_format: "true",
      interim_results: "true",
      endpointing: String(pause),
      // The backstop when no clear pause is detected; Deepgram's minimum is 1000 ms.
      utterance_end_ms: String(Math.min(5000, Math.max(1000, pause + 700))),
      vad_events: "true",
      // Raw 16-bit PCM behaves the same on every browser, iPhone home-screen apps included.
      encoding: "linear16",
      sample_rate: String(this.ctx.sampleRate),
      channels: "1",
    });
    for (const k of keyterms || []) q.append("keyterm", k);
    const ws = new WebSocket(`wss://api.deepgram.com/v1/listen?${q}`, ["bearer", grant]);
    this.ws = ws;

    ws.onmessage = (msg) => {
      let data;
      try {
        data = JSON.parse(String(msg.data));
      } catch {
        return;
      }
      if (data.type === "Results") {
        const text = data.channel?.alternatives?.[0]?.transcript || "";
        if (data.is_final) {
          if (text) this.finals.push(text);
          this.interim = "";
        } else {
          this.interim = text;
        }
        this.events.onInterim([...this.finals, this.interim].join(" ").trim());
        if (data.speech_final) this.flush();
      } else if (data.type === "UtteranceEnd") {
        this.flush();
      }
    };
    ws.onerror = () => this.events.onError("Lost the connection to the listening service.");
    ws.onclose = () => {
      this.release();
      if (!this.closed) this.events.onClose();
    };

    await new Promise((resolve, reject) => {
      ws.onopen = () => resolve();
      setTimeout(() => reject(new Error("Couldn't connect to the listening service.")), 8000);
    });

    if (this.ctx.state !== "running") await this.ctx.resume().catch(() => {});
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.processor = this.ctx.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const input = e.inputBuffer.getChannelData(0);
      const pcm = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        const v = Math.max(-1, Math.min(1, input[i]));
        pcm[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
      }
      ws.send(pcm.buffer);
    };
    this.source.connect(this.processor);
    // A muted output keeps the processor running without playing the mic back.
    const mute = this.ctx.createGain();
    mute.gain.value = 0;
    this.processor.connect(mute);
    mute.connect(this.ctx.destination);
  }

  /** Push-to-talk: give the last words a moment to arrive, then deliver everything heard. */
  finish() {
    try {
      this.ws?.send(JSON.stringify({ type: "Finalize" }));
    } catch {
      // closed
    }
    setTimeout(() => {
      this.flush();
      this.close();
    }, 700);
  }

  release() {
    this.processor?.disconnect();
    this.source?.disconnect();
    if (this.processor) this.processor.onaudioprocess = null;
    if (this.stream) holdMic(this.stream);
    this.ctx?.close().catch(() => {});
    this.processor = null;
    this.source = null;
    this.ctx = null;
    this.stream = null;
  }

  close() {
    this.closed = true;
    this.release();
    try {
      if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ type: "CloseStream" }));
      this.ws?.close();
    } catch {
      // already closed
    }
    this.ws = null;
  }
}

export class BrowserListener {
  constructor({ events }) {
    this.events = events;
    this.rec = null;
    this.finalText = "";
  }

  async start() {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) throw new Error("Voice input isn't available in this browser. Try Chrome, Edge or Safari, or type below.");
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) this.finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      this.events.onInterim(this.finalText + interim);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") this.events.onError("Microphone access is blocked. Allow it in your browser settings, or type below.");
      else if (e.error !== "no-speech" && e.error !== "aborted") this.events.onError("I couldn't hear that. Try again.");
    };
    rec.onend = () => {
      this.events.onInterim("");
      const text = this.finalText.trim();
      this.finalText = "";
      this.rec = null;
      if (text) this.events.onUtterance(text);
      this.events.onClose();
    };
    this.rec = rec;
    rec.start();
  }

  finish() {
    this.rec?.stop();
  }

  close() {
    this.rec?.abort();
    this.rec = null;
  }
}

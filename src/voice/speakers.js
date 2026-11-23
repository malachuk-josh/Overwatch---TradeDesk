// How the desk leads talk back. Ported from Barnabas's voice client:
//   CloudSpeaker   the lead's own ElevenLabs voice, fetched sentence by sentence through
//                  /api/voice?op=tts and played back to back on one AudioContext.
//   BrowserSpeaker the device's built-in voice, tuned per lead so they still sound like five people.
import { normalizeForSpeech } from "./normalize.js";

/** A tenth of a second of silence, played on the first tap to unlock audio on phones. */
export function silentWav() {
  const samples = 4410;
  const buf = new ArrayBuffer(44 + samples * 2);
  const v = new DataView(buf);
  const str = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF"); v.setUint32(4, 36 + samples * 2, true); str(8, "WAVE"); str(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 44100, true);
  v.setUint32(28, 88200, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, samples * 2, true);
  let bin = "";
  new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
  return `data:audio/wav;base64,${btoa(bin)}`;
}

/**
 * iPhone's ring/silent switch mutes Web Audio and the built-in voice unless the page declares it is
 * playing media, not alert sounds. Safari 16.4+ exposes that as navigator.audioSession; elsewhere
 * this does nothing. Call from a tap.
 */
export function primeAudioSession() {
  try {
    if (typeof navigator !== "undefined" && navigator.audioSession && navigator.audioSession.type !== "playback") {
      navigator.audioSession.type = "playback";
    }
  } catch {
    // older Safari, or a browser without the Audio Session API
  }
}

const authHeaders = async (getToken) => {
  const token = await getToken?.().catch(() => null);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * A desk lead's ElevenLabs voice. Sentences play through one AudioContext that stays open for the
 * whole reply, each with a few milliseconds of fade, because swapping an <audio> element's source
 * between sentences clicked at every edge and, on phones with the mic open, re-engaged the audio
 * route with a burst of static.
 */
export class CloudSpeaker {
  constructor(opts) {
    this.opts = opts; // { lead, getToken, onStart, onIdle, onError }
    this.ctx = null;
    this.audio = null;
    this.current = null;
    this.queue = [];
    this.playing = false;
    this.generation = 0;
    this.lastHeard = "";
    this.fillerCache = new Map();
  }

  context() {
    if (!this.ctx || this.ctx.state === "closed") {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctor({ latencyHint: "playback" });
    }
    return this.ctx;
  }

  hasWebAudio() {
    return typeof window !== "undefined" && Boolean(window.AudioContext || window.webkitAudioContext);
  }

  unlock() {
    primeAudioSession();
    if (this.hasWebAudio()) {
      const ctx = this.context();
      ctx.resume().catch(() => {});
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      src.connect(ctx.destination);
      src.start();
      return;
    }
    if (!this.audio) this.audio = new Audio();
    this.audio.src = silentWav();
    this.audio.play().catch(() => {});
  }

  /** A short "Mm." in this lead's voice while the reply is being written. */
  filler(index, text) {
    let clip = this.fillerCache.get(index);
    if (!clip) {
      clip = this.fetchFiller(index);
      this.fillerCache.set(index, clip);
    }
    const data = clip.then((b) => (b ? b.slice(0) : null)); // decoding detaches the buffer
    this.queue.unshift({ text, spoken: text, data, abort: new AbortController(), filler: true });
    if (!this.playing) this.next(this.generation);
  }

  async fetchFiller(index) {
    try {
      const r = await fetch(`/api/voice?op=filler&lead=${encodeURIComponent(this.opts.lead)}&n=${index}`, { headers: await authHeaders(this.opts.getToken) });
      return r.ok ? await r.arrayBuffer() : null;
    } catch {
      return null;
    }
  }

  /** Fetch the fillers ahead of time, one at a time (ElevenLabs allows only a few requests at once). */
  warmFillers(count) {
    let chain = Promise.resolve();
    for (let i = 0; i < count; i++) {
      if (this.fillerCache.has(i)) continue;
      const clip = chain.then(() => this.fetchFiller(i));
      this.fillerCache.set(i, clip);
      chain = clip;
    }
  }

  speak(sentence) {
    const spoken = normalizeForSpeech(sentence);
    if (!spoken) return;
    this.queue.push({ text: sentence, spoken, data: null, abort: new AbortController() });
    this.prefetch();
    if (!this.playing) this.next(this.generation);
  }

  /** Only the next couple of sentences are fetched ahead: the TTS plan allows a few at once. */
  prefetch() {
    for (const item of this.queue.slice(0, 2)) if (!item.data) item.data = this.fetchAudio(item.spoken, item.abort.signal);
  }

  async fetchAudio(text, signal, attempt = 0) {
    try {
      const r = await fetch("/api/voice?op=tts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders(this.opts.getToken)) },
        body: JSON.stringify({ text, lead: this.opts.lead }),
        signal,
      });
      if (r.status === 429 && attempt < 2) {
        await new Promise((res) => setTimeout(res, 400 * (attempt + 1)));
        return this.fetchAudio(text, signal, attempt + 1);
      }
      return r.ok ? await r.arrayBuffer() : null;
    } catch {
      return null;
    }
  }

  async next(gen) {
    const item = this.queue.shift();
    if (!item) {
      this.playing = false;
      this.current = null;
      this.opts.onIdle?.();
      return;
    }
    this.playing = true;
    this.prefetch();
    const data = await (item.data || (item.data = this.fetchAudio(item.spoken, item.abort.signal)));
    if (gen !== this.generation) return;
    if (!data) {
      if (!item.filler) this.opts.onError?.();
      this.next(gen);
      return;
    }
    const done = () => {
      if (gen === this.generation) this.next(gen);
    };
    if (this.hasWebAudio()) {
      try {
        await this.playBuffer(data, gen, item.filler ? null : item.text, done);
        return;
      } catch {
        // this browser couldn't decode it: fall back to an <audio> element for this sentence
      }
      if (gen !== this.generation) return;
    }
    this.playElement(data, item.filler ? null : item.text, done, gen);
  }

  async playBuffer(data, gen, text, done) {
    const ctx = this.context();
    if (ctx.state === "suspended") await ctx.resume().catch(() => {});
    const buffer = await ctx.decodeAudioData(data.slice(0));
    if (gen !== this.generation) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    src.connect(gain).connect(ctx.destination);
    const t = ctx.currentTime + 0.01;
    const end = t + buffer.duration;
    const fadeIn = Math.min(0.012, buffer.duration / 4);
    const fadeOut = Math.min(0.025, buffer.duration / 4);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1, t + fadeIn);
    gain.gain.setValueAtTime(1, Math.max(t + fadeIn, end - fadeOut));
    gain.gain.linearRampToValueAtTime(0, end);
    src.onended = () => {
      if (this.current?.src === src) this.current = null;
      done();
    };
    this.current = { src, gain };
    // Fillers aren't something the trader "heard" of the reply.
    if (text !== null) this.lastHeard = text;
    this.opts.onStart?.();
    src.start(t);
  }

  playElement(data, text, done, gen) {
    const url = URL.createObjectURL(new Blob([data], { type: "audio/mpeg" }));
    if (!this.audio) this.audio = new Audio();
    const a = this.audio;
    a.src = url;
    a.onended = a.onerror = () => {
      URL.revokeObjectURL(url);
      done();
    };
    if (text !== null) this.lastHeard = text;
    this.opts.onStart?.();
    a.play().catch(() => {
      if (gen === this.generation) done();
    });
  }

  stop() {
    this.generation++;
    for (const q of this.queue) q.abort.abort();
    this.queue = [];
    this.playing = false;
    if (this.current && this.ctx) {
      // Fade out over a few milliseconds rather than cutting mid-wave, which clicks.
      const { src, gain } = this.current;
      const now = this.ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.03);
      src.onended = null;
      try {
        src.stop(now + 0.035);
      } catch {
        // already stopped
      }
      this.current = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
    }
  }

  busy() {
    return this.playing || this.queue.length > 0;
  }
}

// Without ElevenLabs, each lead still gets a distinct device voice: a different system voice where
// the device has several, and their own pitch and pace. Jesse is old and slow, Mike quick and flat.
export const BROWSER_VOICE = Object.freeze({
  jack: { pick: 0, pitch: 0.9, rate: 1.02 },
  jesse: { pick: 1, pitch: 0.72, rate: 0.9 },
  mike: { pick: 2, pitch: 0.98, rate: 1.1 },
  ptj: { pick: 3, pitch: 1.08, rate: 1.04 },
  connors: { pick: 4, pitch: 1.0, rate: 0.94 },
});

// Apple ships joke voices alongside the real ones ("Bad News" sings, "Bubbles" gurgles). A lead's
// slot must never land on one.
const NOVELTY_VOICE = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Junior|Ralph|Kathy|Fred)\b/i;

/** The device voice for a lead: English, real voices only, natural/neural ones first. */
export function pickBrowserVoice(voices, lead) {
  const english = (voices || []).filter((v) => v.lang?.toLowerCase().startsWith("en") && !NOVELTY_VOICE.test(v.name || ""));
  if (!english.length) return null;
  const quality = (v) => Number(/natural|neural|premium|enhanced/i.test(v.name)) * 2 + Number(/^en-US/i.test(v.lang));
  const ranked = [...english].sort((a, b) => quality(b) - quality(a));
  return ranked[(BROWSER_VOICE[lead]?.pick ?? 0) % ranked.length];
}

// iOS only lets a page speak once speechSynthesis.speak() has run inside a tap. Once per page.
let synthUnlocked = false;

export class BrowserSpeaker {
  constructor(opts) {
    this.opts = opts; // { lead, onStart, onIdle }
    this.pending = 0;
    this.lastHeard = "";
    // WebKit and Chrome can garbage-collect an utterance mid-queue, which drops its end event and
    // leaves the speaker "busy" forever. Hold each one until it's done.
    this.live = new Set();
  }

  unlock() {
    primeAudioSession();
    if (typeof speechSynthesis === "undefined") return;
    speechSynthesis.getVoices();
    // Safari can sit "paused" after the app was backgrounded; nothing queued will play until resumed.
    if (speechSynthesis.paused) speechSynthesis.resume();
    if (synthUnlocked) return;
    synthUnlocked = true;
    // Real text at zero volume: an all-whitespace utterance can be skipped without starting the engine.
    const u = new SpeechSynthesisUtterance("Ready.");
    u.volume = 0;
    speechSynthesis.speak(u);
  }

  voice() {
    return pickBrowserVoice(speechSynthesis.getVoices(), this.opts.lead);
  }

  speak(sentence) {
    if (typeof speechSynthesis === "undefined") return;
    const text = normalizeForSpeech(sentence);
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    const tune = BROWSER_VOICE[this.opts.lead] || BROWSER_VOICE.jack;
    u.lang = "en-US";
    const v = this.voice();
    if (v) u.voice = v;
    u.pitch = tune.pitch;
    u.rate = tune.rate;
    this.pending++;
    u.onstart = () => {
      this.lastHeard = sentence;
      this.opts.onStart?.();
    };
    this.live.add(u);
    const done = () => {
      this.live.delete(u);
      this.pending = Math.max(0, this.pending - 1);
      if (this.pending === 0) this.opts.onIdle?.();
    };
    u.onend = done;
    u.onerror = (e) => {
      done();
      // "interrupted"/"canceled" are us stopping it; anything else (e.g. "not-allowed") is the
      // device refusing to speak, which used to fail without a word.
      if (e?.error && e.error !== "interrupted" && e.error !== "canceled") this.opts.onError?.(`The device voice refused to speak (${e.error}).`);
    };
    if (speechSynthesis.paused) speechSynthesis.resume();
    speechSynthesis.speak(u);
  }

  stop() {
    this.pending = 0;
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  }

  busy() {
    return this.pending > 0;
  }
}

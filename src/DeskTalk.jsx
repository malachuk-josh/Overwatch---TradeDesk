// Talk to the desk: a voice conversation with any of the five desk leads, each in their own voice.
// Jack, the head trader, is who you get by default.
//
// The voice loop is Barnabas's, running in the browser: you speak (Deepgram streaming, or the
// browser's own recognition), the turn streams back from /api/voice?op=chat as newline-delimited
// JSON, and each finished sentence is spoken in the lead's voice while the rest is still arriving.
// Talking over a lead interrupts them, and the next turn tells them what you actually heard.
//
// Lazy-loaded: none of this reaches the main bundle until the drawer is first opened.
import React, { useCallback, useEffect, useRef, useState } from "react";
import Mic from "lucide-react/dist/esm/icons/mic.mjs";
import Square from "lucide-react/dist/esm/icons/square.mjs";
import Send from "lucide-react/dist/esm/icons/send.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import AudioLines from "lucide-react/dist/esm/icons/audio-lines.mjs";
import { PERSONAS } from "./personas.js";
import { SentenceChunker } from "./voice/chunker.js";
import { BrowserSpeaker, CloudSpeaker } from "./voice/speakers.js";
import { BrowserListener, DeepgramListener, browserRecognitionAvailable } from "./voice/listeners.js";
import { playEarcon, unlockEarcons } from "./voice/earcons.js";

const LEADS = Object.keys(PERSONAS);
const DEFAULT_LEAD = "jack";
// Mirrors the server's filler lists (api/voice.js FILLERS) by count; the server holds the words.
const FILLER_COUNT = 4;
// If the first words aren't back this quickly, the lead says "Mm." so there's no dead air.
const FILLER_DELAY_MS = 250;

const stored = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
};
const store = (key, on) => {
  try {
    localStorage.setItem(key, on ? "1" : "0");
  } catch {
    // storage blocked: the setting lasts this visit
  }
};

const localTime = () => `${new Date().toLocaleString("en-US", { timeZone: "America/New_York", weekday: "long", hour: "numeric", minute: "2-digit" })} ET`;

function statusText(status, handsFree, name) {
  if (status === "listening") return handsFree ? "Listening — just talk. Tap to stop." : "Listening — tap when you're done";
  if (status === "thinking") return `${name} is thinking…`;
  if (status === "speaking") return handsFree ? `${name} is talking — talk to interrupt` : `${name} is talking — tap to interrupt`;
  return handsFree ? "Tap to start a hands-free conversation" : `Tap and talk to ${name}`;
}

let nextId = 1;

export default function DeskTalk({ open, onClose, auth, getSnapshot, terms = [] }) {
  const signedIn = Boolean(auth?.signedIn);
  // useAuthSync hands back a new object on every app render. Anything keyed on it (the speaker
  // below, above all) would be torn down and rebuilt mid-sentence, cutting the voice off, so the
  // token getter is read through a ref and stays the same function for the drawer's lifetime.
  const tokenRef = useRef(auth?.getToken);
  tokenRef.current = auth?.getToken;
  const getToken = useCallback(() => (tokenRef.current ? tokenRef.current() : Promise.resolve(null)), []);

  const [lead, setLead] = useState(DEFAULT_LEAD);
  // One thread per desk lead, so switching from Jack to Mike and back picks up where you were.
  const [threads, setThreads] = useState({});
  const [status, setStatus] = useState("idle");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState("");
  const [setup, setSetup] = useState(null);
  const [speak, setSpeak] = useState(() => stored("overwatch:talk:speak", true));
  const [handsFreePref, setHandsFreePref] = useState(() => stored("overwatch:talk:handsfree", false));

  const cloudListening = Boolean(setup?.stt);
  const handsFree = handsFreePref && cloudListening;
  const voiceSource = setup?.tts ? setup.voices?.[lead] || "none" : "none";
  const cloudVoice = voiceSource !== "none";
  const name = PERSONAS[lead].name;
  const turns = threads[lead] || [];

  const speaker = useRef(null);
  const listener = useRef(null);
  const streamOpen = useRef(false);
  const ignoreReply = useRef(false);
  const pendingInterrupt = useRef(null);
  const pushBuffer = useRef([]);
  const handsFreeRef = useRef(handsFree);
  const lastFiller = useRef(-1);
  const transcriptRef = useRef(null);
  const closeRef = useRef(null);
  handsFreeRef.current = handsFree;

  // What's set up on the server: Claude, the voices, the listening service.
  useEffect(() => {
    if (!open || !signedIn || setup) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const r = await fetch("/api/voice?op=status", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const body = await r.json().catch(() => ({}));
        if (!cancelled) setSetup(r.ok ? body : { chat: false, error: body.error });
      } catch {
        if (!cancelled) setSetup({ chat: false, error: "Couldn't reach the desk." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, signedIn, setup, getToken]);

  const settle = useCallback(() => {
    if (speaker.current?.busy() || streamOpen.current) return;
    setStatus(listener.current && handsFreeRef.current ? "listening" : "idle");
  }, []);

  // A speaker for this lead: their ElevenLabs voice when one is set, a tuned device voice otherwise.
  useEffect(() => {
    speaker.current?.stop();
    const opts = {
      lead,
      getToken,
      onStart: () => setStatus("speaking"),
      onIdle: () => settle(),
      onError: () => setError(`${PERSONAS[lead].name}'s voice didn't load for one sentence. The text is on screen.`),
    };
    speaker.current = cloudVoice ? new CloudSpeaker(opts) : new BrowserSpeaker(opts);
    if (cloudVoice && open) speaker.current.warmFillers(FILLER_COUNT);
  }, [lead, cloudVoice, getToken, settle, open]);

  const micOn = useRef(false);
  const micChime = useCallback((on) => {
    if (micOn.current === on) return;
    micOn.current = on;
    playEarcon(on ? "on" : "off");
  }, []);

  const stopListening = useCallback(() => {
    if (listener.current) micChime(false);
    listener.current?.close();
    listener.current = null;
    setInterim("");
  }, [micChime]);

  // Closing the drawer, or switching leads, stops the voice and lets go of the mic.
  const hush = useCallback(() => {
    speaker.current?.stop();
    stopListening();
    if (streamOpen.current) ignoreReply.current = true;
    setStatus("idle");
  }, [stopListening]);
  useEffect(() => {
    if (!open) hush();
  }, [open, hush]);
  useEffect(() => () => hush(), [hush]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, interim]);

  const updateThread = (forLead, fn) => setThreads((all) => ({ ...all, [forLead]: fn(all[forLead] || []) }));

  function interrupt() {
    const wasSpeaking = speaker.current?.busy() ?? false;
    speaker.current?.stop();
    if (streamOpen.current || wasSpeaking) {
      ignoreReply.current = true;
      pendingInterrupt.current = speaker.current?.lastHeard || "(nothing yet)";
    }
  }

  async function send(text, via) {
    const clean = text.trim();
    if (!clean || !signedIn) return;
    const forLead = lead;
    setError(null);
    // The history the lead sees is the whole of each reply, including any part you cut off.
    const history = (threads[forLead] || []).map((t) => ({ role: t.role === "trader" ? "user" : "assistant", text: `${t.text}${t.unheard}` }));
    const replyId = nextId++;
    updateThread(forLead, (t) => [...t, { id: nextId++, role: "trader", text: clean, unheard: "" }, { id: replyId, role: "lead", text: "", unheard: "" }]);
    setStatus("thinking");
    ignoreReply.current = false;
    if (speaker.current) speaker.current.lastHeard = "";
    const interruptedAfter = pendingInterrupt.current || undefined;
    pendingInterrupt.current = null;

    const update = (fn) => updateThread(forLead, (t) => t.map((x) => (x.id === replyId ? fn(x) : x)));
    // "Speak replies" means every reply, typed or spoken: you opened the desk to hear it.
    const voiced = speak;
    const chunker = new SentenceChunker();
    const say = (s) => {
      if (voiced && !ignoreReply.current) speaker.current?.speak(s);
    };
    streamOpen.current = true;
    let gotText = false;
    const fillerTimer = voiced && cloudVoice
      ? setTimeout(() => {
        if (gotText || ignoreReply.current) return;
        let i = Math.floor(Math.random() * FILLER_COUNT);
        if (i === lastFiller.current) i = (i + 1) % FILLER_COUNT;
        lastFiller.current = i;
        speaker.current?.filler?.(i, "");
      }, FILLER_DELAY_MS)
      : null;

    try {
      const token = await getToken();
      let context = null;
      try {
        context = getSnapshot?.() || null;
      } catch {
        // a snapshot that fails to build just means the lead talks without the board
      }
      const res = await fetch("/api/voice?op=chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ lead: forLead, text: clean, history, context, interruptedAfter, localTime: localTime() }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "The desk couldn't answer just now.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          let event;
          try {
            event = JSON.parse(line);
          } catch {
            continue;
          }
          if (event.type === "text") {
            gotText = true;
            if (ignoreReply.current) update((t) => ({ ...t, unheard: t.unheard + event.text }));
            else {
              update((t) => ({ ...t, text: t.text + event.text }));
              chunker.push(event.text).forEach(say);
            }
          } else if (event.type === "error") {
            setError(event.message);
          }
        }
      }
      chunker.flush().forEach(say);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The desk couldn't answer just now.");
      // An empty reply bubble says nothing useful: drop it.
      updateThread(forLead, (t) => t.filter((x) => x.id !== replyId || x.text || x.unheard));
    } finally {
      if (fillerTimer) clearTimeout(fillerTimer);
      streamOpen.current = false;
      settle();
    }
  }

  async function startListening(continuous) {
    let pushFallback = false;
    setError(null);
    speaker.current?.unlock();
    unlockEarcons();
    pushBuffer.current = [];
    const events = {
      onInterim: (text) => {
        setInterim(text);
        // Hands-free: talking over the lead interrupts (two words, so a cough doesn't).
        if (continuous && text.split(/\s+/).filter(Boolean).length >= 2 && (speaker.current?.busy() || streamOpen.current) && !ignoreReply.current) {
          interrupt();
          setStatus("listening");
        }
      },
      onUtterance: (text) => {
        if (continuous && !pushFallback) {
          if (speaker.current?.busy() || streamOpen.current) interrupt();
          send(text, "voice");
        } else {
          pushBuffer.current.push(text);
        }
      },
      onError: (message) => setError(message),
      onClose: () => {
        listener.current = null;
        micChime(false);
        setInterim("");
        if (!continuous || pushFallback) {
          const text = pushBuffer.current.join(" ").trim();
          pushBuffer.current = [];
          if (text) send(text, "voice");
          else setStatus((s) => (s === "listening" ? "idle" : s));
        } else {
          setStatus((s) => (s === "listening" ? "idle" : s));
        }
      },
    };
    const l = cloudListening ? new DeepgramListener({ events, getToken, terms }) : new BrowserListener({ events });
    listener.current = l;
    setStatus("listening");
    try {
      await l.start();
      micChime(true);
    } catch (err) {
      l.close();
      // Listening service down: fall back to the browser's own recognition, push-to-talk.
      if (cloudListening && browserRecognitionAvailable()) {
        const fallback = new BrowserListener({ events: { ...events, onUtterance: (t) => pushBuffer.current.push(t) } });
        pushFallback = true;
        listener.current = fallback;
        try {
          await fallback.start();
          micChime(true);
          setError("Hands-free listening isn't available right now, so this uses your device's speech recognition. Tap when you're done.");
          return;
        } catch {
          // fall through
        }
      }
      listener.current = null;
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Couldn't start listening.");
    }
  }

  function onMic() {
    if (status === "listening") {
      if (handsFree) {
        stopListening();
        setStatus("idle");
      } else {
        listener.current?.finish();
      }
      return;
    }
    if (status === "speaking" || status === "thinking") {
      // Tap to interrupt, then talk straight away.
      interrupt();
      startListening(handsFree);
      return;
    }
    startListening(handsFree);
  }

  function pickLead(id) {
    if (id === lead) return;
    hush();
    pendingInterrupt.current = null;
    setLead(id);
    setError(null);
  }

  function typed(e) {
    e.preventDefault();
    // Sending is a tap: the one moment phones allow audio to be switched on for what follows.
    speaker.current?.unlock();
    unlockEarcons();
    const text = draft;
    setDraft("");
    if (status === "speaking" || status === "thinking") interrupt();
    send(text, "text");
  }

  if (!open) return null;

  const voiceLabel = voiceSource === "own" ? `${name}'s own voice` : voiceSource === "shared" ? "Shared desk voice" : "Device voice";
  const micSupported = cloudListening || browserRecognitionAvailable();
  const busy = status !== "idle";

  return (
    <>
      <div className="overlay" onClick={onClose} aria-hidden="true" />
      <div className="drawer talk-drawer" role="dialog" aria-modal="true" aria-label="Talk to the desk">
        <div className="talk-head">
          <AudioLines size={16} className="talk-head-icon" />
          <span className="disp talk-title">TALK TO THE DESK</span>
          <button ref={closeRef} className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={onClose} aria-label="Close talk to the desk"><X size={15} /></button>
        </div>

        {!signedIn ? (
          <div className="talk-empty">
            Sign in to talk with the desk. Every lead can talk you through today's board, the thesis and
            the levels that matter — Jack picks up first.
          </div>
        ) : setup && !setup.chat ? (
          <div className="talk-empty">{setup.error || "The desk isn't connected to Claude yet (ANTHROPIC_API_KEY)."}</div>
        ) : (
          <>
            <div className="talk-leads" role="radiogroup" aria-label="Who you're talking to">
              {LEADS.map((id) => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={lead === id}
                  className={`talk-lead${lead === id ? " on" : ""}`}
                  onClick={() => pickLead(id)}
                  title={PERSONAS[id].style}
                >
                  {PERSONAS[id].name}
                  {id === DEFAULT_LEAD && <span className="talk-lead-tag">head trader</span>}
                </button>
              ))}
            </div>
            <div className="talk-style">{PERSONAS[lead].style}</div>

            <div className="talk-transcript" ref={transcriptRef} aria-live="polite">
              {!turns.length && !interim && (
                <div className="talk-hint">
                  {lead === DEFAULT_LEAD
                    ? "Ask Jack where the desk stands — today's call, the levels, what would flip him."
                    : `Ask ${name} how they'd read today's board.`}
                </div>
              )}
              {turns.map((t) => (
                <div key={t.id} className={`talk-turn ${t.role}`}>
                  {t.role === "lead" && <span className="talk-who">{name}</span>}
                  <span className="talk-text">
                    {t.text}
                    {t.unheard && <span className="talk-unheard" title="You cut in here — this part wasn't spoken">{t.unheard}</span>}
                    {t.role === "lead" && !t.text && !t.unheard && <span className="talk-dots" aria-label="thinking">…</span>}
                  </span>
                </div>
              ))}
              {interim && <div className="talk-turn trader interim"><span className="talk-text">{interim}</span></div>}
            </div>

            {error && <div className="talk-error" role="status">{error}</div>}

            <div className="talk-mic-row">
              <button
                className={`talk-mic ${status}`}
                onClick={onMic}
                disabled={!micSupported}
                aria-label={status === "listening" ? (handsFree ? "Stop listening" : "Done talking") : status === "idle" ? `Talk to ${name}` : `Interrupt ${name}`}
              >
                {status === "listening" && !handsFree ? <Square size={22} /> : <Mic size={24} />}
              </button>
              <div className="talk-status">{micSupported ? statusText(status, handsFree, name) : "Voice input isn't available in this browser — type below."}</div>
            </div>

            <form className="talk-type" onSubmit={typed}>
              <input
                className="bd-in"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Or type to ${name}…`}
                aria-label={`Message ${name}`}
                maxLength={4000}
              />
              <button className="btn btn-sm" type="submit" disabled={!draft.trim()} aria-label="Send"><Send size={14} /></button>
            </form>

            <div className="talk-prefs">
              <label><input type="checkbox" checked={speak} onChange={(e) => { setSpeak(e.target.checked); store("overwatch:talk:speak", e.target.checked); if (!e.target.checked) speaker.current?.stop(); }} /> Speak replies</label>
              {cloudListening && (
                <label><input type="checkbox" checked={handsFreePref} disabled={busy} onChange={(e) => { setHandsFreePref(e.target.checked); store("overwatch:talk:handsfree", e.target.checked); }} /> Hands-free</label>
              )}
              <span className="talk-voice" title={voiceSource === "none" ? "Add an ElevenLabs voice for this lead to hear them in their own voice" : undefined}>{voiceLabel}</span>
              {turns.length > 0 && (
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => { hush(); updateThread(lead, () => []); }}>
                  <RotateCcw size={12} /> New conversation
                </button>
              )}
            </div>
            <div className="talk-foot">Market commentary from fictional desk characters — not financial advice.</div>
          </>
        )}
      </div>
    </>
  );
}

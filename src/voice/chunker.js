// Splits a streamed reply into speakable sentences so the first one can play while the rest is
// still being written. Ported from Barnabas.
export class SentenceChunker {
  constructor() {
    this.buffer = "";
  }

  /** Add streamed text; returns any sentences that are now complete. */
  push(text) {
    this.buffer += text;
    const out = [];
    const re = /[^.!?\n]+(?:[.!?]+["'”’)\]]*|\n+)/g;
    let match;
    let consumed = 0;
    while ((match = re.exec(this.buffer))) {
      const end = match.index + match[0].length;
      // A mark only ends a sentence when whitespace follows: "5,850.25" and "U.S." stay whole.
      const next = this.buffer[end];
      if (next !== undefined && !/\s/.test(next)) continue;
      // Check the text up to the cut, not just this match: in "U.S." the match is only "S.".
      if (/\b(Dr|Mr|Mrs|Ms|St|Jr|Sr|vs|e\.g|i\.e|U\.S|approx|est)\.$/i.test(this.buffer.slice(0, end).trimEnd())) continue;
      if (next === undefined) break; // wait to see what follows
      const sentence = this.buffer.slice(consumed, end).trim();
      if (sentence) out.push(sentence);
      consumed = end;
    }
    this.buffer = this.buffer.slice(consumed);
    return out;
  }

  /** Whatever is left at the end of the reply. */
  flush() {
    const rest = this.buffer.trim();
    this.buffer = "";
    return rest ? [rest] : [];
  }
}

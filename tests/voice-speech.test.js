import { describe, expect, it } from "vitest";
import { levelWords, normalizeForSpeech as say } from "../src/voice/normalize.js";
import { SentenceChunker } from "../src/voice/chunker.js";

describe("speaking like a trader", () => {
  it.each([
    [5850, "fifty-eight fifty"],
    [5800, "fifty-eight hundred"],
    [5805, "fifty-eight oh five"],
    [5000, "five thousand"],
    [6500, "sixty-five hundred"],
    [21450, "twenty-one four fifty"],
    [21405, "twenty-one four oh five"],
    [21400, "twenty-one four hundred"],
    [21000, "twenty-one thousand"],
    [21050, "twenty-one thousand fifty"],
  ])("says %i as %s", (n, words) => {
    expect(levelWords(n)).toBe(words);
  });

  it.each([
    ["The S&P is holding 5,850.", "The S and P is holding fifty-eight fifty."],
    ["NDX tagged 21,450.75 overnight.", "N D X tagged twenty-one four fifty point seven five overnight."],
    ["SPX +1.25% on the day.", "S P X up one point two five percent on the day."],
    ["Small caps (-0.8%) lagged.", "Small caps (down zero point eight percent) lagged."],
    ["Yields rose 12bps.", "Yields rose twelve basis points."],
    ["The 10-year moved 1bp.", "The 10-year moved one basis point."],
    ["NVDA and QQQ led.", "Nvidia and the Q's led."],
    ["Volume hit 1,250,000 contracts.", "Volume hit one million two hundred fifty thousand contracts."],
    ["FOMC at 2:00pm ET.", "F O M C at two P M Eastern."],
    ["Cash opens 9:30 ET.", "Cash opens nine thirty Eastern."],
    ["Buybacks topped $2.5B.", "Buybacks topped two point five billion dollars."],
    ["Premium was $1,200.", "Premium was twelve hundred dollars."],
    ["DXY vs. TLT is the tell.", "D X Y versus T L T is the tell."],
    ["Support ~5,800 -> 5,750.", "Support about fifty-eight hundred to fifty-seven fifty."],
    ["**Lean long** into CPI.", "Lean long into C P I."],
  ])("%s", (input, spoken) => {
    expect(say(input)).toBe(spoken);
  });

  it("leaves ordinary words and fillers alone", () => {
    expect(say("Mm. Okay, the tape is heavy.")).toBe("Mm. Okay, the tape is heavy.");
    expect(say("I think VIX is cheap.")).toBe("I think VIX is cheap.");
  });
});

describe("sentence chunking", () => {
  const run = (parts) => {
    const c = new SentenceChunker();
    const out = parts.flatMap((p) => c.push(p));
    return [...out, ...c.flush()];
  };

  it("emits whole sentences as they complete", () => {
    expect(run(["The tape ", "is heavy. Size ", "down. ", "Wait for 58", "50."])).toEqual(["The tape is heavy.", "Size down.", "Wait for 5850."]);
  });

  it("doesn't split decimals, index levels or abbreviations", () => {
    expect(run(["S&P at 5,850.25 is key. U.S. yields matter vs. the dollar. Done."]))
      .toEqual(["S&P at 5,850.25 is key.", "U.S. yields matter vs. the dollar.", "Done."]);
  });

  it("waits to see what follows a mark before cutting", () => {
    const c = new SentenceChunker();
    expect(c.push("Holding 5.")).toEqual([]);
    expect(c.push("85 for now. Next")).toEqual(["Holding 5.85 for now."]);
    expect(c.flush()).toEqual(["Next"]);
  });
});

describe("edge cases found while building", () => {
  it("doesn't read the start of a word as am/pm", () => {
    expect(say("Futures bounced at 9:30 amid the selling.")).toBe("Futures bounced at nine thirty amid the selling.");
  });
  it("keeps e.g. whole", () => {
    const c = new SentenceChunker();
    expect([...c.push("Use a tight stop, e.g. below the open. Then wait. "), ...c.flush()]).toEqual(["Use a tight stop, e.g. below the open.", "Then wait."]);
  });
});

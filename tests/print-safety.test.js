import { describe, expect, it } from "vitest";
import { buildThesisPrintHTML } from "../src/App.jsx";

describe("thesis print document", () => {
  it("renders restored cloud fields as text rather than active markup", () => {
    const attack = `</p><script>globalThis.__printPwned = true</script><img src=x onerror=alert(1)>`;
    const html = buildThesisPrintHTML({
      bias: "bullish",
      score: 200,
      conviction: 99,
      instrument: attack,
      headline: attack,
      summary: attack,
      deskRead: attack,
      _personaName: attack,
      _deskStructures: [attack],
      drivers: [attack],
      bullCase: [attack],
      bearCase: [attack],
      levels: { action: attack, upside: attack, downside: attack },
      gamePlan: attack,
      invalidation: attack,
      standAside: attack,
    });

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Score: <b style=\"color:#22c55e\">+100</b>");
    expect(html).toContain("Conviction 10/10");
  });
});

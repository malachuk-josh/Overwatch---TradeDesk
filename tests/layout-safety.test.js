import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/styles.css"), "utf8");
const app = readFileSync(join(root, "src/App.jsx"), "utf8");

// Strip comments so prose describing a hazard never trips (or masks) these checks.
const cssCode = css.replace(/\/\*[\s\S]*?\*\//g, "");
const appCode = app.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

// The mobile bottom nav has torn loose from the bottom of the screen more than once. Every way that
// happens is a variant of one rule: a position:fixed element is only pinned to the viewport while
// nothing above it in the tree hijacks it. These tests pin down each of those escape routes so a
// regression fails here instead of on someone's phone.
describe("mobile bottom nav stays pinned to the viewport", () => {
  it("keeps overflow off html and body", () => {
    // overflow on the root/body makes iOS Safari treat it as a scroll container, and its
    // position:fixed children stop tracking the viewport. Guard horizontal overflow on .bd-root.
    const rootBlocks = [...cssCode.matchAll(/(^|\})\s*([^{}]*\b(?:html|body)\b[^{}]*)\{([^}]*)\}/g)]
      .filter((m) => m[2].split(",").some((sel) => /^\s*(html|body)\s*$/.test(sel)))
      .map((m) => m[3]);
    expect(rootBlocks.length).toBeGreaterThan(0);
    for (const decls of rootBlocks) {
      expect(decls).not.toMatch(/(^|;)\s*overflow(-x|-y)?\s*:/);
    }
  });

  it("renders the nav through a portal to document.body", () => {
    // Outside .bd-root nothing the app tree grows later — a transform, filter, backdrop-filter,
    // perspective, contain, will-change or container-type — can become its containing block.
    expect(appCode).toMatch(/createPortal\(\s*\n?\s*<div className=\{?`?bd-bottom-nav/);
    expect(appCode).toMatch(/bd-bottom-nav[\s\S]{0,900}?document\.body,?\s*\)/);
  });

  it("pins the nav with position:fixed anchored to the bottom", () => {
    const block = cssCode.match(/(^|\})\s*\.bd-bottom-nav\s*\{([^}]*)\}/);
    expect(block).not.toBeNull();
    expect(block[2]).toMatch(/position\s*:\s*fixed/);
    expect(block[2]).toMatch(/bottom\s*:/);
  });

  it("keeps the portaled nav on the light-theme token set", () => {
    // The nav is not inside .bd-root, so it must be named directly on the light token block or it
    // silently falls back to the dark palette in light mode.
    const lightTokens = cssCode.match(/([^{}]*)\{[^}]*--glass\s*:\s*rgba\(255,255,255[^}]*\}/g) || [];
    expect(lightTokens.some((b) => /\.bd-bottom-nav\.light/.test(b))).toBe(true);
    // ...and no nav rule may depend on being a descendant of .bd-root any more.
    expect(cssCode).not.toMatch(/\.bd-root[^,{]*\s+\.bd-(bottom-nav|bnav)/);
  });
});

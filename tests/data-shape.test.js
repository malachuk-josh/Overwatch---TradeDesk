import { describe, expect, it } from "vitest";
import { sanitizeArchive, sanitizeEntry } from "../src/dataShape.js";

// Regression guard for the #414 white-screen: an archive/research entry written by an older app
// version could carry a field of the wrong type (an array field stored as a string, a nested object
// stored as a string, etc.). The UI dereferences those directly (`.map`, `.length`, `.action`), so a
// bad shape threw during render and — with no error boundary — blanked the whole app. sanitizeEntry
// coerces every entry to a render-safe shape on ingest; these tests lock that behavior in.
describe("archive/research entry shape guard", () => {
  it("coerces array fields that were stored as scalars", () => {
    const out = sanitizeEntry({ _id: "1", bullCase: "a single string", bearCase: null, risks: undefined });
    expect(Array.isArray(out.bullCase)).toBe(true);
    expect(out.bullCase).toEqual(["a single string"]);
    expect(out.bearCase).toEqual([]);
    expect(out.risks).toEqual([]);
  });

  it("coerces truthy wrong-type object fields, leaves nullish ones falsy", () => {
    const out = sanitizeEntry({ _id: "1", levels: "1234", _outcome: [], stance: null });
    expect(typeof out.levels).toBe("object");
    expect(Array.isArray(out.levels)).toBe(false); // string -> {}
    expect(typeof out._outcome).toBe("object");    // array -> {}
    expect(Array.isArray(out._outcome)).toBe(false);
    expect(out.stance).toBeFalsy();                // null stays null (render already guards falsy)
  });

  it("leaves already-valid entries untouched", () => {
    const good = { _id: "1", bias: "bullish", bullCase: ["x"], levels: { action: "1", upside: "2" }, score: 40 };
    expect(sanitizeEntry(good)).toEqual(good);
  });

  it("sanitizes a nested thesis inside a newsletter wrapper", () => {
    const out = sanitizeEntry({ _type: "newsletter", _thesis: { bullCase: "one", levels: "x" } });
    expect(out._thesis.bullCase).toEqual(["one"]);
    expect(typeof out._thesis.levels).toBe("object");
  });

  it("drops non-object entries instead of passing them to the render", () => {
    expect(sanitizeArchive([null, "junk", 42, { _id: "1" }, undefined])).toEqual([{ _id: "1" }]);
  });

  it("returns an empty array for a non-array input", () => {
    expect(sanitizeArchive(null)).toEqual([]);
    expect(sanitizeArchive({ not: "an array" })).toEqual([]);
    expect(sanitizeArchive("nope")).toEqual([]);
  });

  it("never throws on adversarial input", () => {
    const nasty = { bullCase: 5, catalysts: { a: 1 }, levels: 7, _thesis: "str", _trade: true, headlines: "h" };
    expect(() => sanitizeEntry(nasty)).not.toThrow();
    const out = sanitizeEntry(nasty);
    expect(Array.isArray(out.bullCase)).toBe(true);
    expect(Array.isArray(out.catalysts)).toBe(true);
    expect(Array.isArray(out.headlines)).toBe(true);
  });
});

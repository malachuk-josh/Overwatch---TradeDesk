// Ingest-side shape guards for stored/synced account data. Old accounts carry archive and research
// entries written by earlier app versions; if a field the UI calls .map()/.length/.action on is the
// wrong type (or a nested object is missing), the render throws — and, without an error boundary,
// that took the whole app down (the #414 regression). Normalizing entries here guarantees the render
// can't dereference a bad shape. Kept dependency-free so it's unit-testable in the node test env.

// Fields the UI iterates with array methods — must always be arrays.
export const ARR_FIELDS = ["bullCase", "bearCase", "keyFindings", "catalysts", "risks", "_sources", "sources", "_deskStructures", "_tradeStructures", "headlines"];
// Fields the UI reads nested properties off — must be plain objects (or absent).
export const OBJ_FIELDS = ["levels", "stance", "_outcome", "_trade", "_thesis", "vix"];

export const sanitizeEntry = (entry) => {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  const out = { ...entry };
  for (const f of ARR_FIELDS) {
    if (f in out && !Array.isArray(out[f])) {
      out[f] = out[f] == null ? [] : [].concat(out[f]).filter((x) => x != null);
    }
  }
  for (const f of OBJ_FIELDS) {
    if (f in out && (typeof out[f] !== "object" || Array.isArray(out[f]))) {
      out[f] = out[f] == null ? undefined : {};
    }
  }
  // A newsletter wrapper nests the real thesis under _thesis — sanitize it too.
  if (out._thesis && typeof out._thesis === "object" && !Array.isArray(out._thesis)) {
    out._thesis = sanitizeEntry(out._thesis);
  }
  return out;
};

export const sanitizeArchive = (list) => (Array.isArray(list) ? list.map(sanitizeEntry).filter(Boolean) : []);

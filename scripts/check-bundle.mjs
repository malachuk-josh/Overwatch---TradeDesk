import { readdir, readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const DIST = new URL("../dist/", import.meta.url);
const ASSETS = new URL("assets/", DIST);
const MAX_SINGLE_JS_BYTES = 350 * 1024;
const MAX_TOTAL_JS_BYTES = 650 * 1024;
const MAX_TOTAL_GZIP_BYTES = 200 * 1024;

const formatKiB = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

await stat(new URL("index.html", DIST)).catch(() => {
  throw new Error("dist/index.html is missing; run `npm run build` before the bundle check");
});

const files = (await readdir(ASSETS)).filter((file) => file.endsWith(".js"));
if (!files.length) throw new Error("The production build contains no JavaScript assets");

const measurements = await Promise.all(files.map(async (file) => {
  const bytes = await readFile(new URL(file, ASSETS));
  return { file, raw: bytes.byteLength, gzip: gzipSync(bytes, { level: 9 }).byteLength };
}));

const totalRaw = measurements.reduce((sum, item) => sum + item.raw, 0);
const totalGzip = measurements.reduce((sum, item) => sum + item.gzip, 0);
const largest = measurements.reduce((current, item) => item.raw > current.raw ? item : current);

const failures = [];
if (largest.raw > MAX_SINGLE_JS_BYTES) {
  failures.push(`${largest.file} is ${formatKiB(largest.raw)} raw (limit ${formatKiB(MAX_SINGLE_JS_BYTES)})`);
}
if (totalRaw > MAX_TOTAL_JS_BYTES) {
  failures.push(`total JavaScript is ${formatKiB(totalRaw)} raw (limit ${formatKiB(MAX_TOTAL_JS_BYTES)})`);
}
if (totalGzip > MAX_TOTAL_GZIP_BYTES) {
  failures.push(`total JavaScript is ${formatKiB(totalGzip)} gzip (limit ${formatKiB(MAX_TOTAL_GZIP_BYTES)})`);
}

console.log(`Bundle check: ${files.length} JS asset(s), ${formatKiB(totalRaw)} raw, ${formatKiB(totalGzip)} gzip`);
if (failures.length) throw new Error(`Bundle budget exceeded:\n- ${failures.join("\n- ")}`);

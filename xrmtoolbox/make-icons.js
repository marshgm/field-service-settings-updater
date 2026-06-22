/**
 * Generates the XrmToolBox tile icons (32x32 + 80x80) as base64 PNGs and writes
 * FieldServiceSettingsUpdater/IconData.cs. Also writes ../logo.png (80x80) for the
 * NuGet iconUrl. Pure Node (zlib only) — no native deps, no external tools.
 *
 * Motif: Proximo3-red rounded square + white cog with a clock face (settings + work hours).
 * Run:  node make-icons.js
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function makeIcon(size) {
  const px = new Uint8Array(size * size * 4); // RGBA
  const set = (x, y, r, g, b, a) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    // simple alpha-over composite onto existing pixel
    const sa = a / 255, da = px[i + 3] / 255, oa = sa + da * (1 - sa);
    if (oa === 0) return;
    px[i]     = Math.round((r * sa + px[i]     * da * (1 - sa)) / oa);
    px[i + 1] = Math.round((g * sa + px[i + 1] * da * (1 - sa)) / oa);
    px[i + 2] = Math.round((b * sa + px[i + 2] * da * (1 - sa)) / oa);
    px[i + 3] = Math.round(oa * 255);
  };
  const S = size;
  const red = [238, 22, 59], white = [255, 255, 255];
  const cx = S * 0.5, cy = S * 0.54;
  const rOuter = S * 0.30, rTeeth = S * 0.40, rInner = S * 0.135;
  const radius = S * 0.18; // corner radius for rounded square

  // person silhouette inside the cog hole (resource + settings)
  const headX = cx, headY = S * 0.4375, headR = S * 0.088;
  const shX = cx, shY = S * 0.66, shR = S * 0.165;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      // rounded-square red background with 1px transparent margin
      const m = 1;
      let inside = x >= m && y >= m && x < S - m && y < S - m;
      if (inside) {
        const rx = Math.min(x - m, S - m - 1 - x), ry = Math.min(y - m, S - m - 1 - y);
        if (rx < radius && ry < radius) {
          const dx = radius - rx, dy = radius - ry;
          if (dx * dx + dy * dy > radius * radius) inside = false;
        }
      }
      if (!inside) continue;
      set(x, y, red[0], red[1], red[2], 255);

      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ang = Math.atan2(dy, dx);
      // cog: white disc out to rOuter, plus 8 teeth out to rTeeth
      const tooth = Math.cos(ang * 8) > 0.35;
      if (dist <= rOuter || (dist <= rTeeth && tooth)) set(x, y, white[0], white[1], white[2], 255);
      // inner hole shows red again
      if (dist <= rInner * 1.7) set(x, y, red[0], red[1], red[2], 255);
      // white person in the hole: head circle + shoulders dome (top half of a circle)
      const head = Math.hypot(x + 0.5 - headX, y + 0.5 - headY) <= headR;
      const sh = (Math.hypot(x + 0.5 - shX, y + 0.5 - shY) <= shR) && (y + 0.5 <= shY);
      if (head || sh) set(x, y, white[0], white[1], white[2], 255);
    }
  }

  return encodePng(px, S, S);
}

function encodePng(rgba, w, h) {
  // build raw image data with per-row filter byte 0
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.subarray(y * w * 4, (y + 1) * w * 4).forEach((b, i) => { raw[y * (w * 4 + 1) + 1 + i] = b; });
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const body = Buffer.concat([t, data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0, 0);
    return Buffer.concat([len, body, crc]);
  };
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0; // 8-bit RGBA
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

let CRC_TABLE;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = [];
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC_TABLE[n] = c >>> 0; }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return crc ^ 0xffffffff;
}

const png32 = makeIcon(32), png80 = makeIcon(80);
const b32 = png32.toString("base64"), b80 = png80.toString("base64");

const cs = `namespace FieldServiceSettingsUpdater
{
    /// <summary>
    /// Base64-encoded PNG icons for the XrmToolBox tool tile (32x32 small, 80x80 big).
    /// Generated from make-icons.js (Proximo3-red person-in-a-cog). Do not hand-edit.
    /// </summary>
    internal static class IconData
    {
        public const string Small =
            "${b32}";

        public const string Big =
            "${b80}";
    }
}
`;
fs.writeFileSync(path.join(__dirname, "FieldServiceSettingsUpdater", "IconData.cs"), cs);
fs.writeFileSync(path.join(__dirname, "..", "logo.png"), png80);
fs.writeFileSync(path.join(__dirname, "icon32.png"), png32);
fs.writeFileSync(path.join(__dirname, "icon80.png"), png80);

// ---- Monochrome theme-aware SVG for the PPTB tile (must use fill="currentColor"). ----
// Same person-in-cog motif as a single-colour glyph: a toothed gear ring (hole cut via
// evenodd) with a person silhouette in the hole. PPTB tints it to the active theme.
const CX = 40, CY = 40, TEETH = 10, R_TIP = 35, R_ROOT = 28, HOLE = 15;
const pts = [];
for (let i = 0; i < TEETH * 2; i++) {
  const a = Math.PI * i / TEETH - Math.PI / 2;
  const r = (i % 2 === 0) ? R_TIP : R_ROOT;
  pts.push([(CX + r * Math.cos(a)).toFixed(2), (CY + r * Math.sin(a)).toFixed(2)]);
}
const gearOuter = "M" + pts.map((p, i) => (i ? "L" : "") + p[0] + "," + p[1]).join(" ") + " Z";
const gearHole = `M${CX - HOLE},${CY} a${HOLE},${HOLE} 0 1,0 ${2 * HOLE},0 a${HOLE},${HOLE} 0 1,0 ${-2 * HOLE},0 Z`;
const person = "M34,33 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0 Z M30,50 a10,10 0 0 1 20,0 Z";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="currentColor" role="img" aria-label="Field Service Resource Updater">
  <path fill-rule="evenodd" d="${gearOuter} ${gearHole}"/>
  <path d="${person}"/>
</svg>
`;
fs.writeFileSync(path.join(__dirname, "..", "icon.svg"), svg);

console.log("Wrote IconData.cs, ../logo.png, ../icon.svg (currentColor), icon32.png, icon80.png");
console.log("  32px base64 length:", b32.length, " 80px:", b80.length);

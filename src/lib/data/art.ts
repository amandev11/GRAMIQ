/**
 * Generated SVG art — data-URI images so React Bits galleries never depend on
 * external image hosts staying reachable. Every tile is a themed gradient
 * with a glyph + label, consistent with GRAMIQ's cool teal/sky palette.
 */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface ArtOpts {
  w?: number;
  h?: number;
  from?: string;
  to?: string;
  glyph?: string;
  label?: string;
  sub?: string;
}

export function artTile({
  w = 800,
  h = 1000,
  from = "#0ea5e9",
  to = "#115e59",
  glyph = "✦",
  label = "",
  sub = "",
}: ArtOpts): string {
  const glyphSize = Math.round(h * (glyph.length > 2 ? 0.16 : 0.26));
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/>` +
    `</linearGradient></defs>` +
    `<rect width='${w}' height='${h}' fill='url(#g)'/>` +
    `<circle cx='${w * 0.82}' cy='${h * 0.14}' r='${w * 0.18}' fill='rgba(255,255,255,0.10)'/>` +
    `<circle cx='${w * 0.12}' cy='${h * 0.86}' r='${w * 0.24}' fill='rgba(255,255,255,0.07)'/>` +
    `<text x='50%' y='40%' font-size='${glyphSize}' text-anchor='middle' dominant-baseline='middle'>${esc(glyph)}</text>` +
    (label
      ? `<text x='50%' y='66%' font-size='${Math.round(h * 0.052)}' fill='rgba(255,255,255,0.96)' font-family='sans-serif' font-weight='700' letter-spacing='6' text-anchor='middle'>${esc(label)}</text>`
      : "") +
    (sub
      ? `<text x='50%' y='73%' font-size='${Math.round(h * 0.03)}' fill='rgba(255,255,255,0.72)' font-family='sans-serif' letter-spacing='2' text-anchor='middle'>${esc(sub)}</text>`
      : "") +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Square avatar with initials on a gradient. */
export function artAvatar(initials: string): string {
  return artTile({
    w: 400,
    h: 400,
    from: "#0d9488",
    to: "#0369a1",
    glyph: initials,
    label: "",
  });
}

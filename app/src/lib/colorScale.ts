// Sequential "color nodes by" ramp for the heat-map ("traffic" / "score" /
// "opportunity") mode. One hue (NuBlue's own brand blue), monotone light -> dark,
// validated with the dataviz skill's palette validator:
//   node validate_palette.js "#5AA8E6,#2E70A8,#1D3E68,#151A42" --mode light --ordinal --surface "#F1F1F1"
//   -> ALL CHECKS PASS
const RAMP = ['#5AA8E6', '#2E70A8', '#1D3E68', '#151A42'] as const;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/** t in [0, 1], low -> high. Returns a hex color from the validated ramp. */
export function sequentialColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const segments = RAMP.length - 1;
  const scaled = clamped * segments;
  const i = Math.min(segments - 1, Math.floor(scaled));
  const localT = scaled - i;
  const [r1, g1, b1] = hexToRgb(RAMP[i]);
  const [r2, g2, b2] = hexToRgb(RAMP[i + 1]);
  const r = lerp(r1, r2, localT);
  const g = lerp(g1, g2, localT);
  const b = lerp(b1, b2, localT);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Text color that stays readable on top of a sequentialColor() fill. */
export function textOnSequential(t: number): string {
  return t > 0.55 ? '#FFFFFF' : '#151A42';
}

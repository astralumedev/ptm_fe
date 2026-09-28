/** "#3b82f6" / "#38f" -> [r, g, b]; unknown input gives a neutral grey. */
export function hexRgb(hex: string): [number, number, number] {
  let h = String(hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(n)) return [107, 114, 128];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

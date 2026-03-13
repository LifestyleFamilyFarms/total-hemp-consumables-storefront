/**
 * Minimal 2D value noise for organic particle movement.
 * Not a full simplex implementation — uses smooth interpolation
 * of pseudo-random gradients, which is sufficient for visual drift.
 */

const PERM_SIZE = 256
const perm: number[] = []

for (let i = 0; i < PERM_SIZE; i++) perm[i] = i
for (let i = PERM_SIZE - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[perm[i], perm[j]] = [perm[j], perm[i]]
}
for (let i = 0; i < PERM_SIZE; i++) perm[PERM_SIZE + i] = perm[i]

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a)
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3
  const u = h < 2 ? x : y
  const v = h < 2 ? y : x
  return (h & 1 ? -u : u) + (h & 2 ? -v : v)
}

export function noise2D(x: number, y: number): number {
  const xi = Math.floor(x) & (PERM_SIZE - 1)
  const yi = Math.floor(y) & (PERM_SIZE - 1)
  const xf = x - Math.floor(x)
  const yf = y - Math.floor(y)

  const u = fade(xf)
  const v = fade(yf)

  const aa = perm[perm[xi] + yi]
  const ab = perm[perm[xi] + yi + 1]
  const ba = perm[perm[xi + 1] + yi]
  const bb = perm[perm[xi + 1] + yi + 1]

  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v
  )
}

// Global ray directions. The chapter fixes them to a quasi-Monte Carlo sequence so they "do not
// change in time", which is what keeps the converged image from flickering. Halton (2, 3) is used
// rather than Hammersley because any prefix of it is already well spread over the sphere, so the
// picture is usable after a handful of bundles instead of only once the whole set has been traced.

export const getRadicalInverse = (index, base) => {
  let result = 0
  let fraction = 1 / base
  let remaining = index
  while (remaining > 0) {
    result += (remaining % base) * fraction
    remaining = Math.floor(remaining / base)
    fraction /= base
  }
  return result
}

export const getBundleDirection = (index, target) => {
  const z = 1 - 2 * getRadicalInverse(index + 1, 2)
  const phi = 2 * Math.PI * getRadicalInverse(index + 1, 3)
  const ring = Math.sqrt(Math.max(0, 1 - z * z))
  return target.set(ring * Math.cos(phi), z, ring * Math.sin(phi))
}

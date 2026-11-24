export const MAX_SHOOTERS = 64

const luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b

export const createSelection = () => ({
  indices: new Int32Array(MAX_SHOOTERS),
  powers: new Float32Array(MAX_SHOOTERS),
  count: 0,
  limit: MAX_SHOOTERS
})

export const createResidualSummary = () => ({ energy: [0, 0, 0], power: 0, maxPower: 0 })

// Keeps the strongest `limit` candidates sorted, strongest first.
const insertCandidate = (selection, cell, power) => {
  const { indices, powers, limit } = selection
  if (selection.count === limit && power <= powers[limit - 1]) return
  let slot = selection.count < limit ? selection.count++ : limit - 1
  while (slot > 0 && powers[slot - 1] < power) {
    powers[slot] = powers[slot - 1]
    indices[slot] = indices[slot - 1]
    slot--
  }
  powers[slot] = power
  indices[slot] = cell
}

// The chapter keeps the single most powerful element with a depth test on 1 / power and stops
// once nothing passes a threshold. Shooting a batch per pass instead, the CPU keeps the top
// `limit` cells of the read-back block means. Power is mean residual × block area.
export const scanResidual = ({ cells, pixels, selection, summary, limit, minPower }) => {
  selection.count = 0
  selection.limit = Math.min(Math.max(limit, 1), MAX_SHOOTERS)
  summary.energy.fill(0)
  summary.power = 0
  summary.maxPower = 0

  for (let cell = 0; cell < cells.count; cell++) {
    const offset = cells.gridIndex[cell] * 4
    const area = cells.area[cell]
    const r = pixels[offset] * area
    const g = pixels[offset + 1] * area
    const b = pixels[offset + 2] * area
    const power = luminance(r, g, b)
    summary.energy[0] += r
    summary.energy[1] += g
    summary.energy[2] += b
    summary.power += power
    summary.maxPower = Math.max(summary.maxPower, power)
    if (power > minPower) insertCandidate(selection, cell, power)
  }
  return summary
}

// Cohen et al.'s ambient term: the unshot energy spread over the scene and bounced by the
// mean reflectance, so early iterations already look close to the converged image.
export const computeAmbient = ({ summary, totalArea, reflectance, target }) => {
  const [r, g, b] = summary.energy.map(
    (energy, channel) => energy / totalArea / Math.max(1 - reflectance[channel], 0.05)
  )
  return target.set(r, g, b)
}

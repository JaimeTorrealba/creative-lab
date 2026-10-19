const COLLISION_MARGIN = 0.04
const DFTL_DAMPING = 0.9

// Bend is a soft pose force, not a hard constraint, so it runs once per substep. Inside the
// iteration loop it compounds to ~1-(1-s)^iterations per step, which straightens every strand
// into a rigid spike and buries gravity entirely — that is what turned the hair into a
// dandelion before.
export const applyBend = ({ pos, restLen, guideCount, segments }, stiffness) => {
  for (let g = 0; g < guideCount; g++) {
    const base = g * segments * 3

    for (let i = 2; i < segments; i++) {
      const k = base + i * 3
      const p = k - 3
      const pp = k - 6
      let ax = pos[p] - pos[pp]
      let ay = pos[p + 1] - pos[pp + 1]
      let az = pos[p + 2] - pos[pp + 2]
      const l = Math.sqrt(ax * ax + ay * ay + az * az) || 1e-6
      const rest = restLen[g * segments + i]
      ax = pos[p] + (ax / l) * rest
      ay = pos[p + 1] + (ay / l) * rest
      az = pos[p + 2] + (az / l) * rest

      pos[k] += (ax - pos[k]) * stiffness
      pos[k + 1] += (ay - pos[k + 1]) * stiffness
      pos[k + 2] += (az - pos[k + 2]) * stiffness
    }
  }
}

// Hard constraints, iterated to convergence: segment length, then head collision.
export const solveConstraints = (state, iterations, headRadius, hx, hy, hz) => {
  const { pos, prev, restLen, guideCount, segments } = state
  const minR = headRadius + COLLISION_MARGIN

  for (let iter = 0; iter < iterations; iter++) {
    for (let g = 0; g < guideCount; g++) {
      const base = g * segments * 3

      // Root outward, child-only correction. That keeps the strand rigidly attached to the
      // scalp and lets corrections propagate down the chain in one sweep.
      for (let i = 1; i < segments; i++) {
        const k = base + i * 3
        const p = k - 3
        const dx = pos[k] - pos[p]
        const dy = pos[k + 1] - pos[p + 1]
        const dz = pos[k + 2] - pos[p + 2]
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6
        const diff = (len - restLen[g * segments + i]) / len

        pos[k] -= dx * diff
        pos[k + 1] -= dy * diff
        pos[k + 2] -= dz * diff

        // Plain follow-the-leader turns every correction into velocity and pumps energy into
        // the chain — the hair never settles. DFTL (Müller 2012) cancels it by feeding the
        // child's correction back into the parent's velocity; in Verlet that lives in prev.
        if (i > 1) {
          prev[p] -= dx * diff * DFTL_DAMPING
          prev[p + 1] -= dy * diff * DFTL_DAMPING
          prev[p + 2] -= dz * diff * DFTL_DAMPING
        }
      }

      // With a single sphere the paper's pearl configuration of per-particle collision spheres
      // collapses to one push-out per particle.
      for (let i = 1; i < segments; i++) {
        const k = base + i * 3
        const dx = pos[k] - hx
        const dy = pos[k + 1] - hy
        const dz = pos[k + 2] - hz
        const d2 = dx * dx + dy * dy + dz * dz

        if (d2 < minR * minR) {
          const len = Math.sqrt(d2) || 1e-6
          const s = minR / len
          pos[k] = hx + dx * s
          pos[k + 1] = hy + dy * s
          pos[k + 2] = hz + dz * s
        }
      }
    }
  }
}

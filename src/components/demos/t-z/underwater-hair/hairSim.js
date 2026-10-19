import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  DynamicDrawUsage,
  FloatType,
  NearestFilter,
  RGBAFormat
} from 'three'
import { createNoise3D } from 'simplex-noise'
import { applyBend, solveConstraints } from './hairConstraints'

const FIXED_DT = 1 / 60
const MAX_SUBSTEPS = 3
const SETTLE_STEPS = 180

// Verlet solver for the control hairs. Everything lives in flat typed arrays and the inner
// loops allocate nothing — this runs every frame for guideCount * segments particles.
export const createHairSim = ({ roots, guideCount, segments, hairLength, headRadius }) => {
  const count = guideCount * segments
  const pos = new Float32Array(count * 3)
  const prev = new Float32Array(count * 3)
  const force = new Float32Array(count * 3)
  const restLen = new Float32Array(count)
  const noise3D = createNoise3D()

  // Segments grow toward the tip so long hair costs few particles, as the paper specifies.
  const weights = new Float32Array(segments)
  let weightTotal = 0
  for (let i = 1; i < segments; i++) {
    weights[i] = 1 + 1.6 * ((i - 1) / Math.max(1, segments - 2))
    weightTotal += weights[i]
  }

  for (let g = 0; g < guideCount; g++) {
    const lengthScale = 0.82 + Math.random() * 0.36
    for (let i = 1; i < segments; i++) {
      restLen[g * segments + i] = (weights[i] / weightTotal) * hairLength * lengthScale
    }
  }

  const state = { pos, prev, restLen, guideCount, segments }

  const data = new Float32Array(count * 4)
  const texture = new DataTexture(data, segments, guideCount, RGBAFormat, FloatType)
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true

  const reset = (hx, hy, hz, params) => {
    for (let g = 0; g < guideCount; g++) {
      const nx = roots[g * 3 + 0]
      const ny = roots[g * 3 + 1]
      const nz = roots[g * 3 + 2]

      let px = hx + nx * headRadius
      let py = hy + ny * headRadius
      let pz = hz + nz * headRadius
      let dx = nx
      let dy = ny
      let dz = nz

      const base = g * segments * 3
      pos[base] = px
      pos[base + 1] = py
      pos[base + 2] = pz

      for (let i = 1; i < segments; i++) {
        // Bend the growth direction toward vertical so the initial pose already drapes.
        dx += -dx * 0.22
        dy += (-1 - dy) * 0.22
        dz += -dz * 0.22
        const l = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
        dx /= l
        dy /= l
        dz /= l

        const rest = restLen[g * segments + i]
        px += dx * rest
        py += dy * rest
        pz += dz * rest

        const k = base + i * 3
        pos[k] = px
        pos[k + 1] = py
        pos[k + 2] = pz
      }
    }
    prev.set(pos)
    pinRoots(hx, hy, hz)
    if (params) settle(params, hx, hy, hz)
  }

  // The current is the whole reason this reads as underwater: a slow noise field that never
  // lets the hair settle. Sampled once per frame and reused across substeps.
  const sampleCurrent = (params, time) => {
    const { currentStrength, currentScale, currentSpeed } = params
    const t = time * currentSpeed

    for (let g = 0; g < guideCount; g++) {
      for (let i = 1; i < segments; i++) {
        const k = (g * segments + i) * 3
        const x = pos[k] * currentScale
        const y = pos[k + 1] * currentScale
        const z = pos[k + 2] * currentScale
        // Tips are pushed harder than roots, which keeps the silhouette from going rubbery.
        const reach = currentStrength * (0.25 + 0.75 * (i / (segments - 1)))
        force[k] = noise3D(x, y + t, z) * reach
        force[k + 1] = noise3D(x + 31.4, y, z + t) * reach * 0.6
        force[k + 2] = noise3D(x + t, y + 17.2, z) * reach
      }
    }
  }

  const integrate = (params, dt) => {
    const damp = 1 - params.waterDrag
    const dt2 = dt * dt
    const buoyancy = params.buoyancy * dt2

    for (let g = 0; g < guideCount; g++) {
      for (let i = 1; i < segments; i++) {
        const k = (g * segments + i) * 3

        for (let axis = 0; axis < 3; axis++) {
          const c = pos[k + axis]
          const v = (c - prev[k + axis]) * damp
          prev[k + axis] = c
          pos[k + axis] = c + v + force[k + axis] * dt2
        }

        pos[k + 1] += buoyancy
      }
    }
  }

  const writeGuides = () => {
    for (let n = 0; n < count; n++) {
      data[n * 4 + 0] = pos[n * 3 + 0]
      data[n * 4 + 1] = pos[n * 3 + 1]
      data[n * 4 + 2] = pos[n * 3 + 2]
      data[n * 4 + 3] = 1
    }
    texture.needsUpdate = true
  }

  const lastHead = { x: 0, y: 0, z: 0 }
  let accumulator = 0

  // Pinning the roots to the head is the entire mechanism by which dragging moves the hair.
  const pinRoots = (hx, hy, hz) => {
    for (let g = 0; g < guideCount; g++) {
      const base = g * segments * 3
      pos[base] = hx + roots[g * 3 + 0] * headRadius
      pos[base + 1] = hy + roots[g * 3 + 1] * headRadius
      pos[base + 2] = hz + roots[g * 3 + 2] * headRadius
    }
    lastHead.x = hx
    lastHead.y = hy
    lastHead.z = hz
  }

  const substep = (params, hx, hy, hz) => {
    pinRoots(hx, hy, hz)
    integrate(params, FIXED_DT)
    applyBend(state, params.stiffness)
    solveConstraints(state, params.iterations, headRadius, hx, hy, hz)
  }

  // The grown pose is not the rest pose, so the hair used to spend its first two seconds
  // collapsing and whipping over the crown. Run that part off-screen and start at rest.
  const settle = (params, hx, hy, hz) => {
    sampleCurrent(params, 0)
    for (let s = 0; s < SETTLE_STEPS; s++) substep(params, hx, hy, hz)
    accumulator = 0
  }

  const step = (delta, elapsed, params, head) => {
    if (params.pause) {
      pinRoots(head.x, head.y, head.z)
      writeGuides()
      return
    }

    // Verlet is only stable at a fixed timestep; clamp the accumulator so a stalled tab
    // does not come back and blow the hair apart.
    accumulator = Math.min(accumulator + delta, FIXED_DT * MAX_SUBSTEPS)
    const steps = Math.floor(accumulator / FIXED_DT)
    accumulator -= steps * FIXED_DT
    sampleCurrent(params, elapsed)

    // Pointer events arrive in bursts, so the head can jump a long way in one frame. Spreading
    // the jump over the substeps keeps the roots from teleporting the whole strand at once.
    const { x: fromX, y: fromY, z: fromZ } = lastHead
    for (let s = 1; s <= steps; s++) {
      const t = s / steps
      substep(
        params,
        fromX + (head.x - fromX) * t,
        fromY + (head.y - fromY) * t,
        fromZ + (head.z - fromZ) * t
      )
    }

    if (steps === 0) pinRoots(head.x, head.y, head.z)
    writeGuides()
  }

  reset(0, 0, 0)
  writeGuides()

  return { pos, texture, segments, guideCount, step, reset }
}

// Debug view of the control hairs, sharing the solver's position buffer directly.
export const createGuideLineGeometry = ({ pos, guideCount, segments }) => {
  const indices = []

  for (let g = 0; g < guideCount; g++) {
    for (let i = 0; i < segments - 1; i++) {
      indices.push(g * segments + i, g * segments + i + 1)
    }
  }

  const geometry = new BufferGeometry()
  const attribute = new BufferAttribute(pos, 3)
  attribute.setUsage(DynamicDrawUsage)
  geometry.setAttribute('position', attribute)
  geometry.setIndex(indices)

  return geometry
}

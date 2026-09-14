// The CPU half of GPU Gems 2 ch.7: run the flatness test, pick a subdivision level per patch edge,
// and build the index list. Surface evaluation and displacement happen in the vertex shader.
//
// Each control-grid cell (i, j) is one bicubic B-spline patch over the 4x4 control block
// [i-1..i+2] x [j-1..j+2], wrapping periodically. Levels are stored per *edge* rather than per
// patch, so two neighbours physically cannot disagree about the edge they share (ch.7.1.6).

const B_END = 1 / 6
const B_MID = 4 / 6

export const createTessellator = (gridX, gridY, maxLevel) => {
  const patches = gridX * gridY
  const dim = (1 << maxLevel) + 1
  const quads = 1 << maxLevel
  const verts = patches * dim * dim

  return {
    gridX,
    gridY,
    maxLevel,
    patches,
    maxVerts: verts,
    maxIndices: patches * quads * quads * 6,
    aPatch: new Float32Array(verts * 2),
    aUV: new Float32Array(verts * 2),
    aLevel: new Float32Array(verts),
    indices: new Uint32Array(patches * quads * quads * 6),
    levelU: new Int8Array(patches),
    levelV: new Int8Array(patches),
    prevU: new Int8Array(patches).fill(-1),
    prevV: new Int8Array(patches).fill(-1),
    eye: new Float32Array(patches * 3),
    vertexCount: 0,
    indexCount: 0,
    triangles: 0,
    avgLevel: 0
  }
}

// FlatTest1 from ch.7.1.5: the s-type-safe form, taking the larger of the two second differences
// of the control polygon. Dividing by 3 converts control-polygon deviation into a bound on the
// distance from the limit curve.
const flatness = (q) => {
  let d = 0
  for (let k = 1; k <= 2; k++) {
    const a = (k - 1) * 3
    const b = k * 3
    const c = (k + 1) * 3
    const dx = q[b] - (q[a] + q[c]) * 0.5
    const dy = q[b + 1] - (q[a + 1] + q[c + 1]) * 0.5
    const dz = q[b + 2] - (q[a + 2] + q[c + 2]) * 0.5
    const l = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (l > d) d = l
  }
  return d / 3
}

// One subdivision quarters a cubic's second difference, so each level buys a factor of 4 in screen
// error. That closes the chapter's subdivide-and-retest loop into a single expression.
const levelFor = (d, zMid, focal, near, threshold, maxLevel) => {
  const z = Math.max(Math.abs(zMid), near)
  const pixels = (d * focal) / z
  if (pixels <= threshold) return 0
  const level = Math.ceil(0.5 * Math.log2(pixels / threshold))
  if (level < 0) return 0
  return level > maxLevel ? maxLevel : level
}

export const computeLevels = (t, options) => {
  const {
    controlPoints,
    viewMatrix: m,
    focal,
    near,
    threshold,
    maxLevel,
    relief,
    displacementScale,
    displacementAware
  } = options
  const { gridX, gridY, patches, eye, levelU, levelV, prevU, prevV } = t

  for (let p = 0; p < patches; p++) {
    const s = p * 4
    const x = controlPoints[s]
    const y = controlPoints[s + 1]
    const z = controlPoints[s + 2]
    const o = p * 3
    eye[o] = m[0] * x + m[4] * y + m[8] * z + m[12]
    eye[o + 1] = m[1] * x + m[5] * y + m[9] * z + m[13]
    eye[o + 2] = m[2] * x + m[6] * y + m[10] * z + m[14]
  }

  const wrapX = (i) => ((i % gridX) + gridX) % gridX
  const wrapY = (j) => ((j % gridY) + gridY) % gridY
  const q = new Float32Array(12)

  // Blends three control rows with the boundary weights (1/6, 4/6, 1/6) into the shared boundary
  // curve. Both patches touching this edge produce this same expression from the same rows in the
  // same order, so their boundaries agree bit for bit.
  const blend = (slot, ia, ja, ib, jb, ic, jc) => {
    const a = (wrapY(ja) * gridX + wrapX(ia)) * 3
    const b = (wrapY(jb) * gridX + wrapX(ib)) * 3
    const c = (wrapY(jc) * gridX + wrapX(ic)) * 3
    const o = slot * 3
    q[o] = B_END * eye[a] + B_MID * eye[b] + B_END * eye[c]
    q[o + 1] = B_END * eye[a + 1] + B_MID * eye[b + 1] + B_END * eye[c + 1]
    q[o + 2] = B_END * eye[a + 2] + B_MID * eye[b + 2] + B_END * eye[c + 2]
  }

  let changed = false

  for (let j = 0; j < gridY; j++) {
    for (let i = 0; i < gridX; i++) {
      const p = j * gridX + i

      // Edge running along u at constant v index j, shared by patches (i, j) and (i, j - 1).
      for (let a = 0; a < 4; a++) {
        const ci = i - 1 + a
        blend(a, ci, j - 1, ci, j, ci, j + 1)
      }
      let d = flatness(q)
      if (displacementAware) {
        const r = Math.max(relief[p], relief[wrapY(j - 1) * gridX + i])
        d += r * displacementScale
      }
      levelU[p] = levelFor(d, (q[5] + q[8]) * 0.5, focal, near, threshold, maxLevel)

      // Edge running along v at constant u index i, shared by patches (i, j) and (i - 1, j).
      for (let b = 0; b < 4; b++) {
        const cj = j - 1 + b
        blend(b, i - 1, cj, i, cj, i + 1, cj)
      }
      d = flatness(q)
      if (displacementAware) {
        const r = Math.max(relief[p], relief[j * gridX + wrapX(i - 1)])
        d += r * displacementScale
      }
      levelV[p] = levelFor(d, (q[5] + q[8]) * 0.5, focal, near, threshold, maxLevel)

      if (levelU[p] !== prevU[p] || levelV[p] !== prevV[p]) changed = true
    }
  }

  if (changed) {
    prevU.set(levelU)
    prevV.set(levelV)
  }
  return changed
}

export const buildBuffers = (t, crackFix) => {
  const { gridX, gridY, levelU, levelV, aPatch, aUV, aLevel, indices } = t
  let vi = 0
  let ii = 0
  let triangles = 0
  let levelSum = 0

  for (let j = 0; j < gridY; j++) {
    for (let i = 0; i < gridX; i++) {
      const p = j * gridX + i
      // The sv = 0 and sv = 1 boundaries run along u, so the u-edge levels set the su sampling
      // there, and vice versa. Reading the neighbour's entry from the same array is what makes
      // both sides of every seam agree.
      const atV0 = levelU[p]
      const atV1 = levelU[((j + 1) % gridY) * gridX + i]
      const atU0 = levelV[p]
      const atU1 = levelV[j * gridX + ((i + 1) % gridX)]
      const level = Math.max(atV0, atV1, atU0, atU1)
      const n = 1 << level
      const base = vi

      for (let b = 0; b <= n; b++) {
        for (let a = 0; a <= n; a++) {
          let su = a / n
          let sv = b / n

          // A neighbour that stopped at a coarser level only has vertices on its own grid, so any
          // sample of ours that falls between two of its samples is pulled onto the nearest one.
          // Both sides then evaluate the same boundary curve at the same parameters and the seam
          // closes; the collapsed samples leave slivers that fill the T-junction (ch.7.1.6).
          if (crackFix) {
            if (b === 0 && atV0 < level) su = Math.round(su * (1 << atV0)) / (1 << atV0)
            else if (b === n && atV1 < level) su = Math.round(su * (1 << atV1)) / (1 << atV1)
            if (a === 0 && atU0 < level) sv = Math.round(sv * (1 << atU0)) / (1 << atU0)
            else if (a === n && atU1 < level) sv = Math.round(sv * (1 << atU1)) / (1 << atU1)
          }

          aPatch[vi * 2] = i
          aPatch[vi * 2 + 1] = j
          aUV[vi * 2] = su
          aUV[vi * 2 + 1] = sv
          aLevel[vi] = level
          vi++
        }
      }

      for (let b = 0; b < n; b++) {
        for (let a = 0; a < n; a++) {
          const v0 = base + b * (n + 1) + a
          indices[ii++] = v0
          indices[ii++] = v0 + n + 1
          indices[ii++] = v0 + 1
          indices[ii++] = v0 + 1
          indices[ii++] = v0 + n + 1
          indices[ii++] = v0 + n + 2
        }
      }

      triangles += n * n * 2
      levelSum += level
    }
  }

  t.vertexCount = vi
  t.indexCount = ii
  t.triangles = triangles
  t.avgLevel = levelSum / t.patches
  return t
}

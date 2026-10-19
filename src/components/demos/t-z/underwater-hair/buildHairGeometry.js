import {
  BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Sphere,
  Vector3
} from 'three'
import Delaunator from 'delaunator'

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

// Fibonacci spiral restricted to the upper cap of the sphere. Even spacing in y keeps the
// density uniform over the scalp instead of bunching at the pole.
export const sampleScalp = (count, scalpAngle) => {
  const cosMin = Math.cos(scalpAngle)
  const roots = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const y = 1 - ((i + 0.5) / count) * (1 - cosMin)
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const phi = i * GOLDEN_ANGLE
    roots[i * 3 + 0] = Math.cos(phi) * r
    roots[i * 3 + 1] = y
    roots[i * 3 + 2] = Math.sin(phi) * r
  }

  return roots
}

// Azimuthal equidistant projection from +Y. Unlike a plain (azimuth, polar) unwrap this has no
// seam, so Delaunay never produces triangles that wrap the wrong way around the scalp.
const projectScalp = (roots, count) => {
  const points = []

  for (let i = 0; i < count; i++) {
    const theta = Math.acos(Math.min(1, Math.max(-1, roots[i * 3 + 1])))
    const phi = Math.atan2(roots[i * 3 + 2], roots[i * 3 + 0])
    points.push([theta * Math.cos(phi), theta * Math.sin(phi)])
  }

  return points
}

const edgeLength = (roots, a, b) => {
  const dx = roots[a * 3 + 0] - roots[b * 3 + 0]
  const dy = roots[a * 3 + 1] - roots[b * 3 + 1]
  const dz = roots[a * 3 + 2] - roots[b * 3 + 2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

// The scalp mesh the paper interpolates across. Delaunay always fills the convex hull, which
// on a projected cap means a fringe of slivers — drop anything far above the median edge.
export const triangulateScalp = (roots, count) => {
  const delaunay = Delaunator.from(projectScalp(roots, count))
  const raw = delaunay.triangles
  const triangles = []
  const spans = []

  for (let i = 0; i < raw.length; i += 3) {
    const a = raw[i]
    const b = raw[i + 1]
    const c = raw[i + 2]
    spans.push(Math.max(edgeLength(roots, a, b), edgeLength(roots, b, c), edgeLength(roots, c, a)))
  }

  if (!spans.length) return triangles

  const median = [...spans].sort((x, y) => x - y)[Math.floor(spans.length / 2)]
  const limit = median * 2.5

  for (let i = 0, t = 0; i < raw.length; i += 3, t++) {
    if (spans[t] <= limit) triangles.push([raw[i], raw[i + 1], raw[i + 2]])
  }

  return triangles
}

// One instance per rendered strand: three guide indices plus the barycentric weights that
// place it inside a scalp triangle (Y = A*bA + B*bB + C*bC in the paper).
const buildInstances = (triangles, guideCount, renderStrands) => {
  const guides = new Float32Array(renderStrands * 3)
  const bary = new Float32Array(renderStrands * 3)
  const random = new Float32Array(renderStrands * 3)

  for (let i = 0; i < renderStrands; i++) {
    if (i < guideCount || !triangles.length) {
      // The control hairs themselves are rendered too, collapsed onto a single guide.
      const g = i % guideCount
      guides[i * 3 + 0] = g
      guides[i * 3 + 1] = g
      guides[i * 3 + 2] = g
      bary[i * 3 + 0] = 1
    } else {
      const tri = triangles[Math.floor(Math.random() * triangles.length)]
      let r1 = Math.random()
      let r2 = Math.random()
      if (r1 + r2 > 1) {
        r1 = 1 - r1
        r2 = 1 - r2
      }
      guides[i * 3 + 0] = tri[0]
      guides[i * 3 + 1] = tri[1]
      guides[i * 3 + 2] = tri[2]
      bary[i * 3 + 0] = 1 - r1 - r2
      bary[i * 3 + 1] = r1
      bary[i * 3 + 2] = r2
    }

    random[i * 3 + 0] = Math.random() // width multiplier
    random[i * 3 + 1] = Math.random() // tint / highlight jitter
    random[i * 3 + 2] = Math.random() // curl phase
  }

  return { guides, bary, random }
}

// Two orthonormal axes per strand for the curl offset, baked once.
//
// This used to be derived from the live tangent in the vertex shader, with a branch at
// abs(T.y) > 0.9 picking the reference axis. Hair hangs vertically, so a quarter of all vertices
// sat within 0.05 of that threshold and ~2% flipped it every few frames, each flip snapping the
// basis to an unrelated frame and teleporting the vertex. No tangent-derived frame can avoid a
// seam somewhere (hairy-ball), so the basis is computed here instead: constant per strand,
// identical every frame, and the ill-conditioned case is handled once by picking the world axis
// *least* aligned with the normal, which keeps |cross| >= 0.577.
const buildCurlBasis = (roots, guides, bary, count) => {
  const curlA = new Float32Array(count * 3)
  const curlB = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    let nx = 0
    let ny = 0
    let nz = 0

    for (let k = 0; k < 3; k++) {
      const g = guides[i * 3 + k]
      const w = bary[i * 3 + k]
      nx += roots[g * 3 + 0] * w
      ny += roots[g * 3 + 1] * w
      nz += roots[g * 3 + 2] * w
    }

    let len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
    nx /= len
    ny /= len
    nz /= len

    const absX = Math.abs(nx)
    const absY = Math.abs(ny)
    const absZ = Math.abs(nz)
    const ux = absX <= absY && absX <= absZ ? 1 : 0
    const uy = ux === 0 && absY <= absZ ? 1 : 0
    const uz = ux === 0 && uy === 0 ? 1 : 0

    let ax = ny * uz - nz * uy
    let ay = nz * ux - nx * uz
    let az = nx * uy - ny * ux
    len = Math.sqrt(ax * ax + ay * ay + az * az) || 1
    ax /= len
    ay /= len
    az /= len

    curlA[i * 3 + 0] = ax
    curlA[i * 3 + 1] = ay
    curlA[i * 3 + 2] = az
    curlB[i * 3 + 0] = ny * az - nz * ay
    curlB[i * 3 + 1] = nz * ax - nx * az
    curlB[i * 3 + 2] = nx * ay - ny * ax
  }

  return { curlA, curlB }
}

// Ribbons expand sideways in the vertex shader; lines do not. Emitting aSide = 0 for the line
// build makes `worldPos += side * aSide * width` a no-op, so both primitives share one shader.
const buildStrandTemplate = (tessellation, mode) => {
  if (mode === 'line') {
    const tArray = new Float32Array(tessellation)
    const sideArray = new Float32Array(tessellation)
    const indices = []

    for (let i = 0; i < tessellation; i++) {
      tArray[i] = i / (tessellation - 1)
      if (i < tessellation - 1) indices.push(i, i + 1)
    }

    return { vertices: tessellation, tArray, sideArray, indices }
  }

  const vertices = tessellation * 2
  const tArray = new Float32Array(vertices)
  const sideArray = new Float32Array(vertices)
  const indices = []

  for (let i = 0; i < tessellation; i++) {
    const t = i / (tessellation - 1)
    tArray[i * 2 + 0] = t
    tArray[i * 2 + 1] = t
    sideArray[i * 2 + 0] = -1
    sideArray[i * 2 + 1] = 1

    if (i < tessellation - 1) {
      const v = i * 2
      indices.push(v, v + 1, v + 2, v + 2, v + 1, v + 3)
    }
  }

  return { vertices, tArray, sideArray, indices }
}

export const buildHairGeometry = ({
  roots,
  guideCount,
  renderStrands,
  tessellation,
  radius,
  mode = 'ribbon'
}) => {
  const triangles = triangulateScalp(roots, guideCount)
  const { guides, bary, random } = buildInstances(triangles, guideCount, renderStrands)
  const { curlA, curlB } = buildCurlBasis(roots, guides, bary, renderStrands)
  const { vertices, tArray, sideArray, indices } = buildStrandTemplate(tessellation, mode)

  const geometry = new InstancedBufferGeometry()
  geometry.instanceCount = renderStrands
  geometry.setIndex(indices)

  // Every real position is computed in the vertex shader from the guide texture; this only
  // exists so three knows the vertex count.
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices * 3), 3))
  geometry.setAttribute('aT', new BufferAttribute(tArray, 1))
  geometry.setAttribute('aSide', new BufferAttribute(sideArray, 1))
  geometry.setAttribute('iGuides', new InstancedBufferAttribute(guides, 3))
  geometry.setAttribute('iBary', new InstancedBufferAttribute(bary, 3))
  geometry.setAttribute('iRandom', new InstancedBufferAttribute(random, 3))
  geometry.setAttribute('iCurlA', new InstancedBufferAttribute(curlA, 3))
  geometry.setAttribute('iCurlB', new InstancedBufferAttribute(curlB, 3))

  // The dummy positions are all zero, so an auto-computed bounding sphere would be a point at
  // the origin and the hair would vanish the moment it left the centre of the frustum.
  geometry.boundingSphere = new Sphere(new Vector3(0, 0, 0), radius)

  return geometry
}

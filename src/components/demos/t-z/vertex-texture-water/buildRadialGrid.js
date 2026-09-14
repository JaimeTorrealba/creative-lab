import { BufferAttribute, BufferGeometry, Sphere, Vector3 } from 'three'

// GPU Gems 2 ch.18, section 18.2: the grid is polar and stays centred on the camera, so ring
// spacing alone provides the LOD. r = a0 + a1 * i^exponent, x = r cos(2PI j / M), z = r sin(...).
//
// The tangential half is scale-invariant: a segment of length 2PI r / M seen from distance r
// projects to 2PI f / M pixels and the r cancels, so M is a direct screen-space knob. The radial
// half is not, which is why the exponent is exposed — see the note in index.vue.
export function buildRadialGrid({ rings, sectors, rMin, rMax, exponent, maxAmplitude }) {
  const a1 = (rMax - rMin) / Math.pow(rings - 1, exponent)

  const vertexCount = rings * sectors + 1
  const positions = new Float32Array(vertexCount * 3)
  const ringIndex = new Float32Array(vertexCount)

  // vertex 0 is the centre of the fan that fills the rMin hole directly under the eye
  for (let i = 0; i < rings; i++) {
    const r = rMin + a1 * Math.pow(i, exponent)
    for (let j = 0; j < sectors; j++) {
      const theta = (j / sectors) * Math.PI * 2
      const v = 1 + i * sectors + j
      positions[v * 3] = r * Math.cos(theta)
      positions[v * 3 + 2] = r * Math.sin(theta)
      ringIndex[v] = i
    }
  }

  // 2 triangles per quad across (rings - 1) bands, plus the centre fan
  const indices = new Uint32Array((2 * (rings - 1) * sectors + sectors) * 3)
  let n = 0

  for (let j = 0; j < sectors; j++) {
    const jn = (j + 1) % sectors
    indices[n++] = 0
    indices[n++] = 1 + j
    indices[n++] = 1 + jn
  }

  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < sectors; j++) {
      // the last sector wraps onto column 0 rather than duplicating it. Safe only because the
      // shader derives its uv from position.xz: the shared vertex has one position, so it has
      // one uv, where a baked uv attribute would need two conflicting values.
      const jn = (j + 1) % sectors
      const a = 1 + i * sectors + j
      const b = 1 + i * sectors + jn
      const c = 1 + (i + 1) * sectors + j
      const d = 1 + (i + 1) * sectors + jn
      indices[n++] = a
      indices[n++] = c
      indices[n++] = d
      indices[n++] = a
      indices[n++] = d
      indices[n++] = b
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('aRingIndex', new BufferAttribute(ringIndex, 1))
  geometry.setIndex(new BufferAttribute(indices, 1))
  // computed rather than derived: the mesh is re-centred on the camera every frame, and a stale
  // sphere on a moving mesh shows up as intermittent disappearance rather than as an error
  geometry.boundingSphere = new Sphere(new Vector3(), rMax * 1.02 + maxAmplitude)

  return { geometry, vertexCount, triangleCount: n / 3 }
}

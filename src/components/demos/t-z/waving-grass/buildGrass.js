import alea from 'alea'
import { BufferGeometry, BufferAttribute } from 'three'

// three quads per grass object, 60 degrees apart (GPU Gems ch. 7 star pattern)
const STAR_ANGLES = [0, Math.PI / 3, (Math.PI * 2) / 3]

export function buildGrassGeometry({ count, patchSize, bladeWidth, bladeHeight, seed }) {
  const rand = alea(`waving-grass-${seed}`)

  const positions = []
  const uvs = []
  const centers = []
  const randoms = []
  const indices = []

  for (let i = 0; i < count; i++) {
    const cx = (rand() - 0.5) * patchSize
    const cz = (rand() - 0.5) * patchSize
    const rotation = rand() * Math.PI
    const width = bladeWidth * (0.7 + rand() * 0.6)
    const height = bladeHeight * (0.7 + rand() * 0.6)
    const phase = rand() * Math.PI * 2
    const stiffness = 0.35 + rand() * 0.65

    for (const angle of STAR_ANGLES) {
      const dx = Math.cos(rotation + angle) * width * 0.5
      const dz = Math.sin(rotation + angle) * width * 0.5
      const flip = rand() > 0.5 ? 1 : 0
      const base = positions.length / 3

      positions.push(cx - dx, 0, cz - dz)
      positions.push(cx + dx, 0, cz + dz)
      positions.push(cx - dx, height, cz - dz)
      positions.push(cx + dx, height, cz + dz)
      uvs.push(flip, 0, 1 - flip, 0, flip, 1, 1 - flip, 1)
      for (let v = 0; v < 4; v++) {
        centers.push(cx, 0, cz)
        randoms.push(phase, stiffness)
      }
      indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  geometry.setAttribute('aCenter', new BufferAttribute(new Float32Array(centers), 3))
  geometry.setAttribute('aRandom', new BufferAttribute(new Float32Array(randoms), 2))
  geometry.setIndex(new BufferAttribute(new Uint32Array(indices), 1))
  geometry.computeBoundingSphere()
  // wind sway pushes blade tips outside the static bounds
  geometry.boundingSphere.radius += bladeHeight * 2
  return geometry
}

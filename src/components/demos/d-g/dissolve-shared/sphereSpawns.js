// Random points on the unit sphere with the same UVs IcosahedronGeometry generates, so each
// spark can sample the dissolve noise at exactly the spot the mesh does.
const getSphereUv = (x, y, z) => [
  Math.atan2(z, -x) / (2 * Math.PI) + 0.5,
  Math.atan2(y, Math.hypot(x, z)) / Math.PI + 0.5
]

export const createSphereSpawns = (count) => {
  const positions = new Float32Array(count * 3)
  const uvs = new Float32Array(count * 2)
  const seeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const z = Math.random() * 2 - 1
    const angle = Math.random() * Math.PI * 2
    const ring = Math.sqrt(1 - z * z)
    const x = ring * Math.cos(angle)
    const y = ring * Math.sin(angle)
    positions.set([x, y, z], i * 3)
    uvs.set(getSphereUv(x, y, z), i * 2)
    seeds[i] = Math.random()
  }

  return { count, positions, uvs, seeds }
}

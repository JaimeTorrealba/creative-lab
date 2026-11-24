// Separating-axis triangle/box test (Akenine-Möller). The octree build (Example 37-2) creates a
// child only where its box touches a polygon. Scratch buffers avoid allocations in the hot loop.
const vertices = new Float64Array(9)
const edges = new Float64Array(9)

const separatedOnAxis = (ax, ay, az, half) => {
  const p0 = ax * vertices[0] + ay * vertices[1] + az * vertices[2]
  const p1 = ax * vertices[3] + ay * vertices[4] + az * vertices[5]
  const p2 = ax * vertices[6] + ay * vertices[7] + az * vertices[8]
  const radius = half[0] * Math.abs(ax) + half[1] * Math.abs(ay) + half[2] * Math.abs(az)
  return Math.min(p0, p1, p2) > radius || Math.max(p0, p1, p2) < -radius
}

const separatedByEdgeAxes = (half) => {
  for (let edge = 0; edge < 3; edge++) {
    const ex = edges[edge * 3]
    const ey = edges[edge * 3 + 1]
    const ez = edges[edge * 3 + 2]
    if (separatedOnAxis(0, -ez, ey, half)) return true
    if (separatedOnAxis(ez, 0, -ex, half)) return true
    if (separatedOnAxis(-ey, ex, 0, half)) return true
  }
  return false
}

const loadTriangle = (triangles, triangleId, center) => {
  const base = triangleId * 9
  for (let i = 0; i < 9; i++) vertices[i] = triangles[base + i] - center[i % 3]
  for (let edge = 0; edge < 3; edge++) {
    const next = (edge + 1) % 3
    for (let axis = 0; axis < 3; axis++) {
      edges[edge * 3 + axis] = vertices[next * 3 + axis] - vertices[edge * 3 + axis]
    }
  }
}

const separatedByFacePlane = (half) => {
  const nx = edges[1] * edges[5] - edges[2] * edges[4]
  const ny = edges[2] * edges[3] - edges[0] * edges[5]
  const nz = edges[0] * edges[4] - edges[1] * edges[3]
  return separatedOnAxis(nx, ny, nz, half)
}

export const triangleOverlapsBox = (triangles, triangleId, center, half) => {
  loadTriangle(triangles, triangleId, center)
  if (separatedOnAxis(1, 0, 0, half)) return false
  if (separatedOnAxis(0, 1, 0, half)) return false
  if (separatedOnAxis(0, 0, 1, half)) return false
  if (separatedByFacePlane(half)) return false
  return !separatedByEdgeAxes(half)
}

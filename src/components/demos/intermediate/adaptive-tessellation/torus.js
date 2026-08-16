const TAU = Math.PI * 2

// A torus laid out as a fully periodic quad grid: every vertex has valence 4, so Catmull-Clark
// reduces exactly to the uniform bicubic B-spline masks of GPU Gems 2 ch.7.1.2 and the
// extraordinary-point path (EPSubdiv / EPLimit) never comes up.
export const buildControlGrid = (gridX, gridY, major, minor) => {
  const data = new Float32Array(gridX * gridY * 4)
  for (let j = 0; j < gridY; j++) {
    const v = (j / gridY) * TAU
    const cv = Math.cos(v)
    const sv = Math.sin(v)
    for (let i = 0; i < gridX; i++) {
      const u = (i / gridX) * TAU
      const ring = major + minor * cv
      const o = (j * gridX + i) * 4
      data[o] = ring * Math.cos(u)
      data[o + 1] = minor * sv
      data[o + 2] = ring * Math.sin(u)
      data[o + 3] = 1
    }
  }
  return data
}

export const buildCageSegments = (control, gridX, gridY) => {
  const out = new Float32Array(gridX * gridY * 4 * 3)
  let o = 0
  const push = (i, j) => {
    const s = (((j % gridY) + gridY) % gridY * gridX + (((i % gridX) + gridX) % gridX)) * 4
    out[o++] = control[s]
    out[o++] = control[s + 1]
    out[o++] = control[s + 2]
  }
  for (let j = 0; j < gridY; j++) {
    for (let i = 0; i < gridX; i++) {
      push(i, j)
      push(i + 1, j)
      push(i, j)
      push(i, j + 1)
    }
  }
  return out
}

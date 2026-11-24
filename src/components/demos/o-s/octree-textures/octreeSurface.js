import {
  bindOctreeUniforms,
  buildSurfaceOctree,
  createIndirectionPool,
  createOctreeFrame,
  extractOctreeTriangles
} from './octree'
import { createLeafTables } from './leafTables'
import { createLiquidSimulation } from './liquidSimulation'
import { createPaintLayer } from './paintLayer'

const RAIN_ATTEMPTS = 12
const RAIN_MIN_FACING = 0.2

// Everything that depends on the octree resolution: the tree and its pool, the per-leaf tables
// (neighbours, positions, normals), the liquid simulation and the paint layer. Each leaf stores
// its own id, which is also its texel in every per-leaf map.
export const createOctreeSurface = ({ geometry, renderer, uniforms, gravity }) => {
  const frame = createOctreeFrame(geometry)
  const triangleSet = extractOctreeTriangles(geometry, frame)
  const state = { tree: null, pool: null, tables: null, simulation: null, paint: null }

  const disposeLevel = () => {
    state.pool?.dispose()
    state.tables?.dispose()
    state.simulation?.dispose()
    state.paint?.dispose()
  }

  // Paint is carried over to the new resolution; the liquid starts dry.
  const build = (depth) => {
    const previousPaint = state.paint?.snapshot()
    disposeLevel()
    const tree = buildSurfaceOctree({ ...triangleSet, depth })
    const pool = createIndirectionPool(tree)
    pool.upload(renderer)
    const tables = createLeafTables(tree, frame)
    const simulation = createLiquidSimulation({ tables, gravity })
    simulation.clear(renderer)
    const paint = createPaintLayer({ tree, tables, frame, previous: previousPaint })
    Object.assign(state, { tree, pool, tables, simulation, paint })
    bindOctreeUniforms(uniforms, { pool, tree, frame })
    uniforms.uTableWidth.value = tables.width
    uniforms.uPaintMap.value = paint.texture
  }

  // A random leaf whose surface faces up (against gravity), for rain drops.
  const pickRainPoint = (up) => {
    const { tables, tree } = state
    for (let attempt = 0; attempt < RAIN_ATTEMPTS; attempt++) {
      const leafId = Math.floor(Math.random() * tree.leafCount)
      const n = leafId * 4
      const facing = tables.normals[n] * up.x + tables.normals[n + 1] * up.y + tables.normals[n + 2] * up.z
      if (facing > RAIN_MIN_FACING) return Array.from(tables.positions.subarray(n, n + 3))
    }
    return null
  }

  const advance = (options) => {
    state.paint.flush()
    state.simulation.advance(renderer, options)
    uniforms.uState.value = state.simulation.getStateTexture()
  }

  const getStats = () => ({
    nodes: state.tree.nodeCount,
    leaves: state.tree.leafCount,
    mapSize: `${state.tables.width}×${state.tables.height}`,
    gpuBytes:
      state.pool.byteLength + state.tables.byteLength + state.simulation.byteLength + state.tables.width * state.tables.height * 4
  })

  return {
    frame,
    build,
    advance,
    pickRainPoint,
    getStats,
    getTree: () => state.tree,
    paintDab: (localPoint, brush) => state.paint.paintDab(localPoint, brush),
    clearPaint: () => state.paint.clearPaint(),
    clearLiquid: () => state.simulation.clear(renderer),
    setFlowParameters: (values) => state.simulation.setParameters(values),
    dispose: disposeLevel
  }
}

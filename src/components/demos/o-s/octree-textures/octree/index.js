import { Vector3 } from 'three'

export { createOctreeFrame, extractOctreeTriangles } from './octreeFrame'
export { buildSurfaceOctree, forEachLeafInSphere, findLeafAtPoint } from './surfaceOctree'
export { createIndirectionPool } from './indirectionPool'
export { createSurfacePointer } from './surfacePointer'
export { createOctreeWireframe } from './octreeWireframe'

export const createOctreeUniforms = () => ({
  uOctreePool: { value: null },
  uOctreeDepth: { value: 1 },
  uOctreeScale: { value: 1 },
  uOctreeOffset: { value: new Vector3() }
})

export const bindOctreeUniforms = (uniforms, { pool, tree, frame }) => {
  uniforms.uOctreePool.value = pool.texture
  uniforms.uOctreeDepth.value = tree.depth
  uniforms.uOctreeScale.value = frame.scale
  uniforms.uOctreeOffset.value.copy(frame.offset)
}

// vite-plugin-glsl strips comments and the trailing newline of every chunk, so plain `+` glues
// the last line of one chunk to the first of the next (`}#define ...`).
export const joinShaderChunks = (...chunks) => chunks.join('\n')

import { Color, Mesh, ShaderMaterial, TorusGeometry, Vector3 } from 'three'
import { createOctreeUniforms, joinShaderChunks } from './octree'
import octreeLookup from './octree/octreeLookup.glsl'
import surfaceVertex from './octree/octreeSurfaceVertex.glsl'
import surfaceSample from './shaders/surfaceSample.glsl'
import surfaceAlbedo from './shaders/surfaceAlbedo.glsl'
import donutFragment from './shaders/donutFragment.glsl'
import exportVertex from './shaders/exportVertex.glsl'
import exportFragment from './shaders/exportFragment.glsl'

export const VIEW = { SHADED: 0, HEIGHT: 1, BAKED: 2 }

export const createSurfaceUniforms = () => ({
  ...createOctreeUniforms(),
  uState: { value: null },
  uPaintMap: { value: null },
  uTableWidth: { value: 1 },
  uTrilinear: { value: true },
  uDoughColor: { value: new Color() },
  uLiquidColor: { value: new Color() },
  uLiquidOpacity: { value: 1 },
  uFilmThickness: { value: 0.2 },
  uView: { value: VIEW.SHADED },
  uBumpStrength: { value: 0.04 },
  uBakedMap: { value: null },
  uLightDirection: { value: new Vector3(0.4, 0.85, 0.35).normalize() }
})

const sampling = joinShaderChunks(octreeLookup, surfaceSample, surfaceAlbedo)

export const EXPORT_SHADERS = {
  vertexShader: exportVertex,
  fragmentShader: joinShaderChunks(sampling, exportFragment)
}

// TorusGeometry already has a clean, non-overlapping (u,v) layout, which the export uses.
export const createDonutMesh = (uniforms) => {
  const material = new ShaderMaterial({
    vertexShader: surfaceVertex,
    fragmentShader: joinShaderChunks(sampling, donutFragment),
    uniforms
  })
  return new Mesh(new TorusGeometry(1, 0.42, 64, 192), material)
}

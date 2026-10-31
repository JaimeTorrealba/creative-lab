import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial } from 'three'
import { createSphereSpawns } from '../dissolve-shared/sphereSpawns'
import particleVertex from './particleVertex.glsl'
import particleFragment from './particleFragment.glsl'

// `uniforms` shares the mesh's noise uniforms so the sparks follow the same border
export const createEdgeParticles = ({ count, uniforms }) => {
  const spawns = createSphereSpawns(count)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(spawns.positions, 3))
  geometry.setAttribute('aUv', new BufferAttribute(spawns.uvs, 2))
  geometry.setAttribute('aSeed', new BufferAttribute(spawns.seeds, 1))

  const material = new ShaderMaterial({
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending
  })

  const points = new Points(geometry, material)
  points.frustumCulled = false

  const dispose = () => {
    geometry.dispose()
    material.dispose()
  }

  return { points, dispose }
}

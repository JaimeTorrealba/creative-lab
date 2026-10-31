import { AdditiveBlending, InstancedBufferAttribute, PointsNodeMaterial, Sprite } from 'three/webgpu'
import {
  cos,
  instancedBufferAttribute,
  positionView,
  sin,
  smoothstep,
  time,
  uniform,
  uv,
  vec2,
  vec3,
  vec4
} from 'three/tsl'
import { createSphereSpawns } from './sphereSpawns'

const toInstanced = (array, itemSize) =>
  instancedBufferAttribute(new InstancedBufferAttribute(array, itemSize))

export const createParticleUniforms = () => ({
  size: uniform(30),
  speed: uniform(0.6),
  distance: uniform(0.6)
})

// Sparks live on a looping age, so no simulation is needed: each one flies outward from its
// spawn point and is only drawn while that spawn point sits on the burning border.
// `borderAt(uv)` must return 1 on the border and 0 elsewhere.
export const createGpuEdgeParticles = ({ count, particles, borderAt, glowColor, glowIntensity }) => {
  const spawns = createSphereSpawns(count)
  const spawnPosition = toInstanced(spawns.positions, 3)
  const spawnUv = toInstanced(spawns.uvs, 2)
  const seed = toInstanced(spawns.seeds, 1)

  const age = time.mul(particles.speed).add(seed).fract()
  const fade = age.oneMinus()
  const swirl = seed.mul(40).add(age.mul(6))
  const wobble = vec3(sin(swirl), cos(swirl.mul(0.8)), sin(swirl.mul(1.3))).mul(age.mul(0.1))
  const lift = vec3(0, age.mul(age).mul(0.3), 0)
  const drift = spawnPosition.normalize().mul(age.mul(particles.distance)).add(wobble).add(lift)

  const material = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: false
  })
  material.positionNode = spawnPosition.add(drift)
  material.sizeNode = particles.size
    .mul(fade)
    .mul(borderAt(spawnUv))
    .div(positionView.z.negate())
  const falloff = smoothstep(0, 0.5, uv().distance(vec2(0.5))).oneMinus()
  material.colorNode = vec4(0, 0, 0, 1)
  material.emissiveNode = glowColor.mul(glowIntensity).mul(falloff).mul(fade)

  const sprite = new Sprite(material)
  sprite.count = count
  sprite.frustumCulled = false

  return { sprite, dispose: () => material.dispose() }
}

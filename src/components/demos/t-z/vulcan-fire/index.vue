<script setup>
import { onMounted, onUnmounted, reactive, shallowRef, watch } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { EffectComposerPmndrs, BloomPmndrs } from '@tresjs/post-processing'
import {
  PlaneGeometry,
  ShaderMaterial,
  InstancedBufferAttribute,
  DynamicDrawUsage,
  Color,
  Vector3,
  NormalBlending,
  AdditiveBlending,
  GLSL3
} from 'three'
import { Pane } from 'tweakpane'
import { watchOnce } from '@vueuse/core'
import { createFireVolume } from './fireVolume'
import vertex from './vertex.glsl'
import fireFragment from './fireFragment.glsl'
import smokeFragment from './smokeFragment.glsl'

const MAX_PARTICLES = 64

const fireParams = {
  count: 24,
  playbackSpeed: 0.6,
  sizeMin: 0.8,
  sizeMax: 1.6,
  riseSpeed: 0.8,
  emitterRadius: 0.35,
  bindStrength: 2,
  decaySpeed: 0.9,
  intensity: 1.6,
  colorLow: '#7a1a05',
  colorMid: '#ff6a00',
  colorHigh: '#ffe8a3',
  blending: NormalBlending
}

const smokeParams = {
  count: 40,
  opacity: 0.55,
  riseSpeed: 0.9,
  growth: 1.8,
  color: '#3a3a3a'
}

const volumeParams = {
  size: 64,
  frames: 64,
  octaves: 4,
  frequency: 2.5,
  turbulence: 0.6,
  flameWidth: 0.3,
  seed: 1
}

const glow = reactive({
  enabled: true,
  intensity: 1.2,
  threshold: 0.7,
  radius: 0.6
})

let fireVolume = createFireVolume(volumeParams)

const fireGeometry = new PlaneGeometry(1, 1)
const smokeGeometry = new PlaneGeometry(1, 1)

const fireMaterial = new ShaderMaterial({
  glslVersion: GLSL3,
  vertexShader: vertex,
  fragmentShader: fireFragment,
  transparent: true,
  depthWrite: false,
  blending: fireParams.blending,
  uniforms: {
    uTime: { value: 0 },
    uPlaybackSpeed: { value: fireParams.playbackSpeed },
    uFireVolume: { value: fireVolume },
    uColorLow: { value: new Color(fireParams.colorLow) },
    uColorMid: { value: new Color(fireParams.colorMid) },
    uColorHigh: { value: new Color(fireParams.colorHigh) },
    uIntensity: { value: fireParams.intensity }
  }
})

const smokeMaterial = new ShaderMaterial({
  glslVersion: GLSL3,
  vertexShader: vertex,
  fragmentShader: smokeFragment,
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0 },
    uPlaybackSpeed: { value: 0 },
    uSmokeTex: { value: null },
    uSmokeColor: { value: new Color(smokeParams.color) },
    uSmokeOpacity: { value: smokeParams.opacity }
  }
})

const { state: smokeTexture, isLoading } = useTexture('/textures/smoke.png')
watchOnce(isLoading, (value) => {
  if (!value) smokeMaterial.uniforms.uSmokeTex.value = smokeTexture.value
})

const createSystem = () => ({
  particles: Array.from({ length: MAX_PARTICLES }, () => ({
    pos: new Vector3(),
    vel: new Vector3(),
    life: 0,
    decay: 1,
    scale: 1,
    rotation: 0,
    rotSpeed: 0,
    frameOffset: 0,
    opacity: 1,
    flipU: 1,
    flipV: 1
  })),
  order: Array.from({ length: MAX_PARTICLES }, (_, i) => i),
  depths: new Float32Array(MAX_PARTICLES),
  attributes: {
    aOffset: new InstancedBufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3),
    aScale: new InstancedBufferAttribute(new Float32Array(MAX_PARTICLES), 1),
    aRotation: new InstancedBufferAttribute(new Float32Array(MAX_PARTICLES), 1),
    aLife: new InstancedBufferAttribute(new Float32Array(MAX_PARTICLES), 1),
    aFrameOffset: new InstancedBufferAttribute(new Float32Array(MAX_PARTICLES), 1),
    aOpacity: new InstancedBufferAttribute(new Float32Array(MAX_PARTICLES), 1),
    aFlip: new InstancedBufferAttribute(new Float32Array(MAX_PARTICLES * 2), 2)
  }
})

const fireSystem = createSystem()
const smokeSystem = createSystem()

const respawnFire = (p) => {
  const angle = Math.random() * Math.PI * 2
  const radius = Math.sqrt(Math.random()) * fireParams.emitterRadius
  p.scale = fireParams.sizeMin + Math.random() * (fireParams.sizeMax - fireParams.sizeMin)
  p.pos.set(Math.cos(angle) * radius, p.scale * 0.38, Math.sin(angle) * radius)
  p.vel.set(
    (Math.random() - 0.5) * 0.3,
    fireParams.riseSpeed * (0.7 + Math.random() * 0.6),
    (Math.random() - 0.5) * 0.3
  )
  p.life = 0
  p.decay = fireParams.decaySpeed * (0.7 + Math.random() * 0.6)
  p.rotation = (Math.random() - 0.5) * 0.4
  p.rotSpeed = (Math.random() - 0.5) * 0.3
  p.frameOffset = Math.random()
  p.opacity = 0.6 + Math.random() * 0.4
  p.flipU = Math.random() < 0.5 ? -1 : 1
  p.flipV = 1
}

const respawnSmoke = (p) => {
  const angle = Math.random() * Math.PI * 2
  const radius = Math.sqrt(Math.random()) * fireParams.emitterRadius * 1.5
  p.scale = 0.9 + Math.random() * 0.8
  p.pos.set(Math.cos(angle) * radius, 1 + Math.random() * 0.5, Math.sin(angle) * radius)
  p.vel.set(
    (Math.random() - 0.5) * 0.4,
    smokeParams.riseSpeed * (0.7 + Math.random() * 0.6),
    (Math.random() - 0.5) * 0.4
  )
  p.life = 0
  p.decay = 0.25 * (0.7 + Math.random() * 0.6)
  p.rotation = Math.random() * Math.PI * 2
  p.rotSpeed = (Math.random() - 0.5) * 1.2
  p.frameOffset = Math.random()
  p.opacity = 0.5 + Math.random() * 0.5
  p.flipU = Math.random() < 0.5 ? -1 : 1
  p.flipV = Math.random() < 0.5 ? -1 : 1
}

const initSystem = (system, respawn) => {
  system.particles.forEach((p) => {
    respawn(p)
    p.life = Math.random()
    p.pos.addScaledVector(p.vel, p.life / p.decay)
  })
}

initSystem(fireSystem, respawnFire)
initSystem(smokeSystem, respawnSmoke)

const camDir = new Vector3()
const tmp = new Vector3()

const updateSystem = (system, count, delta, camPos, respawn, growth) => {
  const { particles, order, depths, attributes } = system
  for (let i = 0; i < count; i++) {
    const p = particles[i]
    p.life += delta * p.decay
    if (p.life >= 1) respawn(p)
    p.pos.addScaledVector(p.vel, delta)
    const bind = fireParams.bindStrength * (1 - p.life) * delta
    p.pos.x -= p.pos.x * bind
    p.pos.z -= p.pos.z * bind
    p.rotation += p.rotSpeed * delta
    depths[i] = tmp.subVectors(p.pos, camPos).dot(camDir)
  }

  order.length = count
  for (let i = 0; i < count; i++) order[i] = i
  order.sort((a, b) => depths[b] - depths[a])

  for (let k = 0; k < count; k++) {
    const p = particles[order[k]]
    attributes.aOffset.setXYZ(k, p.pos.x, p.pos.y, p.pos.z)
    attributes.aScale.setX(k, p.scale * (1 + p.life * growth))
    attributes.aRotation.setX(k, p.rotation)
    attributes.aLife.setX(k, Math.min(p.life, 1))
    attributes.aFrameOffset.setX(k, p.frameOffset)
    attributes.aOpacity.setX(k, p.opacity)
    attributes.aFlip.setXY(k, p.flipU, p.flipV)
  }
  Object.values(attributes).forEach((attr) => {
    attr.needsUpdate = true
  })
}

const fireRef = shallowRef()
const smokeRef = shallowRef()

const setupMesh = (mesh, system, count) => {
  Object.entries(system.attributes).forEach(([name, attr]) => {
    attr.setUsage(DynamicDrawUsage)
    mesh.geometry.setAttribute(name, attr)
  })
  mesh.frustumCulled = false
  mesh.count = count
}

watch(fireRef, (mesh) => {
  if (mesh) setupMesh(mesh, fireSystem, fireParams.count)
})
watch(smokeRef, (mesh) => {
  if (mesh) setupMesh(mesh, smokeSystem, smokeParams.count)
})

const { camera } = useTres()
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  const dt = Math.min(delta, 0.05)
  fireMaterial.uniforms.uTime.value += dt
  if (!camera.value) return
  camera.value.getWorldDirection(camDir)
  updateSystem(fireSystem, fireParams.count, dt, camera.value.position, respawnFire, 0)
  updateSystem(
    smokeSystem,
    smokeParams.count,
    dt,
    camera.value.position,
    respawnSmoke,
    smokeParams.growth
  )
})

let pane

onMounted(() => {
  pane = new Pane({ title: 'Vulcan Fire' })

  const fireFolder = pane.addFolder({ title: 'Fire' })
  fireFolder
    .addBinding(fireParams, 'count', { min: 1, max: MAX_PARTICLES, step: 1 })
    .on('change', ({ value }) => {
      if (fireRef.value) fireRef.value.count = value
    })
  fireFolder
    .addBinding(fireParams, 'playbackSpeed', { min: 0, max: 3 })
    .on('change', ({ value }) => {
      fireMaterial.uniforms.uPlaybackSpeed.value = value
    })
  fireFolder.addBinding(fireParams, 'sizeMin', { min: 0.1, max: 3 })
  fireFolder.addBinding(fireParams, 'sizeMax', { min: 0.1, max: 4 })
  fireFolder.addBinding(fireParams, 'riseSpeed', { min: 0, max: 3 })
  fireFolder.addBinding(fireParams, 'emitterRadius', { min: 0, max: 2 })
  fireFolder.addBinding(fireParams, 'bindStrength', { min: 0, max: 6 })
  fireFolder.addBinding(fireParams, 'decaySpeed', { min: 0.2, max: 3 })
  fireFolder.addBinding(fireParams, 'intensity', { min: 0.5, max: 4 }).on('change', ({ value }) => {
    fireMaterial.uniforms.uIntensity.value = value
  })
  fireFolder.addBinding(fireParams, 'colorLow').on('change', ({ value }) => {
    fireMaterial.uniforms.uColorLow.value.set(value)
  })
  fireFolder.addBinding(fireParams, 'colorMid').on('change', ({ value }) => {
    fireMaterial.uniforms.uColorMid.value.set(value)
  })
  fireFolder.addBinding(fireParams, 'colorHigh').on('change', ({ value }) => {
    fireMaterial.uniforms.uColorHigh.value.set(value)
  })
  fireFolder
    .addBinding(fireParams, 'blending', {
      options: { normal: NormalBlending, additive: AdditiveBlending }
    })
    .on('change', ({ value }) => {
      fireMaterial.blending = value
      fireMaterial.needsUpdate = true
    })

  const volumeFolder = pane.addFolder({ title: 'Fire Volume', expanded: false })
  volumeFolder.addBinding(volumeParams, 'size', { options: { 64: 64, 128: 128 } })
  volumeFolder.addBinding(volumeParams, 'frames', { options: { 32: 32, 64: 64 } })
  volumeFolder.addBinding(volumeParams, 'octaves', { min: 1, max: 6, step: 1 })
  volumeFolder.addBinding(volumeParams, 'frequency', { min: 1, max: 6 })
  volumeFolder.addBinding(volumeParams, 'turbulence', { min: 0, max: 1.5 })
  volumeFolder.addBinding(volumeParams, 'flameWidth', { min: 0.1, max: 0.6 })
  volumeFolder.addBinding(volumeParams, 'seed', { min: 1, max: 100, step: 1 })
  volumeFolder.addButton({ title: 'Regenerate' }).on('click', () => {
    const next = createFireVolume(volumeParams)
    fireVolume.dispose()
    fireVolume = next
    fireMaterial.uniforms.uFireVolume.value = next
  })

  const smokeFolder = pane.addFolder({ title: 'Smoke' })
  smokeFolder
    .addBinding(smokeParams, 'count', { min: 1, max: MAX_PARTICLES, step: 1 })
    .on('change', ({ value }) => {
      if (smokeRef.value) smokeRef.value.count = value
    })
  smokeFolder.addBinding(smokeParams, 'opacity', { min: 0, max: 1 }).on('change', ({ value }) => {
    smokeMaterial.uniforms.uSmokeOpacity.value = value
  })
  smokeFolder.addBinding(smokeParams, 'riseSpeed', { min: 0, max: 3 })
  smokeFolder.addBinding(smokeParams, 'growth', { min: 0, max: 4 })
  smokeFolder.addBinding(smokeParams, 'color').on('change', ({ value }) => {
    smokeMaterial.uniforms.uSmokeColor.value.set(value)
  })

  const glowFolder = pane.addFolder({ title: 'Glow' })
  glowFolder.addBinding(glow, 'enabled')
  glowFolder.addBinding(glow, 'intensity', { min: 0, max: 5 })
  glowFolder.addBinding(glow, 'threshold', { min: 0, max: 1 })
  glowFolder.addBinding(glow, 'radius', { min: 0, max: 1 })
})

onUnmounted(() => {
  pane?.dispose()
  fireVolume.dispose()
  fireGeometry.dispose()
  smokeGeometry.dispose()
  fireMaterial.dispose()
  smokeMaterial.dispose()
})
</script>

<template>
  <Suspense>
    <EffectComposerPmndrs v-if="glow.enabled">
      <BloomPmndrs
        :intensity="glow.intensity"
        :luminance-threshold="glow.threshold"
        :luminance-smoothing="0.3"
        :radius="glow.radius"
        mipmap-blur
      />
    </EffectComposerPmndrs>
  </Suspense>
  <TresMesh :rotation-x="-Math.PI / 2">
    <TresCircleGeometry :args="[1.4, 48]" />
    <TresMeshStandardMaterial color="#181212" :roughness="1" />
  </TresMesh>
  <TresInstancedMesh
    ref="smokeRef"
    :args="[smokeGeometry, smokeMaterial, MAX_PARTICLES]"
    :render-order="1"
  />
  <TresInstancedMesh
    ref="fireRef"
    :args="[fireGeometry, fireMaterial, MAX_PARTICLES]"
    :render-order="2"
  />
  <TresAmbientLight :intensity="0.15" />
  <TresPointLight color="#ff7722" :intensity="8" :distance="10" :position="[0, 1, 0]" />
</template>

<script setup>
import * as THREE from 'three/webgpu'
import {
  NearestFilter,
  SRGBColorSpace,
  RepeatWrapping,
  PlaneGeometry,
  Sprite,
  SpriteMaterial,
  Group,
  DataTexture,
  RGBAFormat
} from 'three'
import {
  pass,
  screenUV,
  uniform,
  sin,
  vec2,
  vec4,
  Fn,
  time,
  texture as texNode,
  uv
} from 'three/tsl'
import { useTextures, Plane } from '@tresjs/cientos'
import { useLoop, useTres } from '@tresjs/core'
import { ThreeScatter } from '@jaimebboyjt/three-scatter'
import { watch, shallowRef, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'

const tilesHorizontal = 20
const smokeParams = { count: 7, minY: 1.0, maxY: 5.0, speed: 0.4, drift: 0.15, scale: 1.0 }
const fireParams = { count: 30, scale: 1.5, scaleRandom: 0.5, speed: 12, speedRandom: 4 }

const { textures, isLoading } = useTextures([
  '/images/fire_sprite_1.png',
  '/images/fire_sprite_2.png',
  '/images/fire_sprite_3.png',
  '/perlin.png'
])

const { scene, camera, renderer } = useTres()

// ---- fire state
const fireSprites = shallowRef([])
const spriteMaps = shallowRef([])
const frameOffsets = []
const spriteFrameSpeeds = []

// ---- smoke state
const smokeMeshes = shallowRef([])
const smokeZDrifts = []

// ---- shared resources (set once textures load)
let _perlinTex = null
let _shapeMask = null
let _planeGeo = null
let _floorGeo = null
let _scatterPositions = []

// -------------------------------------------------- Heat shimmer post-processing
const uStrength = uniform(0.0)
const uFrequency = uniform(12.0)
const uSpeed = uniform(2.0)

const scenePass = pass(scene.value, camera.value)
const colorNode = scenePass.getTextureNode('output')

const heatShimmer = Fn(() => {
  const uvCoord = screenUV
  const t = time.mul(uSpeed)
  const wave1 = sin(uvCoord.x.mul(uFrequency).add(uvCoord.y.mul(5.0)).add(t))
  const wave2 = sin(uvCoord.x.mul(uFrequency.mul(1.6)).sub(uvCoord.y.mul(2.5)).add(t.mul(1.4)))
  const noise = wave1.add(wave2).mul(0.5)
  const mask = uvCoord.y.oneMinus().pow(2)
  const dx = noise.mul(uStrength).mul(mask)
  return colorNode.sample(vec2(uvCoord.x.add(dx), uvCoord.y))
})()

const postProcessing = new THREE.PostProcessing(renderer)
postProcessing.outputNode = heatShimmer

// -------------------------------------------------- Shape mask (radial gradient)
function createShapeMask(size = 128) {
  const data = new Uint8Array(size * size * 4)
  const c = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - c) / c
      const dy = (y - c) / c
      const alpha = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy)) ** 2
      const i = (y * size + x) * 4
      data[i] = data[i + 1] = data[i + 2] = 255
      data[i + 3] = Math.floor(alpha * 255)
    }
  }
  const tex = new DataTexture(data, size, size, RGBAFormat)
  tex.needsUpdate = true
  return tex
}

// -------------------------------------------------- Smoke material
function createSmokeMaterial(perlinTex, shapeTex) {
  const mat = new THREE.MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  })

  const px1 = uniform(Math.random() * 10)
  const py1 = uniform(Math.random() * 10)
  const px2 = uniform(Math.random() * 10)
  const py2 = uniform(Math.random() * 10)
  const uFade = uniform(0)

  const uvCoord = uv()
  const noiseUV1 = uvCoord.mul(1.0).add(vec2(time.mul(0.08).add(px1), time.mul(-0.12).add(py1)))
  const noiseUV2 = uvCoord.mul(2.0).add(vec2(time.mul(-0.06).add(px2), time.mul(-0.09).add(py2)))

  const shape = texNode(shapeTex, uvCoord).a
  const n1 = texNode(perlinTex, noiseUV1).r
  const n2 = texNode(perlinTex, noiseUV2).r

  mat.colorNode = vec4(0.6, 0.6, 0.65, 1.0)
  mat.opacityNode = shape.mul(n1.mul(n2).mul(2.0)).mul(uFade)
  mat.userData.uFade = uFade

  return mat
}

// -------------------------------------------------- Build smoke meshes
const buildSmokeMeshes = () => {
  if (!_perlinTex || !_shapeMask || !_planeGeo || !_scatterPositions.length) return
  smokeMeshes.value.forEach((m) => scene.value.remove(m))
  smokeZDrifts.length = 0
  const meshes = []
  _scatterPositions.forEach((pos) => {
    for (let j = 0; j < smokeParams.count; j++) {
      const mat = createSmokeMaterial(_perlinTex, _shapeMask)
      const mesh = new THREE.Mesh(_planeGeo, mat)
      mesh.position.set(
        pos.x,
        smokeParams.minY + (j / smokeParams.count) * (smokeParams.maxY - smokeParams.minY),
        pos.z
      )
      mesh.userData.baseX = pos.x
      mesh.userData.baseZ = pos.z
      mesh.userData.scaleRandom = 0.5 + Math.random() * 1.0
      scene.value.add(mesh)
      meshes.push(mesh)
      smokeZDrifts.push((Math.random() - 0.5) * smokeParams.drift * 2)
    }
  })
  smokeMeshes.value = meshes
}

// -------------------------------------------------- Build fire sprites
const buildFireSprites = () => {
  if (!_floorGeo || !textures.value.length) return

  if (fireSprites.value.length) {
    const old = fireSprites.value[0]?.parent
    if (old) scene.value.remove(old)
  }
  frameOffsets.length = 0
  spriteFrameSpeeds.length = 0

  const scatter = new ThreeScatter(fireParams.count, _floorGeo)
  const positions = scatter.getPositions()
  _scatterPositions = positions
  buildSmokeMeshes()

  const spriteContainer = new Group()
  const maps = []
  const sprites = []

  positions.forEach((pos, i) => {
    const baseTex = textures.value[i % 3]
    const tex = baseTex.clone()
    tex.magFilter = NearestFilter
    tex.repeat.set(1 / tilesHorizontal, 1)
    tex.offset.set(0, 0)
    tex.colorSpace = SRGBColorSpace
    tex.needsUpdate = true

    const scaleRand = 1 + (Math.random() - 0.5) * fireParams.scaleRandom * 2
    const mat = new SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
    const sprite = new Sprite(mat)
    sprite.position.set(pos.x, 0.5, pos.z)
    sprite.scale.setScalar(fireParams.scale * scaleRand)
    sprite.userData.scaleRandom = scaleRand
    spriteContainer.add(sprite)

    maps.push(tex)
    sprites.push(sprite)
    frameOffsets.push(Math.floor(Math.random() * tilesHorizontal))
    spriteFrameSpeeds.push(fireParams.speed + (Math.random() - 0.5) * fireParams.speedRandom * 2)
  })

  spriteMaps.value = maps
  fireSprites.value = sprites
  scene.value.add(spriteContainer)
}

// -------------------------------------------------- Init once textures load
watch(isLoading, (_isLoading) => {
  if (_isLoading) return

  _perlinTex = textures.value[3]
  _perlinTex.wrapS = _perlinTex.wrapT = RepeatWrapping
  _perlinTex.needsUpdate = true
  _shapeMask = createShapeMask()
  _planeGeo = new THREE.PlaneGeometry(2, 3)
  _floorGeo = new PlaneGeometry(7.5, 7.5, 25, 25)
  _floorGeo.rotateX(-Math.PI / 2)

  buildFireSprites()
})

onUnmounted(() => {
  smokeMeshes.value.forEach((m) => scene.value.remove(m))
  const container = fireSprites.value[0]?.parent
  if (container) scene.value.remove(container)
  pane.dispose()
})

// -------------------------------------------------- Loop
const { onBeforeRender, render } = useLoop()

onBeforeRender(({ delta }) => {
  smokeMeshes.value.forEach((mesh, i) => {
    mesh.scale.setScalar(smokeParams.scale * mesh.userData.scaleRandom)
    mesh.lookAt(camera.value.position)
    mesh.position.y += smokeParams.speed * delta
    mesh.position.x += smokeParams.drift * delta
    mesh.position.z += smokeZDrifts[i] * delta
    const t = Math.max(
      0,
      Math.min(1, (mesh.position.y - smokeParams.minY) / (smokeParams.maxY - smokeParams.minY))
    )
    mesh.material.userData.uFade.value = 1 - Math.abs(2 * t - 1)
    if (mesh.position.y > smokeParams.maxY) {
      mesh.position.y = smokeParams.minY
      mesh.position.x = mesh.userData.baseX
      mesh.position.z = mesh.userData.baseZ
    }
  })

  spriteMaps.value.forEach((tex, i) => {
    fireSprites.value[i].scale.setScalar(
      fireParams.scale * fireSprites.value[i].userData.scaleRandom
    )
    const frame =
      (Math.floor(performance.now() / (1000 / spriteFrameSpeeds[i])) + frameOffsets[i]) %
      tilesHorizontal
    tex.offset.x = frame / tilesHorizontal
    tex.needsUpdate = true
  })
})

render((notifySuccess) => {
  postProcessing.render()
  notifySuccess()
})

// -------------------------------------------------- Tweakpane
const pane = new Pane()

const fireFolder = pane.addFolder({ title: 'Fire' })
fireFolder
  .addBinding(fireParams, 'count', { label: 'count', min: 1, max: 60, step: 1 })
  .on('change', () => buildFireSprites())
fireFolder.addBinding(fireParams, 'scale', { label: 'scale', min: 0.1, max: 5, step: 0.1 })
fireFolder
  .addBinding(fireParams, 'scaleRandom', { label: 'scale random', min: 0, max: 1, step: 0.05 })
  .on('change', () => buildFireSprites())
fireFolder.addBinding(fireParams, 'speed', { label: 'speed', min: 1, max: 30, step: 1 })
fireFolder
  .addBinding(fireParams, 'speedRandom', { label: 'speed random', min: 0, max: 10, step: 0.5 })
  .on('change', () => buildFireSprites())

const smokeFolder = pane.addFolder({ title: 'Smoke' })
smokeFolder
  .addBinding(smokeParams, 'count', { label: 'count', min: 1, max: 20, step: 1 })
  .on('change', () => buildSmokeMeshes())
smokeFolder.addBinding(smokeParams, 'speed', { label: 'speed', min: 0, max: 2, step: 0.01 })
smokeFolder.addBinding(smokeParams, 'drift', { label: 'drift X', min: 0, max: 1, step: 0.01 })
smokeFolder.addBinding(smokeParams, 'scale', { label: 'scale', min: 0.1, max: 5, step: 0.1 })
smokeFolder.addBinding(smokeParams, 'minY', { label: 'min Y', min: -2, max: 2, step: 0.1 })
smokeFolder.addBinding(smokeParams, 'maxY', { label: 'max Y', min: 1, max: 10, step: 0.1 })

const shimmerFolder = pane.addFolder({ title: 'Heat Shimmer' })
shimmerFolder.addBinding(uStrength, 'value', { label: 'strength', min: 0, max: 0.03, step: 0.001 })
shimmerFolder.addBinding(uFrequency, 'value', { label: 'frequency', min: 1, max: 12, step: 0.1 })
shimmerFolder.addBinding(uSpeed, 'value', { label: 'speed', min: 0, max: 2, step: 0.05 })
</script>

<template>
  <Plane :args="[25, 25]" :rotation-x="-Math.PI / 2" color="#333" position-y="-0.25" />
  <TresAmbientLight :intensity="1" />
</template>

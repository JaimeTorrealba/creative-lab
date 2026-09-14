<script setup>
import {
  Color,
  Scene,
  PlaneGeometry,
  MeshBasicMaterial,
  CustomBlending,
  ReverseSubtractEquation,
  SrcAlphaFactor,
  OneFactor,
  AddEquation,
  DoubleSide,
  RepeatWrapping,
  WebGLRenderTarget,
  NoColorSpace,
  ColorManagement,
  PMREMGenerator,
  MeshStandardMaterial,
  TextureLoader,
  ObjectSpaceNormalMap,
  Vector2,
  Mesh,
  Object3D
} from 'three'
import { watch } from 'vue'
import { useTres, useLoop } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { useWindowSize, useEventListener } from '@vueuse/core'
import { onMounted } from 'vue'

const { renderer, camera, scene: colorScene } = useTres()
const { width, height } = useWindowSize()

camera.value.up.set(0, 0, 1)
let normalScene = new Scene()
let gray50 = new Color(0.5, 0.5, 0.5)
normalScene.background = gray50

let squareGeometry = new PlaneGeometry(10, 10)

let minusMaterial = new MeshBasicMaterial({
  color: gray50,
  blending: CustomBlending,
  blendEquation: ReverseSubtractEquation,
  blendSrc: SrcAlphaFactor,
  blendDst: OneFactor,
  blendEquationAlpha: AddEquation,
  depthTest: false,
  depthWrite: false,
  transparent: true,
  side: DoubleSide
})

const { state: texture, isLoading } = useTexture('/textures/ripple.png')

watch(isLoading, (v) => {
  if (!v) {
    plusMaterial.map = texture.value
    texture.value.flipY = true
    texture.value.wrapS = RepeatWrapping
    texture.value.wrapT = RepeatWrapping
  }
})
let plusMaterial = new MeshBasicMaterial({
  map: null,
  blending: CustomBlending,
  blendEquation: AddEquation,
  blendSrc: SrcAlphaFactor,
  blendDst: OneFactor,
  depthTest: false,
  depthWrite: false,
  transparent: true,
  side: DoubleSide
})

let normalTarget = new WebGLRenderTarget(width.value, height.value)
normalTarget.texture.colorSpace = NoColorSpace
normalTarget.texture.wrapS = RepeatWrapping
normalTarget.texture.wrapT = RepeatWrapping
let normalTextureUniform = { value: normalTarget.texture }
ColorManagement.enabled = true

const pmremGenerator = new PMREMGenerator(renderer)
pmremGenerator.compileCubemapShader()

/* WATER MATERIAL */
let waterMaterial = new MeshStandardMaterial({
  color: 0x5a75a0,
  metalness: 1,
  roughness: 0.27,
  normalMap: new TextureLoader().load('/textures/water_normal.png', (texture) => {
    texture.flipY = false
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(10, 10)
  }),
  normalMapType: ObjectSpaceNormalMap,
  side: DoubleSide
})

let timeUniform = { value: 0 }
let resolutionUniform = {
  value: new Vector2(width.value, height.value)
}

waterMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.time = timeUniform
  shader.uniforms.resolution = resolutionUniform
  shader.uniforms.normalDisturbance = normalTextureUniform

  let chunk = ''
  for (let dir = 0.1; dir < 2 * Math.PI; dir += (2 * Math.PI) / 3) {
    chunk += `{
					mat2 rot2d = mat2(${Math.cos(dir)}, ${-Math.sin(dir)}, ${Math.sin(dir)}, ${Math.cos(dir)});
					vec3 subNormal = texture2D( normalMap, rot2d * vNormalMapUv + vec2(time*0.03, ${dir}) ).rgb * 2.0 - 1.0;
					subNormal.xy = rot2d * subNormal.xy;
					normal += subNormal;
				}`
  }
  shader.fragmentShader =
    'uniform float time;\n' +
    'uniform vec2 resolution;\n' +
    'uniform sampler2D normalDisturbance;\n' +
    shader.fragmentShader.replace(
      '\t#include <normal_fragment_maps>',
      chunk +
        `


					vec3 ripple = texture2D( normalDisturbance, gl_FragCoord.xy / resolution ).rgb * 2.0 - 1.0;
					normal += 3.0 * ripple;
					#ifdef FLIP_SIDED
						normal = - normal;
					#endif
					#ifdef DOUBLE_SIDED
						normal = normal * faceDirection;
					#endif
					normal = normalize( normalMatrix * normal );
					`
    )
}

/* RIPPLES */
let ripples = []
let order = 0

function makeRipple(x, y, strength) {
  let minusSquare = new Mesh(squareGeometry, minusMaterial.clone())
  normalScene.add(minusSquare)
  minusSquare.renderOrder = order++
  minusSquare.position.set(x, y, 0)
  minusSquare.scale.set(0.1, 0.1, 1)
  minusSquare.material.opacity = strength
  minusSquare.rotation.x = Math.PI * 2

  let plusSquare = new Mesh(squareGeometry, plusMaterial.clone())
  normalScene.add(plusSquare)
  plusSquare.renderOrder = order++
  plusSquare.position.set(x, y, 0)
  plusSquare.scale.set(0.1, 0.1, 1)
  plusSquare.material.opacity = strength
  plusSquare.rotation.x = Math.PI * 2

  ripples.push({ minus: minusSquare, plus: plusSquare })
}

function updateRipples(dt) {
  for (let ripple of ripples) {
    ripple.minus.scale.x += dt
    ripple.minus.scale.y += dt
    ripple.minus.material.opacity -= dt / 6
    ripple.plus.scale.x += dt
    ripple.plus.scale.y += dt
    ripple.plus.material.opacity -= dt / 6
    if (ripple.minus.material.opacity <= 0) {
      normalScene.remove(ripple.minus)
      normalScene.remove(ripple.plus)
      ripples.splice(ripples.indexOf(ripple), 1)
    }
  }
}

let drops = []
function makeDrop(x, y, z) {
  let drop = new Object3D()
  drop.position.set(x, y, z)
  drop.userData.vz = 0
  colorScene.value.add(drop)
  drops.push(drop)
}

function updateDrops(dt) {
  for (let drop of drops) {
    drop.position.z += drop.userData.vz * dt
    drop.userData.vz -= 9.81 * dt
    if (drop.position.z < 0) {
      colorScene.value.remove(drop)
      drops.splice(drops.indexOf(drop), 1)
      makeRipple(drop.position.x, drop.position.y, 0.5)
    }
  }
}

const resize = () => {
  normalTarget.setSize(width.value, height.value)
  resolutionUniform.value.set(width.value, height.value)
}

onMounted(() => {
  resize()
  useEventListener('resize', resize)

  setInterval(() => {
    makeDrop(Math.random() * 30 - 15, Math.random() * 30 - 15, 20)
  }, 750)
})

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  let t = performance.now() / 1000
  let dt = t - timeUniform.value
  timeUniform.value = t

  updateRipples(dt)
  updateDrops(dt)

  renderer.setRenderTarget(normalTarget)
  renderer.render(normalScene, camera.value)

  renderer.setRenderTarget(null)
})
</script>
<template>
  <TresMesh :material="waterMaterial" :position="[0, 0, 0]">
    <TresPlaneGeometry :args="[100, 100]" />
  </TresMesh>
</template>

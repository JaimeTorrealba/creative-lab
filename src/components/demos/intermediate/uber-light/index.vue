<script setup>
import { shallowRef, computed, reactive, onUnmounted } from 'vue'
import { useLoop } from '@tresjs/core'
import { useGLTF, useAnimations } from '@tresjs/cientos'
import { watchOnce } from '@vueuse/core'
import { ShaderMaterial, ConeGeometry, Matrix4, Vector3, Color } from 'three'
import { Pane } from 'tweakpane'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'

const shared = {
  uWorldToLight: { value: new Matrix4() },
  uLightPos: { value: new Vector3() },
  uLightColor: { value: new Color('#fff4d6') },
  uIntensity: { value: 3 },
  uCutOn: { value: 1 },
  uCutOff: { value: 12 },
  uNearEdge: { value: 0.5 },
  uFarEdge: { value: 4 },
  uWidth: { value: 0.35 },
  uHeight: { value: 0.35 },
  uWidthEdge: { value: 0.15 },
  uHeightEdge: { value: 0.15 },
  uRoundness: { value: 1 },
  uAmbient: { value: 0.08 },
  uDiffuse: { value: 1 },
  uSpecular: { value: 0.4 },
  uRoughness: { value: 0.25 },
  uCookie: { value: 0 },
  uCookieScale: { value: 4 }
}

// spreading shared keeps the { value } objects by reference, so every material follows the pane
const makeUberMaterial = (map) =>
  new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      ...shared,
      uMap: { value: map },
      uUseMap: { value: map ? 1 : 0 },
      uBaseColor: { value: new Color('#8a8a8a') }
    }
  })

const groundMaterial = makeUberMaterial(null)

const coneGeometry = new ConeGeometry(0.25, 0.6, 16, 1, true)
coneGeometry.rotateX(-Math.PI / 2)
coneGeometry.translate(0, 0, 0.3)

const lightRef = shallowRef()
const modelReady = shallowRef(false)

const { state, isLoading } = useGLTF('/models/footman/source/Footman_RIG.glb')

const animations = computed(() => state.value?.animations || [])
const model = computed(() => state.value?.scene)
const { actions, mixer } = useAnimations(animations, model)

watchOnce(isLoading, (val) => {
  if (!val) {
    state.value.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = makeUberMaterial(child.material.map)
        child.frustumCulled = false
      }
    })
    actions.Idle.play()
    modelReady.value = true
  }
})

const params = reactive({
  lightPos: { x: 3, y: 5, z: 3 },
  target: { x: 0, y: 1, z: 0 },
  color: '#fff4d6',
  showHelper: true,
  cookie: false
})

const pane = new Pane()

const lightFolder = pane.addFolder({ title: 'Light' })
lightFolder.addBinding(params, 'lightPos', { label: 'position' })
lightFolder.addBinding(params, 'target')
lightFolder.addBinding(params, 'color').on('change', ({ value }) => {
  shared.uLightColor.value.set(value)
})
lightFolder.addBinding(shared.uIntensity, 'value', { label: 'intensity', min: 0, max: 10 })
lightFolder.addBinding(params, 'showHelper', { label: 'helper' })

const distanceFolder = pane.addFolder({ title: 'Distance shaping' })
distanceFolder.addBinding(shared.uCutOn, 'value', { label: 'cut on', min: 0, max: 10, step: 0.01 })
distanceFolder.addBinding(shared.uCutOff, 'value', { label: 'cut off', min: 0, max: 30, step: 0.01 })
distanceFolder.addBinding(shared.uNearEdge, 'value', { label: 'near edge', min: 0, max: 5, step: 0.01 })
distanceFolder.addBinding(shared.uFarEdge, 'value', { label: 'far edge', min: 0, max: 10, step: 0.01 })

const shapeFolder = pane.addFolder({ title: 'Superellipse' })
shapeFolder.addBinding(shared.uWidth, 'value', { label: 'width', min: 0.05, max: 2, step: 0.01 })
shapeFolder.addBinding(shared.uHeight, 'value', { label: 'height', min: 0.05, max: 2, step: 0.01 })
shapeFolder.addBinding(shared.uWidthEdge, 'value', { label: 'width edge', min: 0, max: 1.5, step: 0.01 })
shapeFolder.addBinding(shared.uHeightEdge, 'value', { label: 'height edge', min: 0, max: 1.5, step: 0.01 })
shapeFolder.addBinding(shared.uRoundness, 'value', { label: 'roundness', min: 0, max: 1, step: 0.01 })

const surfaceFolder = pane.addFolder({ title: 'Surface' })
surfaceFolder.addBinding(shared.uAmbient, 'value', { label: 'ambient', min: 0, max: 1, step: 0.01 })
surfaceFolder.addBinding(shared.uDiffuse, 'value', { label: 'diffuse', min: 0, max: 2, step: 0.01 })
surfaceFolder.addBinding(shared.uSpecular, 'value', { label: 'specular', min: 0, max: 2, step: 0.01 })
surfaceFolder.addBinding(shared.uRoughness, 'value', { label: 'roughness', min: 0.05, max: 1, step: 0.01 })

const cookieFolder = pane.addFolder({ title: 'Cookie' })
cookieFolder.addBinding(params, 'cookie', { label: 'enabled' }).on('change', ({ value }) => {
  shared.uCookie.value = value ? 1 : 0
})
cookieFolder.addBinding(shared.uCookieScale, 'value', { label: 'scale', min: 1, max: 16, step: 0.1 })

onUnmounted(() => pane?.dispose())

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  mixer.value?.update(delta)
  const light = lightRef.value
  if (!light) return
  light.position.set(params.lightPos.x, params.lightPos.y, params.lightPos.z)
  light.lookAt(params.target.x, params.target.y, params.target.z)
  // onBeforeRender fires before the renderer's own matrix pass, so update manually
  light.updateMatrixWorld(true)
  shared.uWorldToLight.value.copy(light.matrixWorld).invert()
  shared.uLightPos.value.copy(light.position)
})
</script>
<template>
  <primitive v-if="modelReady" :object="state.scene" />
  <TresMesh :material="groundMaterial" :rotation-x="-Math.PI / 2">
    <TresPlaneGeometry :args="[20, 20]" />
  </TresMesh>
  <TresGroup ref="lightRef">
    <TresMesh :geometry="coneGeometry" :visible="params.showHelper">
      <TresMeshBasicMaterial color="#ffff88" wireframe />
    </TresMesh>
  </TresGroup>
</template>

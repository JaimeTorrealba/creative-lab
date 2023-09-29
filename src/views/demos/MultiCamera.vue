<script setup>
import { computed } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { useAnimations, useGLTF, useTweakPane } from '@tresjs/cientos'
import { PerspectiveCamera, Vector4, Vector3 } from 'three'
import { useWindowSize, useDevicePixelRatio  } from '@vueuse/core'

const { width, height } = useWindowSize()
const { pixelRatio } = useDevicePixelRatio()
const WIDTH = (width.value / 4) * pixelRatio.value
const HEIGHT = (height.value / 4) * pixelRatio.value
const ASPECT_RATIO = computed(() => width.value / height.value)

const cameras = []

const cameraOptions = [
  {
    viewPort: new Vector4(0, 0, Math.ceil(WIDTH * 2), Math.ceil(HEIGHT * 2)),
    position: new Vector3(15, 0, 3),
    factor: 0.4,
    name: 'left_bottom',
  },
  {
    viewPort: new Vector4(Math.floor(WIDTH), 0, Math.ceil(WIDTH * 2), Math.ceil(HEIGHT * 2)),
    position: new Vector3(0, 0, -3),
    factor: 2,
    name: 'center_bottom',
  },
  {
    viewPort: new Vector4(Math.floor(WIDTH * 2), 0, Math.ceil(WIDTH * 2), Math.ceil(HEIGHT * 2)),
    position: new Vector3(-15, 0, 3),
    factor: 0.4,
    name: 'right_bottom',
  },
  {
    viewPort: new Vector4(Math.floor(WIDTH - 75), Math.floor(HEIGHT), Math.ceil(WIDTH * 2.5), Math.ceil(HEIGHT * 2.5)),
    position: new Vector3(0, 0, 3),
    factor: 2,
    name: 'center_top',
  },
]

cameraOptions.forEach(data => {
  const currentCam = new PerspectiveCamera(40, ASPECT_RATIO.value, 0.1, 10)
  currentCam.name = data.name
  currentCam.viewport = data.viewPort
  currentCam.position.set(...data.position)
  currentCam.position.multiplyScalar(data.factor)
  currentCam.lookAt(0, 0, 0)
  currentCam.updateMatrixWorld()
  cameras.push(currentCam)
})

const { scene: model, animations } = await useGLTF('/models/footman/source/Footman_RIG.glb')
const { actions, mixer } = useAnimations(animations, model)

actions.Idle.play()
let currentAction = actions.Idle

currentAction.play()

const { pane } = useTweakPane()

const animationList = pane.addBlade({
  view: 'list',
  label: 'Animations',
  options: [
    { text: 'Idle', value: 'Idle' },
    { text: 'SwordAndShieldCrouchBlockIdle', value: 'SwordAndShieldCrouchBlockIdle' },
    { text: 'SwordAndShieldDeath_2', value: 'SwordAndShieldDeath_2' },
    { text: 'SwordAndShieldIdle', value: 'SwordAndShieldIdle' },
    { text: 'SwordAndShieldKick', value: 'SwordAndShieldKick' },
    { text: 'SwordAndShieldRun(back)', value: 'SwordAndShieldRun(back)' },
    { text: 'SwordAndShieldRun', value: 'SwordAndShieldRun' },
    { text: 'SwordAndShieldSlash_2', value: 'SwordAndShieldSlash_2' },
    { text: 'SwordAndShieldSlash', value: 'SwordAndShieldSlash' },
    { text: 'T-Pose', value: 'T-Pose' },
  ],
  value: 'Idle',
})

animationList.on('change', value => {
  currentAction.stop()
  currentAction = actions[value.value]
  currentAction.play()
})

const { onLoop } = useRenderLoop()

onLoop(() => {
  if (mixer) {
    mixer.update(0.01)
  }
})
</script>
<template>
  <TresCanvas window-size clear-color="#333" class="over-hidden">
    <TresArrayCamera :args="[cameras]" :position="[0, 2, 5]" />
      <primitive :object="model" />
    <TresSpotLight :color="0xf7f7f7" :intensity="1" :position="[0, 0, 5]" />
    <TresAmbientLight :color="0xf7f7f7" :intensity="0.3" />
    <TresDirectionalLight :color="0xf7f7f7" :intensity="0.5" />
    <TresHemisphereLight />
  </TresCanvas>
</template>
<style>
.tp-dfwv{
  z-index: 999;
}
</style> 

<script setup>
import { computed } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { useAnimations, useGLTF, useTweakPane } from '@tresjs/cientos'
import { PerspectiveCamera, Vector4 } from 'three'
import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()
const WIDTH = (width.value / 4) * window.devicePixelRatio
const HEIGHT = (height.value / 4) * window.devicePixelRatio
const ASPECT_RATIO = computed(() => width.value / height.value)

const cameras = []

const subCamera1 = new PerspectiveCamera(40, ASPECT_RATIO.value, 0.1, 10)
subCamera1.viewport = new Vector4(
  Math.floor(0),
  Math.floor(0),
  Math.ceil(WIDTH * 2),
  Math.ceil(HEIGHT * 2)
)
subCamera1.position.x = 15
subCamera1.position.y = 0
subCamera1.position.z = 3
subCamera1.position.multiplyScalar(0.4)
subCamera1.lookAt(0, 0, 0)
subCamera1.updateMatrixWorld()
cameras.push(subCamera1)

const subCamera2 = new PerspectiveCamera(40, ASPECT_RATIO.value, 0.1, 10)
subCamera2.viewport = new Vector4(
  Math.floor(WIDTH),
  Math.floor(0),
  Math.ceil(WIDTH * 2),
  Math.ceil(HEIGHT * 2)
)
subCamera2.position.x = 0
subCamera2.position.y = 0
subCamera2.position.z = -3
subCamera2.position.multiplyScalar(2)
subCamera2.lookAt(0, 0, 0)
subCamera2.updateMatrixWorld()
cameras.push(subCamera2)

const subCamera3 = new PerspectiveCamera(40, ASPECT_RATIO.value, 0.1, 10)
subCamera3.viewport = new Vector4(
  Math.floor(WIDTH * 2),
  Math.floor(0),
  Math.ceil(WIDTH * 2),
  Math.ceil(HEIGHT * 2)
)
subCamera3.position.x = -15
subCamera3.position.y = 0
subCamera3.position.z = 3
subCamera3.position.multiplyScalar(0.4)
subCamera3.lookAt(0, 0, 0)
subCamera3.updateMatrixWorld()
cameras.push(subCamera3)

const subCamera4 = new PerspectiveCamera(40, ASPECT_RATIO.value, 0.1, 10)
subCamera4.viewport = new Vector4(
  Math.floor(WIDTH -75),
  Math.floor(HEIGHT),
  Math.ceil(WIDTH * 2.5),
  Math.ceil(HEIGHT * 2.5)
)
subCamera4.position.x = 0
subCamera4.position.y = 0
subCamera4.position.z = 3
subCamera4.position.multiplyScalar(2)
subCamera4.lookAt(0, 0, 0)
subCamera4.updateMatrixWorld()
cameras.push(subCamera4)

const { scene: model, animations } = await useGLTF('/models/footman/source/Footman_RIG.glb')
const { actions, mixer } = useAnimations(animations, model)

const positionAnimation = Object.keys(actions)
let numberPosition = 0

let currentAction = actions[positionAnimation[numberPosition]]

currentAction.play()

const { pane } = useTweakPane()

const btnNext = pane.addButton({
  title: 'Next',
});
const btnPrev = pane.addButton({
  title: 'Previous',
});

btnNext.on('click', () => {
    if(numberPosition < positionAnimation.length){
        numberPosition ++
    }
  currentAction.stop()
  currentAction = actions[positionAnimation[numberPosition]]
  currentAction.play()
});

btnPrev.on('click', () => {
    if(numberPosition !== 0){
        numberPosition --
    }
  currentAction.stop()
  currentAction = actions[positionAnimation[numberPosition]]
  currentAction.play()
});



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
    <TresMesh v-bind="model" />
    <TresAmbientLight :color="0xffffff" :intensity="1" />
    <TresDirectionalLight :color="0xffffff" :intensity="1" />
    <TresHemisphereLight />
  </TresCanvas>
</template>

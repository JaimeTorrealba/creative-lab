<script setup>
import { watch, shallowRef } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { useWindowSize } from '@vueuse/core'

const canvasRef = shallowRef()
const { width, height } = useWindowSize()
const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(width.value, height.value)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
labelRenderer.domElement.style.pointerEvents = 'none'
labelRenderer.domElement.style.zIndex = '99999999999'
document.body.appendChild(labelRenderer.domElement)

const p = document.createElement('p')
p.textContent = 'Hello World!'
const div = document.createElement('div')
div.appendChild(p)
const label = new CSS2DObject(div)
label.position.set(0, 0.5, 0)

watch(canvasRef, value => {
    value.context.scene.value.add(label)
  }
)

watch(
  () => [width.value, height.value],
  () => {
    labelRenderer.setSize(width.value, height.value)
  }
)

const { onLoop } = useRenderLoop()

onLoop(() => {
  if(canvasRef.value.context.scene.value){
    labelRenderer.render(canvasRef.value.context.scene.value, canvasRef.value.context.camera.value)
  }
})

</script>
<template>
  <TresCanvas window-size clear-color="#333" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresMesh :scale="0.25" >
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshBasicMaterial :color="0x00ff00" />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
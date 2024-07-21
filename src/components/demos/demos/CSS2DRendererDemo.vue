<script setup>
import { watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { useWindowSize } from '@vueuse/core'


const { scene, camera } = useTresContext()
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

scene.value.add(label)

watch(
  () => [width.value, height.value],
  () => {
    labelRenderer.setSize(width.value, height.value)
  }
)

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
    labelRenderer.render(scene.value, camera.value)
})
</script>
<template>
    <TresMesh :scale="0.25" >
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshBasicMaterial :color="0x00ff00" />
      </TresMesh>
</template>
<script setup>
import { shallowRef, onMounted, watchEffect } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { useMouse, useWindowSize } from '@vueuse/core'
import { createSculpture } from 'shader-park-core'
import { spCode } from './spCode'

let params = { time: 0 }
const canvas = shallowRef(null)
const { width, height } = useWindowSize()
const { x, y } = useMouse()

watchEffect(() => {
  x.value = (x.value / width.value)  *3 -1.5
  y.value = -(y.value / height.value) * 2 + 1
})

//Shader Park setup
let mesh = createSculpture(spCode, () => ({
  time: params.time,
  mouse: {x:x.value , y:y.value}
}))

onMounted(() => {
  canvas.value.scene.add(mesh)
})

const { onLoop } = useRenderLoop()

onLoop(() => {
  params.time += 0.025
})
</script>
<template>
  <TresCanvas ref="canvas" window-size clear-color="#c4c4c4" class="over-hidden" grid>
    <TresPerspectiveCamera :position="[0, 0, 5]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
    <TresAmbientLight />
  </TresCanvas>
</template>
<style lang="scss" scoped></style>

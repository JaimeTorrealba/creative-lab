<script setup>
import { watchEffect, shallowRef } from 'vue'
import { Box, Text3D } from '@tresjs/cientos'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { useMouse, useWindowSize } from '@vueuse/core'
import { Vector2 } from 'three'

const { x, y } = useMouse()
const { width, height } = useWindowSize()


const fontPath = 'https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json'

watchEffect(() => {
  x.value = (x.value / width.value) * 2 - 1
  y.value = -(y.value / height.value) * 2 + 1
})

const shader = {
  uniforms: {
    hover: { value: new Vector2(0.5, 0.5) },
  },
  vertexShader: `
  varying vec2 vUv;
  varying vec2 vHover;
  uniform vec2 hover;
  
    void main(){
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
      vHover = hover;
    }
  `,
  fragmentShader: `
  varying vec2 vUv;
  varying vec2 vHover;

    void main(){
      vec2 newVuv = vec2(vUv.x, vUv.y / 2.);
      vec2 newHover = vec2(vHover.x, vHover.y / 2.);
      float strength = distance(newVuv, newHover) * 10.;
      gl_FragColor = vec4(0.3, 0.3, 0.3, strength);
    }
  `
}

const updateUniforms = (ev) => {
      ev.object.material.uniforms.hover.value = ev.uv
}

 const { onLoop } = useRenderLoop()

 onLoop(({ elapsed }) => {
   if (box.value) {
     box.value.map((b, index) => {
       b.value.rotation.y = (index + elapsed) * 0.3
       b.value.rotation.z = (index + elapsed) * 0.3
     })
   }
 })

const box = shallowRef(null)

const boxes = [
  {
    name:"box1",
    color:"blue",
    position:[2,1,-3]
  },
  {
    name:"box2",
    color:"red",
    position:[-2,1,-3]
  },
  {
    name:"box3",
    color:"yellow",
    position:[2,-1,-3]
  },
  {
    name:"box4",
    color:"white",
    position:[-2,-1,-3]
  },
]
</script>
<template>
  <TresCanvas window-size clear-color="#333" class="over-hidden">
    <TresPerspectiveCamera :args="[45, 1, 0.1, 1000]" :position="[0, 0, 1]" />
    <TresMesh
    @pointer-move="(ev) => updateUniforms(ev)"
    >
      <TresPlaneGeometry :args="[2, 1]" />
      <TresShaderMaterial v-bind="shader" :transparent="true" />
    </TresMesh>
    <Suspense>
      <Text3D text="Transparent" :size="0.3" :font="fontPath" :center="true" :position="[-1, 0, -3]" />
    </Suspense>
    <Box v-for="{color, position, name} in boxes" :key="name" ref="box" 
    :color="color"
    :position="position"
    :scale="[0.5, 0.5, 0.5]" />
  </TresCanvas>
</template>

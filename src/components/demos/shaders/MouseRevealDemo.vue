<script setup>
import { watchEffect, shallowRef } from 'vue'
import { Box, Text3D } from '@tresjs/cientos'
import { useLoop } from '@tresjs/core'
import { useMouse, useWindowSize } from '@vueuse/core'
import { Vector2 } from 'three'
import fragment from './shaders/mouse_reveal/fragment.glsl'
import vertex from './shaders/mouse_reveal/vertex.glsl'

const { x, y } = useMouse()
const { width, height } = useWindowSize()
const box = shallowRef(null)
const spotLightRef = shallowRef(null)

const fontPath = 'https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json'

watchEffect(() => {
  x.value = (x.value / width.value) * 2 - 1
  y.value = -(y.value / height.value) * 2 + 1
})

const shader = {
  uniforms: {
    hover: { value: new Vector2(0.5, 0.5) }
  },
  vertexShader: vertex,
  fragmentShader: fragment
}

 const updateUniforms = (ev) => {
   ev.object.material.uniforms.hover.value = ev.uv
 }

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  if (box.value) {
    box.value.map((b, index) => {
      b.instance.rotation.y = (index + elapsed) * 0.3
      b.instance.rotation.z = (index + elapsed) * 0.3
    })
  }
  if (spotLightRef.value) {
    spotLightRef.value.position.set(x.value, y.value, -2)
  }
})

const boxes = [
  {
    name: 'box1',
    color: 'blue',
    position: [2, 1, -3]
  },
  {
    name: 'box2',
    color: 'red',
    position: [-2, 1, -3]
  },
  {
    name: 'box3',
    color: 'yellow',
    position: [2, -1, -3]
  },
  {
    name: 'box4',
    color: 'white',
    position: [-2, -1, -3]
  }
]
</script>
<template>
    <TresMesh :position="[0, 0, -3.5]" receive-shadow>
        <TresPlaneGeometry :args="[10, 10]" />
        <TresMeshStandardMaterial color="#C4C4C4" />
      </TresMesh>
      <!-- Shader wall -->
      <TresMesh @pointermove="(ev) => updateUniforms(ev)" name="wall">
        <TresPlaneGeometry :args="[2, 1]" />
        <TresShaderMaterial v-bind="shader" :transparent="true" />
      </TresMesh>
      <Suspense>
        <Text3D
          text="Transparent"
          :size="0.3"
          :font="fontPath"
          :center="true"
          :position="[0, 0, -3]"
          cast-shadow
          name="text"
        >
          <TresMeshStandardMaterial />
        </Text3D>
      </Suspense>
      <Box
        v-for="{ color, position, name } in boxes"
        :key="name"
        ref="box"
        :color="color"
        :position="position"
        :scale="[0.5, 0.5, 0.5]"
      />
      <TresPointLight ref="spotLightRef" :args="[0xffffff, 7.5]" cast-shadow name="light" />
</template>
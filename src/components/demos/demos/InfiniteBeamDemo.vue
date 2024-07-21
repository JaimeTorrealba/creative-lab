<script setup>
import { shallowRef } from 'vue'
import { useTexture, useLoop } from '@tresjs/core'
import { OrbitControls, Stars } from '@tresjs/cientos'

const beamsGeoRef = shallowRef()
const sunRef = shallowRef()

const { map: sun_color } = await useTexture({ map: '/textures/sun_color.jpg' })

const beamOptions = {
  size: 1,
  vertexColors: false,
  color: 0xc93033,
  transparent: false,
  opacity: 0.8,
  alphaTest: 0.01,
  deepWrite: false,
  sizeAttenuation: true
}

const count = 5000
const range = 20
const position = new Float32Array(count * 3)

for (let i = 0; i < count; i++) {
  const i3 = i * 3
  position[i3] = (Math.random() - 0.5) * 10
  position[i3 + 1] = (Math.random() - 0.5) * 10
  position[i3 + 2] = (Math.random() - 0.5) * 20
}

const velocityArray = new Float32Array(count * 2)
for (let i = 0; i < count * 2; i += 2) {
  velocityArray[i] = ((Math.random() - 0.5) / 5) * 0.1
  velocityArray[i + 1] = (Math.random() / 5) * 0.1 + 0.01
}

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  if (beamsGeoRef.value) {
    const positionArray = beamsGeoRef.value.attributes.position.array
    for (let i = 0; i < beamsGeoRef.value.attributes.position.count; i++) {
      const velocityY = velocityArray[i * 2 + 1]
      positionArray[i * 3 + 2] += velocityY * 15
      if (positionArray[i * 3 + 2] <= -(range * 2) || positionArray[i * 3 + 2] >= range * 2)
        positionArray[i * 3 + 2] = positionArray[i * 3 + 2] * -1
    }
    beamsGeoRef.value.attributes.position.needsUpdate = true
  }
  if (sunRef.value) {
    sunRef.value.rotation.z += 0.001
  }
})
</script>
<template>
    <TresMesh name="sun" ref="sunRef">
        <TresIcosahedronGeometry :args="[10, 16, 16]" />
        <TresMeshStandardMaterial :map="sun_color" />
      </TresMesh>
      <TresPoints :position="[0, 0, 35]">
        <TresPointsMaterial v-bind="beamOptions" />
        <TresBufferGeometry :position="[position, 3]" :velocity="[velocityArray]" ref="beamsGeoRef" />
      </TresPoints>
    <Stars :size="0.1" />
    <OrbitControls />
    <TresAmbientLight />
    <TresHemisphereLight :args="[0xf7f7f7, 0x333, 3]" />
</template>
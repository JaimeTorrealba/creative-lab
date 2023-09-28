<script setup>
import { shallowRef, watch, ref } from 'vue'
import { TresCanvas, useTexture, useRenderLoop } from '@tresjs/core'
import { Vector3, CatmullRomCurve3, BackSide, RepeatWrapping, TubeGeometry } from 'three'
import { useWindowSize, useMouse } from '@vueuse/core'
import { ScrollControls } from '@tresjs/cientos'

const { map, aoMap, normalMap } = await useTexture({
  map: '/textures/tube/Alien_Flesh_001_color.jpg',
  normalMap: '/textures/tube/Alien_Flesh_001_norm.jpg',
  aoMap: '/textures/tube/Alien_Flesh_001_occ.jpg'
})

const tubeMaterialRef = shallowRef(null)
const tubeRef = ref(null)
const progress = ref(0)
const { x, y } = useMouse()
const { width, height } = useWindowSize()

// // Create an empty array to stores the points
const points = []

// // Define points along Z axis
for (var i = 0; i < 5; i += 1) {
  points.push(new Vector3(0, 0, 2.5 * (i / 4)))
}

// // Create a curve based on the points
const curve = new CatmullRomCurve3(points)

watch(tubeMaterialRef, (value) => {
  value.map.wrapS = RepeatWrapping
  value.map.wrapT = RepeatWrapping
  value.normalMap.wrapS = RepeatWrapping
  value.normalMap.wrapT = RepeatWrapping
  value.aoMap.wrapS = RepeatWrapping
  value.aoMap.wrapT = RepeatWrapping
})

watch(progress, value => {
  tubeRef.value.geometry.dispose()
    curve.points[2].x = value * 0.05
    curve.points[2].y = - value * 0.05
    curve.points[4].x = value * 0.005;
  tubeRef.value.geometry = new TubeGeometry(curve, 70, 0.02, 50, false)
})



const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
  if (tubeMaterialRef.value.map) {
     tubeMaterialRef.value.map.offset.x = -(elapsed * 1.5)
  }
})
</script>
<template>
  <TresCanvas window-size clear-color="#ff4444" antialias>
    <TresFog :args="[0x222222, 0.6, 2.8]" />
    <TresPerspectiveCamera :args="[10, width / height, 0.1, 1000]" :position="[0, 0, 0.35]" />
    <ScrollControls :distance="0" v-model="progress" />
    <TresMesh :position="[0, 0, -2]" ref="tubeRef">
      <TresTubeGeometry  :args="[curve, 70, 0.02, 50, false]"  />
      <TresMeshStandardMaterial
        ref="tubeMaterialRef"
        :side="BackSide"
        :map="map"
        :aoMap="aoMap"
        :normalMap="normalMap"
        :map-repeat="[30, 6]"
        :aoMap-repeat="[30, 6]"
        :normalMap-repeat="[30, 6]"
      />
    </TresMesh>
    <TresCatmullRomCurve3 :points="points" />
    <TresDirectionalLight :args="[0xffffff, 0.8]" />
    <TresHemisphereLight :args="[0xffffbb, 0x887979, 0.9]" />
  </TresCanvas>
</template>

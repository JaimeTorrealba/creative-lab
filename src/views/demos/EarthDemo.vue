<script setup>
import { shallowRef, reactive, watch } from 'vue'
import { MouseParallax, Sphere, useTweakPane, Stars } from '@tresjs/cientos'
import { useTexture, TresCanvas, useRenderLoop } from '@tresjs/core'
import { useEventListener } from '@vueuse/core'
import { Vector3, MathUtils } from 'three'

const planeRef = shallowRef(null)
const cloudRef = shallowRef(null)
const markersRef = shallowRef(null)

watch(markersRef, () => {
  setActive({value: 'villarrica'})
})

const { map, normalMap, alphaMap } = await useTexture({
  map: '/textures/8k_earth_daymap.jpg',
  normalMap: '/textures/8k_earth_normal_map.jpg',
  alphaMap: '/textures/8k_earth_clouds.jpg'
})

// markers
const markers = [
  {
    name: 'maracay',
    lat: 10.2,
    lng: -67.57
  },
  {
    name: 'villarrica',
    lat: -39.28,
    lng: -71.98
  },
  {
    name: 'barletta',
    lat: 41.31,
    lng: 16.28
  },
  {
    name: 'santiago',
    lat: -33.45,
    lng: -70.64
  }
]

const latLngToVec3 = (radius, { lat, lng }) => {
  return new Vector3().setFromSphericalCoords(
    radius,
    MathUtils.degToRad(90 - lat),
    MathUtils.degToRad(90 + lng)
  )
}

const { pane } = useTweakPane()
const options = reactive({
  speed: 0.03
})

pane.addInput(options, 'speed', {
  label: 'Speed',
  min: 0,
  max: 0.5,
  step: 0.01
})
const citiList = pane.addBlade({
  view: 'list',
  label: 'Cities where I have lived',
  options: [
    { text: 'maracay', value: 'maracay' },
    { text: 'villarrica', value: 'villarrica' },
    { text: 'barletta', value: 'barletta' },
    { text: 'santiago', value: 'santiago' },
  ],
  value: 'villarrica'
})

const setActive = (value) => {
  const objectMakers = {
    villarrica: markersRef.value.getObjectByName('villarrica'),
    maracay: markersRef.value.getObjectByName('maracay'),
    barletta: markersRef.value.getObjectByName('barletta'),
    santiago: markersRef.value.getObjectByName('santiago')
  }
  Object.keys(objectMakers).forEach((marker) => {
    if (marker === value.value) {
      objectMakers[marker].material.color.set('red')
    } else {
      objectMakers[marker].material.color.set('white')
    }
  })
}

citiList.on('change', (value) => {
  setActive(value)
})

// setActive({value: 'villarrica'})

// DRAG AND DROP
let isDragging = false
let xDrag = {
  target: 0,
  value: 0,
  position: 0,
  mouse: 0
}

useEventListener(document, 'mousedown', (e) => {
  const canvas = document.getElementById('mouse-chg')
  isDragging = true
  canvas.style.cursor = 'grabbing'
  xDrag.mouse = e.clientX
})
useEventListener(document, 'mouseup', () => {
  const canvas = document.getElementById('mouse-chg')
  isDragging = false
  canvas.style.cursor = 'grab'
})
useEventListener(document, 'mousemove', (e) => {
  if (!isDragging) return
  const distance = (e.clientX - xDrag.mouse) * 0.01
  xDrag.target += xDrag.position + distance
  
})
// END DRAG AND DROP

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
  xDrag.value = (xDrag.target - xDrag.value) * 0.005
  if (cloudRef.value) {
    cloudRef.value.value.rotation.y = elapsed * (options.speed + 0.025)
  }
  if (planeRef.value && markersRef.value) {
    planeRef.value.value.rotation.y = xDrag.value
    markersRef.value.rotation.y = xDrag.value
  }
})
</script>
<template>
  <TresCanvas window-size clear-color="#000" id="mouse-chg" ref="canvas">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <MouseParallax :factor="0.05" />
    <Sphere ref="planeRef" :args="[1, 60, 60]" :position="[0, 0, 0]">
      <TresMeshStandardMaterial :map="map" :normalMap="normalMap" />
    </Sphere>
    <Sphere ref="cloudRef" :args="[1.01, 30, 30]" :position="[0, 0, 0]">
      <TresMeshStandardMaterial :transparent="true" :alphaMap="alphaMap" />
    </Sphere>
    <!-- MARKERS -->
    <TresGroup ref="markersRef" name="markers">
      <Sphere
        v-for="{ name, lat, lng } in markers"
        :key="name"
        :args="[0.02, 16, 16]"
        :position="latLngToVec3(1, { lat, lng })"
        :name="name"
      />
    </TresGroup>
    <Stars />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
<style scoped>
#mouse-chg {
  cursor: grab;
}
</style>

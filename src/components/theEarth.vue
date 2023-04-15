<script setup>
import { shallowRef, onMounted, reactive } from 'vue'
import { PamCameraMouse, Sphere, useTweakPane } from '@tresjs/cientos'
import { useTexture, TresCanvas, useRenderLoop, useLoader } from '@tresjs/core'
import { useEventListener } from '@vueuse/core'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import {
  NearestFilter,
  BufferAttribute,
  BufferGeometry,
  PointsMaterial,
  Points,
  Vector3,
  MathUtils
} from 'three'

const planeRef = shallowRef(null)
const cloudRef = shallowRef(null)
const markersRef = shallowRef(null)
const canvas = shallowRef(null)

const { map, normalMap } = await useTexture({
  map: '/textures/8k_earth_daymap.jpg',
  normalMap: '/textures/8k_earth_normal_map.jpg'
})

const alphaMap = await useLoader(TextureLoader, '/textures/8k_earth_clouds.jpg')
const starTexture = await useLoader(
  TextureLoader,
  'https://assets.codepen.io/4698468/startParticle.png'
)

starTexture.minFilter = NearestFilter
starTexture.generateMipmaps = false

const particlesGeometry = new BufferGeometry(1, 32, 32)
const count = 1000

const position = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
  position[i] = (Math.random() - 0.5) * 30
}
particlesGeometry.setAttribute('position', new BufferAttribute(position, 3))
//material
const particlesMaterial = new PointsMaterial()
particlesMaterial.size = 0.1
particlesMaterial.sizeAttenuation = true //mantendrá siempre el tamaño de las particulas sin importar la distancia
particlesMaterial.transparent = true
particlesMaterial.alphaMap = starTexture
particlesMaterial.alphaTest = 0.01

//points

const particles = new Points(particlesGeometry, particlesMaterial)

// markers

const villarrica = {
  lat: -39.28,
  lng: -71.98
}
const maracay = {
  lat: 10.2,
  lng: -67.57
}
const barletta = {
  lat: 41.31,
  lng: 16.28
}

const latLngToVec3 = (radius, { lat, lng }) => {
  return new Vector3().setFromSphericalCoords(
    radius,
    MathUtils.degToRad(90 - lat),
    MathUtils.degToRad(90 + lng)
  )
}

onMounted(() => {
  canvas.value.scene.add(particles)
})

const options = reactive({
  rotation: false,
  speed: 0.03
})

const { pane } = useTweakPane()

pane.addInput(options, 'rotation')
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
    { text: 'Maracay', value: 'mcy' },
    { text: 'Villarrica', value: 'vll' },
    { text: 'barletta', value: 'btt' }
  ],
  value: 'vll'
})

// DRAG AND DROP

let isDragging = false
let xDrag = {
  target: 0,
  value: 0,
  position: 0,
  mouse: 0
}

useEventListener(document, 'mousedown', (e) => {
  isDragging = true
  xDrag.mouse = e.clientX
})

useEventListener(document, 'mouseup', () => {
  isDragging = false
})
useEventListener(document, 'mousemove', (e) => {
  if (!isDragging) return
  const distance = (e.clientX - xDrag.mouse) * 0.01
  xDrag.target = xDrag.position + distance
})

// END DRAG AND DROP

const { onLoop } = useRenderLoop()
onLoop(({ elapsed }) => {
  xDrag.value = (xDrag.target - xDrag.value) * 0.5
  if (cloudRef.value) {
    cloudRef.value.value.rotation.y = elapsed * (options.speed + 0.025)
  }
  if (planeRef.value && markersRef.value && !options.rotation) {
    planeRef.value.value.rotation.y = xDrag.value
    markersRef.value.rotation.y = xDrag.value
  }
  if (planeRef.value && markersRef.value && options.rotation) {
    planeRef.value.value.rotation.y = elapsed * options.speed
    markersRef.value.rotation.y = elapsed * options.speed
  }
  switch (citiList.value) {
    case 'vll':
      markersRef.value.getObjectByName('villarrica').material.color.set('red')
      markersRef.value.getObjectByName('maracay').material.color.set('white')
      markersRef.value.getObjectByName('barletta').material.color.set('white')
      break
    case 'mcy':
      markersRef.value.getObjectByName('villarrica').material.color.set('white')
      markersRef.value.getObjectByName('maracay').material.color.set('red')
      markersRef.value.getObjectByName('barletta').material.color.set('white')
      break
    case 'btt':
      markersRef.value.getObjectByName('villarrica').material.color.set('white')
      markersRef.value.getObjectByName('maracay').material.color.set('white')
      markersRef.value.getObjectByName('barletta').material.color.set('red')
      break

    default:
      break
  }
})
</script>
<template>
  <TresCanvas window-size clear-color="#000" class="over-hidden mouse-chg" ref="canvas">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <PamCameraMouse :factor="0.05" />
    <Sphere ref="planeRef" :args="[1, 60, 60]" :position="[0, 0, 0]">
      <TresMeshStandardMaterial :map="map" :normalMap="normalMap" />
    </Sphere>
    <Sphere ref="cloudRef" :args="[1.01, 30, 30]" :position="[0, 0, 0]">
      <TresMeshStandardMaterial :transparent="true" :alphaMap="alphaMap" />
    </Sphere>
    <!-- MARKERS -->
    <TresGroup ref="markersRef" name="markers">
      <Sphere :args="[0.02, 16, 16]" :position="latLngToVec3(1, villarrica)" name="villarrica" />
      <Sphere :args="[0.02, 16, 16]" :position="latLngToVec3(1, maracay)" name="maracay" />
      <Sphere :args="[0.02, 16, 16]" :position="latLngToVec3(1, barletta)" name="barletta" />
    </TresGroup>

    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
    <TresAmbientLight />
  </TresCanvas>
</template>
<style scoped>
.mouse-chg {
  cursor: grab;
}
</style>

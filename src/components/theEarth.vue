<script setup>
import { shallowRef, onMounted } from 'vue'
import { PamCameraMouse, Sphere } from '@tresjs/cientos'
import { useTexture, TresCanvas, useRenderLoop, useLoader, useTres } from '@tresjs/core'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { NearestFilter, BufferAttribute, BufferGeometry, PointsMaterial, Points } from 'three'

const planeRef = shallowRef(null)
const cloudRef = shallowRef(null)

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

onMounted(() => {
  const { state } = useTres()
  state.scene.add(particles)
})

// extend( particles )

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
  if (planeRef.value) {
    planeRef.value.value.rotation.y = elapsed * 0.3
    cloudRef.value.value.rotation.y = elapsed * 0.25
  }
})
</script>
<template>
  <TresCanvas window-size clear-color="#000" class="over-hidden">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <PamCameraMouse :factor="1" />
    <Sphere ref="planeRef" :args="[1, 60, 60]" :position="[0, 0, 0]">
      <TresMeshStandardMaterial :map="map" :normalMap="normalMap" />
    </Sphere>
    <Sphere ref="cloudRef" :args="[1.01, 30, 30]" :position="[0, 0, 0]">
      <TresMeshStandardMaterial :transparent="true" :alphaMap="alphaMap" />
    </Sphere>

    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
    <TresAmbientLight />
  </TresCanvas>
</template>
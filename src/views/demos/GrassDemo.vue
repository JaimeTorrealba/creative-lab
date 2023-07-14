<script setup>
import { shallowRef, watch } from 'vue'
import { TresCanvas, useRenderLoop, useTexture } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { Vector3, BufferGeometry, RepeatWrapping } from 'three'
import { createNoise4D } from 'simplex-noise'

//add terrain texture

const canvasRef = shallowRef(null)
const planeRef = shallowRef(null)
const pointsRef = shallowRef(null)
const leafRef = shallowRef(null)
const rotationPlane = -Math.PI * 0.5
const vector = new Vector3()
const normal = new Vector3()
const noise4D = createNoise4D()

const floorMap = await useTexture({
  map: 'textures/floor_textures/Ground_Wet_002_basecolor.jpg',
  aoMap: 'textures/floor_textures/Ground_Wet_002_ambientOcclusion.jpg',
  normalMap: 'textures/floor_textures/Ground_Wet_002_normal.jpg',
  roughnessMap: 'textures/floor_textures/Ground_Wet_002_roughness.jpg'
})

const setDefaultTextures = (obj, repeat = [4, 4]) => {
  Object.keys(obj).map((key) => {
    if (obj[key]?.isTexture) {
      obj[key].repeat.set(repeat[0], repeat[1])
      obj[key].wrapS = RepeatWrapping
      obj[key].wrapT = RepeatWrapping
    }
  })
}

setDefaultTextures(floorMap)

const vertices = []
const leaf = []
watch(planeRef, (value) => {
  const sampler = new MeshSurfaceSampler(value).build()
  for (let i = 0; i < 50000; i++) {
    sampler.sample(vector, normal)
    vertices.push(vector.clone())
    leaf.push(vector.clone())
    const end = normal.clone()
    end.normal = vector.clone()
    end.multiplyScalar(0.15).add(vector)
    leaf.push(end)
  }
  //this are the points that we don't needed
  // const pointsGeometry = new BufferGeometry().setFromPoints(vertices)
  // pointsRef.value.geometry = pointsGeometry

  const leafGeometry = new BufferGeometry().setFromPoints(leaf)
  leafRef.value.geometry = leafGeometry
})
const updateFur = (lines, time) => {
  for (let i = 0; i < lines.length; i += 2) {
    const p1 = lines[i]
    const p2 = lines[i + 1]
    const angle = noise4D(p1.x, p1.y, p1.z, time)
    const innerVector = p2.clone()
    innerVector.cross(p2.normal)
    const x = Math.cos(angle)
    const y = Math.sin(angle)
    const intensity = 0.25
    const radius1 = innerVector.multiplyScalar(x * intensity)
    const radius2 = innerVector.multiplyScalar(y * intensity)
    // edit X value
    leafRef.value.geometry.attributes.position.array[(i + 1) * 3] = p2.x + radius1.x + radius2.x
    // edit Y value
    leafRef.value.geometry.attributes.position.array[(i + 1) * 3 + 1] = p2.y + radius1.y + radius2.y
    // edit Z value
    leafRef.value.geometry.attributes.position.array[(i + 1) * 3 + 2] = p2.z + radius1.z + radius2.z
  }
  leafRef.value.geometry.attributes.position.needsUpdate = true
}

const { onLoop } = useRenderLoop()
onLoop(({ elapsed }) => {
  if (leafRef.value) {
    updateFur(leaf, elapsed)
  }
})
</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera
      :position="[0, 3, 7.5]"
      :look-at="[0, 0, 0]"
      :fov="45"
      :aspect="1"
      :near="0.1"
      :far="1000"
    />
    <OrbitControls />
    <TresMesh :rotation="[rotationPlane, 0, 0]" ref="planeRef">
      <TresPlaneGeometry :args="[10, 10, 100, 100]" />
      <TresMeshStandardMaterial
        :map="floorMap.map"
        :aoMap="floorMap.aoMap"
        :normalMap="floorMap.normalMap"
        :roughnessMap="floorMap.roughnessMap"
      />
    </TresMesh>
    <TresPoints ref="pointsRef" :rotation="[rotationPlane, 0, 0]">
      <TresPointsMaterial :color="0xff0000" :size="0.1" />
    </TresPoints>
    <TresLineSegments ref="leafRef" :rotation="[rotationPlane, 0, 0]">
      <TresLineBasicMaterial :color="0x11ff11" />
    </TresLineSegments>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="4" />
    <TresAmbientLight />
  <TresHemisphereLight :args="[0xf7f7f7, 0x333, 1]" />
  </TresCanvas>
</template>

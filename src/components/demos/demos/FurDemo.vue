<script setup>
import { shallowRef, watch } from 'vue'
import { useLoop, useTexture } from '@tresjs/core'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { Vector3, BufferGeometry, RepeatWrapping } from 'three'
import { createNoise4D } from 'simplex-noise'

// TODO FIX

const sphereRef = shallowRef(null)
const pointsRef = shallowRef(null)
const leafRef = shallowRef(null)
const rotationPlane = -Math.PI * 0.5
const vector = new Vector3()
const normal = new Vector3()
const noise4D = createNoise4D()

const floorMap = await useTexture({
  map: 'https://raw.githubusercontent.com/Tresjs/assets/main/textures/haunted-house/grass/color.jpg',
  normalMap: 'https://raw.githubusercontent.com/Tresjs/assets/main/textures/haunted-house/grass/normal.jpg',
  roughnessMap: 'https://raw.githubusercontent.com/Tresjs/assets/main/textures/haunted-house/grass/roughness.jpg',
  aoMap: 'https://raw.githubusercontent.com/Tresjs/assets/main/textures/haunted-house/grass/ambientOcclusion.jpg',
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
watch(sphereRef, (value) => {
  const sampler = new MeshSurfaceSampler(value).build()
  for (let i = 0; i < 5000; i++) {
    sampler.sample(vector, normal)
    vertices.push(vector.clone())
    leaf.push(vector.clone())
    const end = normal.clone()
    end.normal = vector.clone()
    end.multiplyScalar(0.15).add(vector)
    leaf.push(end)
  }
  //this are the points that we don't needed
   const pointsGeometry = new BufferGeometry().setFromPoints(vertices)
   pointsRef.value.geometry = pointsGeometry

  const leafGeometry = new BufferGeometry().setFromPoints(leaf)
  leafRef.value.geometry = leafGeometry
})
const intensity = 20
const updateFur = (lines, time) => {
  for (let i = 0; i < lines.length; i += 2) {
    const p1 = lines[i]
    const p2 = lines[i + 1]
    const angle = noise4D(p1.x, p1.y, p1.z, time)
    const innerVector = p2.clone()
    innerVector.cross(p2.normal)
    const x = Math.cos(angle)
    const y = Math.sin(angle)
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

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  if (leafRef.value) {
    updateFur(leaf, elapsed)
  }
})
</script>
<template>
    <TresMesh ref="sphereRef">
        <TresSphereGeometry :args="[1, 100]" />
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
        <TresLineBasicMaterial :color="0x11ff44" />
      </TresLineSegments>
      <TresDirectionalLight :position="[0, 2, 4]" />
</template>
<script setup>
import { shallowRef, watch } from 'vue'
import { useLoop } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { BoxGeometry, ShaderMaterial, Object3D, InstancedBufferAttribute } from 'three'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { watchOnce } from '@vueuse/core'

const { state: texture, isLoading } = useTexture('/textures/matcap example.png')
watchOnce(isLoading, (value) => {
  if (!value) {
    shader.uniforms.uMatCap.value = texture.value
  }
})

const dummy = new Object3D()
const shader = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uMatCap: { value: null }
  },
  vertexShader: vertex,
  fragmentShader: fragment
})
const geometry = new BoxGeometry(1, 1, 1)
const rows = 100
const count = rows * rows
const random = new Float32Array(count)

const instanceMeshRef = shallowRef(null)

watch(instanceMeshRef, (value) => {
  let index = 0
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < rows; j++) {
      random[index] = Math.random()
      dummy.position.set(i - rows / 2, Math.random(), j - rows)
      dummy.updateMatrix()
      value.setMatrixAt(index++, dummy.matrix)
    }
  }
  value.instanceMatrix.needsUpdate = true
  value.geometry.setAttribute('aRandom', new InstancedBufferAttribute(random, 1))
})

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  if (shader) {
    shader.uniforms.uTime.value += delta
  }
})
</script>
<template>
  <TresInstancedMesh ref="instanceMeshRef" :args="[geometry, shader, count]" />
</template>

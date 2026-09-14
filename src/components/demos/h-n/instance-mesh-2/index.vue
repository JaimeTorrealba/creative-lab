<script setup>
import { shallowRef, watch } from 'vue'
import { useLoop, extend } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { BoxGeometry, ShaderMaterial } from 'three'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { InstancedMesh2 } from '@three.ez/instanced-mesh'
import { watchOnce } from '@vueuse/core'

const { state: texture, isLoading } = useTexture('/textures/matcap example.png')
watchOnce(isLoading, (value) => {
  if (!value) {
    shader.uniforms.uMatCap.value = texture.value
  }
})

extend({ InstancedMesh2 })

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
  value.initUniformsPerInstance({ vertex: { aRandom: 'float' } })
  value.addInstances(count, (obj, index) => {
    obj.position.x = (index % rows) - rows / 2
    obj.position.z = Math.floor(index / rows) - rows / 2
    random[index] = Math.random()
  })
  random.map((_, index) => {
    value.setUniformAt(index, 'aRandom', random[index])
  })
})

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  if (shader) {
    shader.uniforms.uTime.value += delta
  }
})
</script>
<template>
  <TresInstancedMesh2 ref="instanceMeshRef" :args="[geometry, shader, { capacity: count }]" />
</template>

<script setup>
import { shallowRef, watch } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { BoxGeometry, ShaderMaterial, Object3D, InstancedBufferAttribute } from 'three'
import { OrbitControls } from '@tresjs/cientos'
import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()

const dummy = new Object3D();
const material = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    attribute float aRandom;
    void main() {
      vUv = uv;
      vec4 modelPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
      // modelPosition.y += aRandom * sin(uTime + modelPosition.z * 10.0) * 0.1;
      modelPosition.y += aRandom * sin(uTime + 15.*aRandom) * 0.4;
      modelPosition = viewMatrix * modelPosition;
      gl_Position = projectionMatrix * modelPosition;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
    }
  `,
})
const geometry = new BoxGeometry(1, 1, 1)
const rows = 10
const count = rows * rows
const random = new Float32Array(count)

const instanceMeshRef = shallowRef(null)

watch(instanceMeshRef, value=>{
  let index = 0
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < rows; j++) {
      random[index] = Math.random()
      dummy.position.set(i - rows/2, Math.random(), j - rows)
      dummy.updateMatrix()
      value.setMatrixAt(index++, dummy.matrix)
    }
  }
  value.instanceMatrix.needsUpdate = true
  value.geometry.setAttribute('aRandom', new InstancedBufferAttribute(random, 1))
})

const { onLoop } = useRenderLoop()

onLoop(({delta}) => {
  if(material){
    material.uniforms.uTime.value += delta
  }
})
</script>
<template>
  <TresCanvas window-size clear-color="#82DBC5">
    <TresOrthographicCamera :args="[width / - 2, width / 2, height / 2, height / - 2, 1, 1000 ]" :position="[0, 0, 7.0]" :zoom="32" />
    <OrbitControls />
    <TresInstancedMesh ref="instanceMeshRef" :args="[geometry, material, count]" />
  </TresCanvas>
</template>

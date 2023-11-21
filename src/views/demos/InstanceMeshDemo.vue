<script setup>
import { shallowRef, watch } from 'vue'
import { TresCanvas, useRenderLoop, useTexture } from '@tresjs/core'
import { BoxGeometry, ShaderMaterial, Object3D, InstancedBufferAttribute } from 'three'
import { MapControls } from '@tresjs/cientos'
import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()
const { matcap } = await useTexture({
  matcap: '/textures/matcap example.png',
})

const dummy = new Object3D();
const material = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uMatCap: { value: matcap },
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    attribute float aRandom;
    void main() {
      vec4 modelPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
      // modelPosition.y += aRandom * sin(uTime + modelPosition.z * 10.0) * 0.1;
      modelPosition.y += aRandom * sin(uTime + 15.*aRandom) * 0.4;
      modelPosition = viewMatrix * modelPosition;
      gl_Position = projectionMatrix * modelPosition;
      vUv = uv;
      vViewPosition = -modelPosition.xyz;
      // normal
      vNormal = normalMatrix * mat3(instanceMatrix) * normal;
    }
  `,
  fragmentShader: `
    uniform sampler2D uMatCap;
    varying vec2 vUv;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
      vec3 y = cross(viewDir, x);
      vec2 uv = vec2(dot(x, normal), dot(y, normal)) * 0.495 + 0.5;
      vec4 matcapColor = texture2D(uMatCap,uv);
      // gl_FragColor = vec4(vNormal, 1);
      gl_FragColor = matcapColor;
    }
  `,
})
const geometry = new BoxGeometry(1, 1, 1)
const rows = 100
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
  <TresCanvas window-size clear-color="#333">
    <TresOrthographicCamera :args="[width / - 2, width / 2, height / 2, height / - 2, 1, 1000]" :position="[0, 2, 7.0]" :zoom="32" :look-at="[0,0,0]" />
    <MapControls />
    <TresInstancedMesh ref="instanceMeshRef" :args="[geometry, material, count]" />
  </TresCanvas>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { useWindowSize } from '@vueuse/core'
import { Vector2, Vector3 } from 'three'
import fragment from './fragment.glsl'

const { width, height } = useWindowSize()
const { camera } = useTres()
const controlsRef = ref(null)

const shader = {
  vertexShader: `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float time;
  uniform vec2 uResolution;

    void main(){
      gl_Position = vec4(position, 1.0);
      vUv = uv;
      vNormal = normal;
      vPosition = position;
    }
  `,
  fragmentShader: fragment,
  uniforms: {
    uTime: { value: 0 },
    uResolution: {
      value: new Vector2(window.innerWidth, window.innerHeight)
    },
    uCamPos: { value: camera.value.position },
    uCamTarget: { value: new Vector3(0, 1, 6) }
  },
  transparent: true
}

watchEffect(() => {
  shader.uniforms.uResolution.value = new Vector2(width.value, height.value)
})
const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  shader.uniforms.uTime.value = elapsed
})

const onChange = () => {
  shader.uniforms.uCamPos.value = camera.value.position
  if (controlsRef.value) {
    shader.uniforms.uCamTarget.value = controlsRef.value.instance.target
  }
}
</script>
<template>
  <OrbitControls
    ref="controlsRef"
    :target="[0, 1, 6]"
    @change="onChange"
    :keyPanSpeed="2.5"
    :rotateSpeed="0.25"
    :minPolarAngle="Math.PI * 0.45"
    :maxPolarAngle="Math.PI * 6"
    :minAzimuthAngle="-Math.PI * 0.4"
    :maxAzimuthAngle="Math.PI * 0.4"
    :minDistance="5"
    :maxDistance="30"
  />
  <TresMesh>
    <TresPlaneGeometry :args="[2, 2]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>

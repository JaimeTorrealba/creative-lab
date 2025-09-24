<script setup>
import { ref, watch } from 'vue'
import { useTexture } from '@tresjs/cientos'
import { Vector4 } from 'three'
import { useWindowSize, watchOnce } from '@vueuse/core'
import { Pane } from 'tweakpane'
import fragment from './shaders/ChromaticAberration/fragment.glsl'

const { state: texture, isLoading } = useTexture('/images/photo_slider1.jpg')

watchOnce(isLoading, (value) => {
    if (!value) {
        shader.uniforms.difftexture.value = texture.value;
    }
})

const sliderRef = ref(null)
const { width, height } = useWindowSize()
const pane = new Pane()

const shader = {
  uniforms: {
    // progress: { type: 'f', value: 0 },
    red: { type: 'f', value: 0.1 },
    blue: { type: 'f', value: 0.1 },
    green: { type: 'f', value: 0.1 },
    difftexture: { type: 'f', value: null }, // texture 1
    resolution: { type: 'v4', value: new Vector4() }
  },
  vertexShader: `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`,
  fragmentShader: fragment
}


//debugs
pane.addBinding(shader.uniforms.red, 'value',
 { min: 0, max: 0.1, label: 'red' })
pane.addBinding(shader.uniforms.blue, 'value',
 { min: 0, max: 0.1, label: 'blue' })
pane.addBinding(shader.uniforms.green, 'value',
 { min: 0, max: 0.1, label: 'green' })

watch(sliderRef, () => {
  resize()
})
const resize = () => {
  // image cover
  const imageAspect = texture.value.image.height / texture.value.image.width
  let a1
  let a2
  if (height.value / width.value > imageAspect) {
    a1 = (width.value / height.value) * imageAspect
    a2 = 1
  } else {
    a1 = 1
    a2 = height.value / width.value / imageAspect
  }

  sliderRef.value.material.uniforms.resolution.value.x = width.value;
  sliderRef.value.material.uniforms.resolution.value.y = height.value;
  sliderRef.value.material.uniforms.resolution.value.z = a1;
  sliderRef.value.material.uniforms.resolution.value.w = a2;
}

</script>
<template>
  <TresMesh ref="sliderRef">
    <TresPlaneGeometry :args="[5, 5, 100, 100]" />
    <TresShaderMaterial :color="0x00ff00" v-bind="shader" />
  </TresMesh>
</template>
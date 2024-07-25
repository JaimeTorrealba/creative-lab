<script setup>
import { ref, watch } from 'vue'
import { useTexture } from '@tresjs/core'
import { Vector4 } from 'three'
import { gsap } from 'gsap'
import { useWindowSize, useEventListener } from '@vueuse/core'
import fragment from './shaders/slider/fragment.glsl'

const textures = await useTexture([
  '/images/photo_slider1.jpg',
  '/images/photo_slider2.jpg',
  '/images/photo_slider3.jpg'
])

const sliderRef = ref(null)
const canvasRef = ref(null)
let current = ref(0)
const { width, height } = useWindowSize()


const sliderShader = {
  uniforms: {
    progress: { type: 'f', value: 0 },
    intensity: { type: 'f', value: 1 },
    texture1: { type: 'f', value: textures[0] }, // texture 1
    texture2: { type: 'f', value: textures[1] }, // texture 2
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
const next = () => {
  let len = textures.length
  let nextTexture = textures[(current.value + 1) % len]
  sliderRef.value.material.uniforms.texture2.value = nextTexture
  gsap.to(sliderRef.value.material.uniforms.progress, {
    value: 1,
    duration: 1,
    ease: 'power2.inOut',
    onComplete: () => {
      console.log('FINISH')
      current.value = (current.value + 1) % len
      sliderRef.value.material.uniforms.texture1.value = nextTexture
      sliderRef.value.material.uniforms.progress.value = 0
      // this.isRunning = false
    }
  })
}
useEventListener(canvasRef.value, 'resize', (evt) => {
  console.log(evt)
})
watch(sliderRef, () => {
  resize()
})
const resize = () => {
  // image cover
  const imageAspect = textures[0].image.height / textures[0].image.width
  console.log('jaime ~ resize ~ imageAspect:', imageAspect)
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

  //   const dist  = this.camera.position.z;
  //   const height = 1;
  //   this.camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));

  //   this.plane.scale.x = this.camera.aspect;
  //   this.plane.scale.y = 1;

  //   this.camera.updateProjectionMatrix();
}

</script>
<template>
    <TresMesh @click="next()" ref="sliderRef">
        <TresPlaneGeometry :args="[5, 5, 100, 100]" />
        <TresShaderMaterial :color="0x00ff00" v-bind="sliderShader" />
      </TresMesh>
</template>
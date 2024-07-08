<script setup>
import { ref, watch, watchEffect } from 'vue'
import { TresCanvas, useTexture } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { Vector4, Vector2 } from 'three'
import { useWindowSize, useMouse } from '@vueuse/core'
import fragment from '@/components/shaders/ChromaticAberration/fragment.glsl'

const texture = await useTexture(['/images/photo_slider1.jpg'])

const sliderRef = ref(null)
const { width, height } = useWindowSize()
const { x, y } = useMouse()

const sliderShader = {
  uniforms: {
    difftexture: { value: texture },
    resolution: { value: new Vector4() },
    uHover: { value: new Vector2(0.5, 0.5) }
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
watch(sliderRef, () => {
  resize()
})

watchEffect(() => {
  x.value = x.value * 0.5
  y.value = -y.value * 0.5
})

const updateUniforms = (ev) => {
  ev.object.material.uniforms.uHover.value = new Vector2(x.value, y.value);
}
const resize = () => {
  // image cover
  const imageAspect = texture.image.height / texture.image.width
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
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 5]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <TresMesh @pointer-move="(ev) => updateUniforms(ev)" ref="sliderRef">
      <TresPlaneGeometry :args="[5, 5, 100, 100]" />
      <TresShaderMaterial v-bind="sliderShader" transparent />
    </TresMesh>
  </TresCanvas>
</template>
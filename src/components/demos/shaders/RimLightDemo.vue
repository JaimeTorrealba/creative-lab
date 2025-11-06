<script setup>
import { Color } from 'three'
import fragment from './shaders/RimLight/fragment.glsl'
import vertex from './shaders/RimLight/vertex.glsl'
import { Pane } from 'tweakpane'; 

const shader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    rimColor: { value: new Color(0x00ffff) },
    rimPower: { value: 3.0 },
    rimIntensity: { value: 1.5 }
  }
}

const pane = new Pane();
pane.addBinding(shader.uniforms.rimPower, 'value', {
  label: 'Rim Power',
  min: 1,
  max: 10,
  step: 0.1,
})
pane.addBinding(shader.uniforms.rimIntensity, 'value', {
  label: 'Rim Intensity',
  min: 0.5,
  max: 2,
  step: 0.1,
})


</script>
<template>
   <TresMesh>
      <TresSphereGeometry />
      <TresShaderMaterial v-bind="shader" />
   </TresMesh>
</template>
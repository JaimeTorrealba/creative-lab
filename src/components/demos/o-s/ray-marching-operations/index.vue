<script setup>
import { onUnmounted, reactive, watchEffect } from 'vue'
import { useLoop } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import { Vector2, Vector3 } from 'three'
import { Pane } from 'tweakpane'
import fragment from './fragment.glsl'

const { width, height } = useWindowSize()

const OPERATIONS = {
  Union: 0,
  'Smooth union': 1,
  Intersection: 2,
  'Smooth intersection': 3,
  'Subtract box from sphere': 4,
  'Smooth subtract box': 5,
  'Subtract sphere from box': 6,
  'Smooth subtract sphere': 7
}

const shader = {
  vertexShader: `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float time;
  uniform vec2 uResolution;

    void main(){
      //gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      gl_Position = modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
      vNormal = normal;
      vPosition = position;
    }
  `,
  fragmentShader: fragment,
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: new Vector2(0.5, 0.5) },
    uResolution: {
      value: new Vector2(window.innerWidth, window.innerHeight)
    },
    uOperation: { value: 1 },
    uSmoothK: { value: 0.8 },
    uSphereRadius: { value: 1.0 },
    uSphereDepth: { value: 6.0 },
    uBoxSize: { value: 0.75 },
    uBoxSpin: { value: 1.0 },
    uLightPos: { value: new Vector3(0.0, 5.0, 3.0) },
    uShadowStrength: { value: 0.1 },
    uAmbient: { value: 0.03 },
    uDebugMode: { value: 0 }
  },
  transparent: true
}

const uniforms = shader.uniforms

watchEffect(() => {
  uniforms.uResolution.value.set(width.value, height.value)
})

const options = reactive({
  operation: 1,
  smoothK: 0.8,
  sphereRadius: 1.0,
  sphereDepth: 6.0,
  boxSize: 0.75,
  boxSpin: 1.0,
  followMouse: true,
  damping: 0.25,
  lightX: 0.0,
  lightY: 5.0,
  lightZ: 3.0,
  shadowStrength: 0.1,
  debug: 0
})

const updateLight = () => uniforms.uLightPos.value.set(options.lightX, options.lightY, options.lightZ)

const pane = new Pane({ title: 'Ray Marching Operations' })

const bind = (folder, key, opts, apply) =>
  folder.addBinding(options, key, opts).on('change', (ev) => apply(ev.value))

const operation = pane.addFolder({ title: 'Operation' })
bind(operation, 'operation', { label: 'operator', options: OPERATIONS }, (v) => {
  uniforms.uOperation.value = v
})
bind(operation, 'smoothK', { label: 'smooth k', min: 0.01, max: 2, step: 0.01 }, (v) => {
  uniforms.uSmoothK.value = v
})

const shapes = pane.addFolder({ title: 'Shapes' })
bind(shapes, 'sphereRadius', { label: 'sphere r', min: 0.1, max: 3, step: 0.01 }, (v) => {
  uniforms.uSphereRadius.value = v
})
bind(shapes, 'sphereDepth', { label: 'sphere depth', min: 3, max: 12, step: 0.1 }, (v) => {
  uniforms.uSphereDepth.value = v
})
bind(shapes, 'boxSize', { label: 'box size', min: 0.1, max: 2, step: 0.01 }, (v) => {
  uniforms.uBoxSize.value = v
})
bind(shapes, 'boxSpin', { label: 'box spin', min: -3, max: 3, step: 0.01 }, (v) => {
  uniforms.uBoxSpin.value = v
})

const mouse = pane.addFolder({ title: 'Mouse' })
mouse.addBinding(options, 'followMouse', { label: 'follow cursor' })
mouse.addBinding(options, 'damping', { min: 0.02, max: 1, step: 0.01 })

const lighting = pane.addFolder({ title: 'Lighting' })
bind(lighting, 'lightX', { label: 'light x', min: -10, max: 10, step: 0.1 }, updateLight)
bind(lighting, 'lightY', { label: 'light y', min: 0, max: 15, step: 0.1 }, updateLight)
bind(lighting, 'lightZ', { label: 'light z', min: -5, max: 15, step: 0.1 }, updateLight)
bind(lighting, 'shadowStrength', { label: 'shadow', min: 0, max: 1, step: 0.01 }, (v) => {
  uniforms.uShadowStrength.value = v
})

const debug = pane.addFolder({ title: 'Debug' })
bind(
  debug,
  'debug',
  { label: 'view', options: { Shaded: 0, Normals: 1, Distance: 2, Steps: 3 } },
  (v) => (uniforms.uDebugMode.value = v)
)

onUnmounted(() => pane.dispose())

// the shader reconstructs the world position from this, so it stays a plain screen uv
const hoverTarget = new Vector2(0.5, 0.5)

const updateUniforms = (ev) => {
  hoverTarget.copy(ev.uv)
}

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed, delta }) => {
  uniforms.uTime.value = elapsed

  if (!options.followMouse) {
    hoverTarget.set(0.5 + Math.cos(elapsed * 0.6) * 0.22, 0.5 + Math.sin(elapsed * 0.6) * 0.22)
  }

  // a per-frame lerp factor drifts with refresh rate, so raise the retained fraction to the
  // frame count instead — the pane value stays the response at 60fps
  uniforms.uHover.value.lerp(hoverTarget, 1 - Math.pow(1 - options.damping, delta * 60))
})
</script>
<template>
  <!-- onPointermove is the name TresJS registers; @pointer-move compiles to onPointerMove,
       which is not in its supported list and silently never fires -->
  <TresMesh @pointermove="(ev) => updateUniforms(ev)">
    <TresPlaneGeometry :args="[2, 2]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>

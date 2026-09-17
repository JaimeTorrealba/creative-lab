<script setup>
import { onUnmounted, reactive, watchEffect } from 'vue'
import { useLoop } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import { Vector2, Vector3 } from 'three'
import { Pane } from 'tweakpane'
import fragment from './fragment.glsl'

const { width, height } = useWindowSize()

const toRad = (deg) => (deg * Math.PI) / 180

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
    uGlobalScale: { value: 1.0 },
    uGlobalRot: { value: new Vector3() },
    // the cluster the three shapes are built around, so rotating does not swing them off screen
    uPivot: { value: new Vector3(0.0, 1.0, 6.0) },
    uSphereRadius: { value: 1.0 },
    uBoxSize: { value: 0.75 },
    uTwist: { value: 1.0 },
    uTaper: { value: 3.0 },
    uTorusRadius: { value: 0.4 },
    uTorusTube: { value: 0.1 },
    uShowPlane: { value: 1.0 },
    uLightPos: { value: new Vector3(0.0, 5.0, 3.0) },
    uLightFollow: { value: 0.0 },
    uShadowStrength: { value: 0.15 },
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
  scale: 1.0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  autoRotate: 0.2,
  sphereRadius: 1.0,
  boxSize: 0.75,
  twist: 1.0,
  taper: 3.0,
  torusRadius: 0.4,
  torusTube: 0.1,
  showPlane: true,
  lightX: 0.0,
  lightY: 5.0,
  lightZ: 3.0,
  lightFollow: false,
  shadowStrength: 0.15,
  ambient: 0.03,
  debug: 0
})

const updateLight = () => uniforms.uLightPos.value.set(options.lightX, options.lightY, options.lightZ)

const pane = new Pane({ title: 'Ray Marching Tweaks' })

const bind = (folder, key, opts, apply) =>
  folder.addBinding(options, key, opts).on('change', (ev) => apply(ev.value))

const globalFolder = pane.addFolder({ title: 'Global' })
bind(globalFolder, 'scale', { min: 0.2, max: 3, step: 0.01 }, (v) => {
  uniforms.uGlobalScale.value = v
})
bind(globalFolder, 'rotateX', { label: 'rotate x', min: -180, max: 180, step: 1 }, (v) => {
  uniforms.uGlobalRot.value.x = toRad(v)
})
bind(globalFolder, 'rotateZ', { label: 'rotate z', min: -180, max: 180, step: 1 }, (v) => {
  uniforms.uGlobalRot.value.z = toRad(v)
})
// y is written every frame by the auto-rotation, so the slider only seeds it
globalFolder.addBinding(options, 'rotateY', { label: 'rotate y', min: -180, max: 180, step: 1 })
globalFolder.addBinding(options, 'autoRotate', { label: 'auto spin', min: 0, max: 2, step: 0.01 })

const shapes = pane.addFolder({ title: 'Shapes' })
bind(shapes, 'sphereRadius', { label: 'sphere r', min: 0.1, max: 2.5, step: 0.01 }, (v) => {
  uniforms.uSphereRadius.value = v
})
bind(shapes, 'boxSize', { label: 'box size', min: 0.1, max: 2, step: 0.01 }, (v) => {
  uniforms.uBoxSize.value = v
})
bind(shapes, 'twist', { min: 0, max: 3, step: 0.01 }, (v) => {
  uniforms.uTwist.value = v
})
bind(shapes, 'taper', { min: 0.3, max: 5, step: 0.01 }, (v) => {
  uniforms.uTaper.value = v
})
bind(shapes, 'torusRadius', { label: 'torus r', min: 0.1, max: 1.5, step: 0.01 }, (v) => {
  uniforms.uTorusRadius.value = v
})
bind(shapes, 'torusTube', { label: 'torus tube', min: 0.02, max: 0.6, step: 0.01 }, (v) => {
  uniforms.uTorusTube.value = v
})

const scene = pane.addFolder({ title: 'Scene' })
bind(scene, 'showPlane', { label: 'ground' }, (v) => {
  uniforms.uShowPlane.value = v ? 1 : 0
})
bind(scene, 'lightFollow', { label: 'light follows mouse' }, (v) => {
  uniforms.uLightFollow.value = v ? 1 : 0
})
bind(scene, 'lightX', { label: 'light x', min: -10, max: 10, step: 0.1 }, updateLight)
bind(scene, 'lightY', { label: 'light y', min: 0, max: 15, step: 0.1 }, updateLight)
bind(scene, 'lightZ', { label: 'light z', min: -5, max: 15, step: 0.1 }, updateLight)
bind(scene, 'shadowStrength', { label: 'shadow', min: 0, max: 1, step: 0.01 }, (v) => {
  uniforms.uShadowStrength.value = v
})
bind(scene, 'ambient', { min: 0, max: 0.5, step: 0.01 }, (v) => {
  uniforms.uAmbient.value = v
})

const debug = pane.addFolder({ title: 'Debug' })
bind(
  debug,
  'debug',
  { label: 'view', options: { Shaded: 0, Normals: 1, Distance: 2, Steps: 3 } },
  (v) => (uniforms.uDebugMode.value = v)
)

onUnmounted(() => pane.dispose())

const updateUniforms = (ev) => {
  uniforms.uHover.value.copy(ev.uv)
}

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  uniforms.uTime.value = elapsed
  uniforms.uGlobalRot.value.y = toRad(options.rotateY) + elapsed * options.autoRotate
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

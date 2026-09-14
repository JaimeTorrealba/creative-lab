<script setup>
import { onBeforeUnmount } from 'vue'
import * as THREE from 'three/webgpu'
import {
  pass,
  mrt,
  output,
  normalView,
  diffuseColor,
  velocity,
  add,
  vec4,
  packNormalToRGB,
  unpackRGBToNormal,
  sample
} from 'three/tsl'
import { ssgi } from 'three/addons/tsl/display/SSGINode.js'
import { traa } from 'three/addons/tsl/display/TRAANode.js'
import { useLoop, useTres } from '@tresjs/core'
import { Pane } from 'tweakpane'
import CornelBox from '@/components/internals/CornelBox.vue'

const { scene, camera, renderer } = useTres()

const postProcessing = new THREE.PostProcessing(renderer)

const scenePass = pass(scene.value, camera.value)
scenePass.setMRT(
  mrt({
    output: output,
    diffuseColor: diffuseColor,
    normal: packNormalToRGB(normalView),
    velocity: velocity
  })
)

const colorNode = scenePass.getTextureNode('output')
const diffuseNode = scenePass.getTextureNode('diffuseColor')
const depthNode = scenePass.getTextureNode('depth')
const normalNode = scenePass.getTextureNode('normal')
const velocityNode = scenePass.getTextureNode('velocity')

const diffuseTexture = scenePass.getTexture('diffuseColor')
diffuseTexture.type = THREE.UnsignedByteType

const normalTexture = scenePass.getTexture('normal')
normalTexture.type = THREE.UnsignedByteType

const sceneNormal = sample((uv) => unpackRGBToNormal(normalNode.sample(uv)))

const giPass = ssgi(colorNode, depthNode, sceneNormal, camera.value)
giPass.sliceCount.value = 2
giPass.stepCount.value = 8

// AO multiplies the lit image, GI is modulated by albedo so bounced light picks up
// the colour of the surface it came off.
const ao = giPass.getAONode()
const gi = giPass.getGINode()

const composite = vec4(add(colorNode.rgb.mul(ao), diffuseNode.rgb.mul(gi.rgb)), colorNode.a)
composite.name = 'Composite'

const traaPass = traa(composite, depthNode, velocityNode, camera.value)
postProcessing.outputNode = traaPass

const { render } = useLoop()

render((notifySuccess) => {
  postProcessing.render()
  notifySuccess()
})

const pane = new Pane()
const ssgiFolder = pane.addFolder({ title: 'SSGI' })

ssgiFolder.addBinding(giPass.giIntensity, 'value', {
  label: 'GI intensity',
  min: 0,
  max: 30,
  step: 0.5
})
ssgiFolder.addBinding(giPass.aoIntensity, 'value', {
  label: 'AO intensity',
  min: 0,
  max: 2,
  step: 0.05
})
ssgiFolder.addBinding(giPass.sliceCount, 'value', {
  label: 'slice count',
  min: 1,
  max: 4,
  step: 1
})
ssgiFolder.addBinding(giPass.stepCount, 'value', {
  label: 'step count',
  min: 2,
  max: 16,
  step: 1
})

onBeforeUnmount(() => {
  pane.dispose()
})
</script>
<template>
  <CornelBox />
</template>

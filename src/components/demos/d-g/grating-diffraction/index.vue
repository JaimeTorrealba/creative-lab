<script setup>
import { onBeforeUnmount } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { Group } from 'three/webgpu'
import { createDataMaskNode, createDiffractionNode, createDiffractionUniforms } from './diffraction'
import { createDisc } from './disc'
import { createLabelTexture } from './label'
import { createStudio } from './studio'
import { createGratingPane, DISC_PRESETS } from './pane'

const params = {
  preset: 'CD (aluminium)',
  tint: DISC_PRESETS['CD (aluminium)'].tint,
  orbitLight: true,
  orbitSpeed: 0.35,
  orbitRadius: 1.4,
  lightColor: '#fff4e6',
  wobble: true,
  spinSpeed: 0.6
}

const { renderer, scene } = useTres()
const { onBeforeRender } = useLoop()

// TresCanvas initializes WebGPU asynchronously; PMREM needs the backend ready
await renderer.init()

const uniforms = createDiffractionUniforms()
const labelTexture = createLabelTexture()
const dataMaskNode = createDataMaskNode(uniforms)
const { spin, disposeDisc } = createDisc({
  uniforms,
  diffractionNode: createDiffractionNode(uniforms, dataMaskNode),
  dataMaskNode,
  labelTexture
})
const wobble = new Group()
wobble.add(spin)

const { light, marker, fill, disposeStudio } = createStudio({
  renderer,
  scene: scene.value,
  uniforms
})

const setLightColor = (value) => {
  uniforms.lightColor.value.set(value)
  light.color.set(value)
  marker.material.color.set(value)
}
setLightColor(params.lightColor)

const pane = createGratingPane({ uniforms, params, onLightColorChange: setLightColor })

let orbitAngle = 0.6
const updateLight = (delta) => {
  if (params.orbitLight) orbitAngle += params.orbitSpeed * delta
  const radius = params.orbitRadius
  light.position.set(Math.cos(orbitAngle) * radius, Math.sin(orbitAngle) * radius * 0.8, 1.6)
  uniforms.lightPosition.value.copy(light.position)
}

const updateDisc = (delta, elapsed) => {
  spin.rotation.z -= params.spinSpeed * delta
  if (!params.wobble) return
  wobble.rotation.x = Math.sin(elapsed * 0.31) * 0.28
  wobble.rotation.y = Math.sin(elapsed * 0.23 + 1.2) * 0.4
}

onBeforeRender(({ delta, elapsed }) => {
  updateLight(delta)
  updateDisc(delta, elapsed)
})

onBeforeUnmount(() => {
  pane.dispose()
  disposeDisc()
  disposeStudio()
  labelTexture.dispose()
})
</script>

<template>
  <primitive :object="wobble" />
  <primitive :object="light" />
  <primitive :object="fill" />
</template>

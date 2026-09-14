<script setup>
import { shallowRef } from 'vue'
import { useLoop } from '@tresjs/core'
import { SPZLoader } from 'three/addons/loaders/SPZLoader.js'
import { GaussianSplat } from 'three/addons/objects/GaussianSplat.js'

const geometry = await new SPZLoader().loadAsync('/splats/San_Jer_nimo_el_Real_Facade.spz')

const splat = shallowRef(new GaussianSplat(geometry, { autoSort: false }))
splat.value.rotation.x = Math.PI

const { onBeforeRender } = useLoop()
onBeforeRender(({ renderer, camera }) => {
  if (!camera.value) return
  splat.value.updateSort(renderer, camera.value)
  splat.value.updateSphericalHarmonics(renderer, camera.value)
})
</script>

<template>
  <primitive :object="splat" />
  <TresAxesHelper :args="[1]" />
</template>

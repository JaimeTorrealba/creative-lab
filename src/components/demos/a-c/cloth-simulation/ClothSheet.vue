<script setup>
import { shallowRef, onMounted, onUnmounted } from 'vue'
import { useLoop } from '@tresjs/core'
import { DoubleSide } from 'three'
import { Pane } from 'tweakpane'
import { useClothParticles } from './useClothParticles'
import { CLOTH_SEGMENTS, CLOTH_SIZE } from './constants'

const params = { solverIterations: 8 }
const clothRef = shallowRef()
const { dropCloth, setSolverIterations, copyParticlesToGeometry } = useClothParticles()
setSolverIterations(params.solverIterations)

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  if (!clothRef.value) return
  copyParticlesToGeometry(clothRef.value.geometry)
})

let pane

onMounted(() => {
  pane = new Pane()
  pane
    .addBinding(params, 'solverIterations', { min: 1, max: 30, step: 1 })
    .on('change', ({ value }) => setSolverIterations(value))
  pane.addButton({ title: 'Drop cloth' }).on('click', dropCloth)
})

onUnmounted(() => pane?.dispose())
</script>

<template>
  <TresMesh ref="clothRef" :frustum-culled="false" cast-shadow receive-shadow>
    <TresPlaneGeometry :args="[CLOTH_SIZE, CLOTH_SIZE, CLOTH_SEGMENTS - 1, CLOTH_SEGMENTS - 1]" />
    <TresMeshStandardMaterial color="#d9483b" :roughness="0.85" :side="DoubleSide" />
  </TresMesh>
</template>

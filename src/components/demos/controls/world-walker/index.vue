<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { Precipitation, Sky } from '@tresjs/cientos'
import { Physics } from '@tresjs/rapier'
import { Pane } from 'tweakpane'
import Terrain from './Terrain.vue'
import Footman from './Footman.vue'
import { TERRAIN_SIZE } from './constants'

const params = reactive({ debug: false })
let pane

onMounted(() => {
  pane = new Pane()
  pane.addBinding(params, 'debug')
})

onUnmounted(() => pane?.dispose())
</script>
<template>
  <TresFog color="#626A71" :near="0.1" :far="100" />
  <Precipitation :area="[TERRAIN_SIZE, 10, TERRAIN_SIZE]" :count="4000" :size="0.05" />
  <Sky />
  <Physics :debug="params.debug">
    <Terrain />
    <Footman />
  </Physics>
  <TresDirectionalLight :position="[0, 20, 40]" :intensity="1.75" />
  <TresAmbientLight :intensity="0.75" />
</template>

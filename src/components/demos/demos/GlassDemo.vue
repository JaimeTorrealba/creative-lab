<script setup>
import { shallowRef, reactive, watch } from 'vue'
import { useTexture } from '@tresjs/core'
import { EquirectangularReflectionMapping } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { Pane } from 'tweakpane';

const { map } = await useTexture({map:'/textures/glassMorphismTexture.jpg'})
const { map:normalMap } = await useTexture({map:'/textures/glassMorphismNormal.jpg'})
const { map:earthNormalMap } = await useTexture({map:'/textures/8k_earth_normal_map.jpg'})
const planeRef = shallowRef(null)
const materialRef = shallowRef(null)

watch(materialRef, value => {
  console.log('jaime ~ value:', value);
})

const hdrEquirect = await new RGBELoader().load(
    "/textures/empty_warehouse_01_2k.hdr",
    () => {
      hdrEquirect.mapping = EquirectangularReflectionMapping;
    }
  );

  const options = reactive({
    transmission: 1,
    thickness: 0.5,
    roughness: 0,
    envMap: hdrEquirect,
    clearcoatNormalMap: normalMap,
    envMapIntensity: 1.5,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    clearcoatNormalScale: 0.3,
  })

  const pane = new Pane();

  pane.addBinding(options, 'transmission', {
  label: 'transmission',
  min: 0,
  max: 1,
  step: 0.01,
})
pane.addBinding(options, 'thickness', {
  label: 'thickness',
  min: 0,
  max: 1,
  step: 0.01,
})
  pane.addBinding(options, 'envMapIntensity', {
  label: 'envMapIntensity',
  min: 0,
  max: 3,
  step: 0.1,
})
  pane.addBinding(options, 'roughness', {
  label: 'roughness',
  min: 0,
  max: 1,
  step: 0.01,
})
  pane.addBinding(options, 'clearcoat', {
  label: 'clearcoat',
  min: 0,
  max: 1,
  step: 0.01,
})
  pane.addBinding(options, 'clearcoatRoughness', {
  label: 'clearcoatRoughness',
  min: 0,
  max: 1,
  step: 0.01,
})
pane.addBinding(options, 'clearcoatNormalScale', {
  label: 'clearcoatNormalScale',
  min: 0,
  max: 25,
  step: 0.01,
})


const hdrEquiredButton = pane.addButton({
  title: 'Set hdrEquired',
});
hdrEquiredButton.on('click', () => {
    options.envMap = options.envMap ? null : hdrEquirect
});

const chgNormalButton = pane.addButton({
  title: 'Change normal',
});
chgNormalButton.on('click', () => {
    options.clearcoatNormalMap = options.clearcoatNormalMap.uuid === normalMap.uuid ? earthNormalMap : normalMap
});
</script>
<template>
    <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
    <TresMesh :position="[-0, 0, 0]">
        <TresIcosahedronGeometry :args="[1, 10]" />
        <TresMeshPhysicalMaterial v-bind="options" ref="materialRef" />
    </TresMesh>
    <TresMesh ref="planeRef" :position="[0,0, -1]">
        <TresPlaneGeometry :args="[5, 5]" />
        <TresMeshBasicMaterial :map="map"  />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
    <TresAmbientLight />
</template>
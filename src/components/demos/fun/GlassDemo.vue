<script setup>
import { shallowRef, reactive } from 'vue'
import { useTexture, Environment } from '@tresjs/cientos'
import { EquirectangularReflectionMapping } from 'three'
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader";
import { Pane } from 'tweakpane';

const { state:map } = useTexture('/textures/glassMorphismTexture.jpg')
const { state:normalMap } = useTexture('/textures/glassMorphismNormal.jpg')
const { state:earthNormalMap } = useTexture('/textures/8k_earth_normal_map.jpg')
const planeRef = shallowRef(null)

const hdrEquirect = await new HDRLoader().load(
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
    clearcoatNormalMap: normalMap.value,
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
    options.clearcoatNormalMap = options.clearcoatNormalMap.uuid === normalMap.value.uuid ? earthNormalMap.value : normalMap.value
});
</script>
<template>
  <Environment files="/textures/empty_warehouse_01_2k.hdr" :background="true" />
    <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
    <TresMesh :position="[-0, 0, 0]">
        <TresIcosahedronGeometry :args="[1, 10]" />
        <TresMeshPhysicalMaterial v-bind="options" />
    </TresMesh>
    <TresMesh ref="planeRef" :position="[0,0, -1]">
        <TresPlaneGeometry :args="[5, 5]" />
        <TresMeshBasicMaterial :map="map"  />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
    <TresAmbientLight />
</template>
<script setup>
import { shallowRef } from 'vue'
import { OrbitControls } from '@tresjs/cientos'
import { useTexture, TresCanvas, useRenderLoop } from '@tresjs/core'
import { Shape, EquirectangularReflectionMapping, MeshPhysicalMaterial } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

const { map } = await useTexture({map:'/textures/texture.jpg'})
const planeRef = shallowRef(null)
const icoRef = shallowRef(null)

const hdrEquirect = new RGBELoader().load(
    "/textures/empty_warehouse_01_2k.hdr",
    () => {
      hdrEquirect.mapping = EquirectangularReflectionMapping;
    }
  );

  const glassMaterial = new MeshPhysicalMaterial({
    transmission: 1,
    thickness: 0.5,
    roughness: 0,
    envMap: hdrEquirect
  });

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
  if (icoRef.value) {
    icoRef.value.rotation.y = Math.cos(elapsed * 0.3)
  }
})

const length = 1, width = 1;

const shape = new Shape();
shape.moveTo( 0,0 );
shape.lineTo( 0, width );
shape.lineTo( length, width );
shape.lineTo( length, 0 );
shape.lineTo( 0, 0 );

const extrudeSettings = {
	steps: 2,
	depth: 1,
	bevelEnabled: true,
	bevelThickness: 1,
	bevelSize: 1,
	bevelOffset: 0,
	bevelSegments: 1
};

</script>
<template>
  <TresCanvas window-size clear-color="#F7F7F7" class="over-hidden"
  grid >
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresMesh ref="icoRef" :scale="0.5" :position="[0.5, 0.5, 0]">
        <TresExtrudeGeometry :args="[shape, extrudeSettings]"  />
        <TresMeshPhysicalMaterial v-bind="glassMaterial" />
    </TresMesh>
    <TresMesh  :scale="0.5" :position="[-1, -0.5, 0]">
        <TresIcosahedronGeometry :args="[1, 5]" />
        <TresMeshPhysicalMaterial v-bind="glassMaterial" />
    </TresMesh>
    <TresMesh ref="planeRef" :position="[0,0, -1]">
        <TresPlaneGeometry :args="[5, 5]" />
        <TresMeshBasicMaterial :map="map"  />
    </TresMesh>


    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
    <TresAmbientLight />
  </TresCanvas>
</template>
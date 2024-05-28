<script setup>
import { shallowRef } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { Spherical, Vector3 } from 'three'

const boxRef = shallowRef(null)

const coords = new Spherical(1.25, 0, Math.PI / 2) // radius, phi, theta. phi has to be 90deg in order to play with the angles
const vector3 = new Vector3().setFromSphericalCoords(coords.radius, coords.phi, coords.theta) 

const { onLoop } = useRenderLoop()

onLoop(({elapsed}) => {
  if(!boxRef.value) return
  coords.phi = elapsed 
  // coords.theta = Math.sin(elapsed * 0.5 )
  vector3.setFromSphericalCoords(coords.radius, coords.phi, coords.theta)
  boxRef.value.position.set(vector3.x, vector3.y, vector3.z)
})

</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0,0, 5]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresMesh ref="boxRef" :position="[...vector3]" >
      <TresBoxGeometry :args="[0.5, 0.5, 0.5]" />
      <TresMeshBasicMaterial :color="0x00ff00" />
    </TresMesh>
    <TresPolarGridHelper :rotation-x="Math.PI *0.5" :radius="10" :sectors="16" :rings="8" :divisions="64"  />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
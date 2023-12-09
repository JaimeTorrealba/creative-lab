
<script setup>
import { TresCanvas } from '@tresjs/core'
import { useGLTF } from '@tresjs/cientos';
import OnFirstPersonControls from '@/components/onFirstPersonControls/OnFirstPersonControls.vue'

const { scene } = await useGLTF('/models/PixelArt Medieval Sword.glb')

const keyboardMap = [
  { name: "forward", keys: ['w', 'W'] },
  { name: "backward", keys: ['s', 'S'] },
  { name: "leftward", keys: ['a', 'A'] },
  { name: "rightward", keys: ['d', 'D'] },
  { name: "jump", keys: [" "] },
  { name: "run", keys: ["Shift"] },
  {
    name: "actions",
    actions: [
      { name: "action1", keys: ['e', 'E'], action: () => console.log('action1') },
      { name: "action2", keys: ['f', 'F'], action: () => console.log('action2') },
      { name: "action3", keys: ['q', 'Q'], action: () => console.log('action3') },
      { name: "action4", keys: ['r', 'R'], action: () => console.log('action4') },
    ],
  },
  { name: "wheelActionUp", action: () => console.log('up') },
  { name: "wheelAction", action: () => console.log('down') },
]

</script>
<template>
  <TresCanvas window-size clear-color="#f7f7f7" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OnFirstPersonControls :controlsKeys="keyboardMap">
      <TresGroup>
        <primitive :object="scene" :scale="0.5" :position="[-4.5, -3, -5]" :rotation="[0, 1, 0]" />
      </TresGroup>
      <TresGroup>
        <TresMesh :scale="2.5" :rotation="[1, 0, 1]" :position="[4, 0, -5]">
          <TresBoxGeometry :args="[0.1, 0.1, 1]" />
          <TresMeshBasicMaterial :color="0x00ff00" />
        </TresMesh>
      </TresGroup>
      <!-- <TresGroup>
        <TresMesh :scale="2.5" :rotation="[1, 0, 1]" :position="[0, -2, -5]">
          <TresBoxGeometry :args="[0.1, 0.1, 1]" />
          <TresMeshBasicMaterial :color="0xff0000" />
        </TresMesh>
      </TresGroup> -->
    </OnFirstPersonControls>
    <!-- 
      -->
    <!-- <Suspense>
      <Weapon />
    </Suspense> -->
    <!-- <Sky /> -->
    <TresGridHelper :args="[100, 100]" :position-y="-2" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
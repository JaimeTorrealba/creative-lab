
<script setup>
import { TresCanvas } from '@tresjs/core'
import { useGLTF, Sky } from '@tresjs/cientos';
import OnFirstPersonControls from '@/components/onFirstPersonControls/OnFirstPersonControls.vue'

const { scene } = await useGLTF('/models/PixelArt Medieval Sword.glb')

const keyboardMap = [
  { name: "backward", key: 's' },
  { name: "forward", key: 'w'  },
  // { name: "leftward", key: 'a' },
  // { name: "rightward", key: 'd'},
  { name: "jump", key: "Space" },
  { name: "run", key: "Shift" },
  { name: "leftClick", action: () => console.log('left click') },
  {
    name: "actions",
    actions: [
      { name: "action1", key: 'e', action: () => console.log('action1 e') },
      { name: "action2", key: 'f', action: () => console.log('action2 f') },
      { name: "action3", key: 'q', action: () => console.log('action3 q') },
      { name: "action4", key: 'r', action: () => console.log('action4 r') },
    ],
  },
  { name: "wheelActionUp", action: () => console.log('up') },
  { name: "wheelActionDown", action: () => console.log('down') },
]

</script>
<template>
  <TresCanvas window-size clear-color="#f7f7f7" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OnFirstPersonControls :controlsKeys="keyboardMap" >
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
    <Sky />
    <TresGridHelper :args="[100, 100]" :position-y="-2" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
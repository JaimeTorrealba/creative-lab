<script setup>
import { ref, shallowRef } from 'vue'
import { useGLTF } from '@tresjs/cientos';
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { fpsControls, MobileJoystick } from '@jaimebboyjt/tres-fps-controls'
import gsap from 'gsap';

const { scene } = await useGLTF('/models/PixelArt Medieval Sword.glb')

const roundBoxGeometry = new RoundedBoxGeometry(1, 1, 1, 2, 1);
const showBar = ref(false)
const shooter = shallowRef(false)

// watch(shooter, (value) => {
//   console.log('jaime ~ watch ~ value:', value);
// })

const keyboardMap = [
    { name: "jump", key: "Space" },
    { name: "run", key: "Shift", speed: 0.5 },
    { name: "creep", key: "q" },
    { name: "leftClick", action: () => animationSword() },
    {
        name: "actions",
        actions: [
            { name: "action1", key: 'e', action: () => shooter.value.moveMethods.forward() },
            { name: "action2", key: 'f', action: () => shooter.value.moveMethods.stopCreep() },
            // { name: "action3", key: 'q', action: () => console.log('action3 q') },
            { name: "action4", key: 'r', action: () => shooter.value.moveMethods.creep() },
        ],
    },
    { name: "wheelActionUp", action: () => showHide() },
    { name: "wheelActionDown", action: () => console.log('down') },
]

const animationSword = () => {
    gsap.to(scene.children[0].position, { x: 2, duration: 0.12 })
    gsap.to(scene.children[0].position, { x: 0, duration: 0.12, delay: 0.12 })
}
const showHide = () => {
    showBar.value = !showBar.value
    scene.visible = showBar.value
}

const onState = e => {
    const { forward, backward, leftward, rightward } = e.direction
    const direction = {}

    direction.forward = forward
    direction.backward = backward
    direction.leftward = leftward
    direction.rightward = rightward
    direction.state = e.state
    //console.table(direction)
}

</script>
<template>
    <fpsControls :controls-keys="keyboardMap">
    <primitive ref="" :object="scene" :scale="0.5" :position="[-4.5, -3, -5]" :rotation="[0, 1, 0]" />
    <TresMesh :scale="2.5" :rotation="[1, 0, 1]" :position="[-4.5, -3, -5]" :visible="!showBar">
        <TresBoxGeometry :args="[0.1, 0.1, 1]" />
        <TresMeshBasicMaterial :color="0x00ff00" />
    </TresMesh>
    <MobileJoystick />
    </fpsControls>
    <!-- 
      <MobileJoystick />
     -->
    <TresMesh :geometry="roundBoxGeometry">
        <TresMeshBasicMaterial :color="0x00ff00" wireframe />
    </TresMesh>
    <TresGridHelper :args="[100, 100]" :position-y="-2" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
</template>
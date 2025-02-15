<script setup>
import { useGLTF } from '@tresjs/cientos'
import { Pane } from 'tweakpane';

const { scene: model } = await useGLTF('/models/ant.glb')

const bones = [];
model.traverse((object) => {
    if (object.isBone) {
        bones.push(object);
    }
});

const hornTipL_Armature = bones.find((bone) => bone.name === 'hornTipL_Armature');
const hornBaseL_Armature = bones.find((bone) => bone.name === 'hornBaseL_Armature');

const pane = new Pane();
// left horn
const hornTipL_ArmatureFolder = pane.addFolder({ title: 'Horn Tip L' });
hornTipL_ArmatureFolder.addBinding(hornTipL_Armature.rotation, 'x', { min: -1, max: 1, label: 'rotate x' });
hornTipL_ArmatureFolder.addBinding(hornTipL_Armature.rotation, 'y', { min: -1, max: 1, label: 'rotate y' });
hornTipL_ArmatureFolder.addBinding(hornTipL_Armature.rotation, 'z', { min: -1, max: 1, label: 'rotate z' });

const hornBaseL_ArmatureFolder = pane.addFolder({ title: 'Horn Base L' });
hornBaseL_ArmatureFolder.addBinding(hornBaseL_Armature.rotation, 'x', { min: -1, max: 1, label: 'rotate x' });
hornBaseL_ArmatureFolder.addBinding(hornBaseL_Armature.rotation, 'y', { min: -1, max: 1, label: 'rotate y' });
hornBaseL_ArmatureFolder.addBinding(hornBaseL_Armature.rotation, 'z', { min: -1, max: 1, label: 'rotate z' });

// right horn
const hornTipR_Armature = bones.find((bone) => bone.name === 'hornTipR_Armature');
const hornBaseR_Armature = bones.find((bone) => bone.name === 'hornBaseR_Armature');

const hornTipR_ArmatureFolder = pane.addFolder({ title: 'Horn Tip R' });
hornTipR_ArmatureFolder.addBinding(hornTipR_Armature.rotation, 'x', { min: -1, max: 1, label: 'rotate x' });
hornTipR_ArmatureFolder.addBinding(hornTipR_Armature.rotation, 'y', { min: -1, max: 1, label: 'rotate y' });
hornTipR_ArmatureFolder.addBinding(hornTipR_Armature.rotation, 'z', { min: -1, max: 1, label: 'rotate z' });

const hornBaseR_ArmatureFolder = pane.addFolder({ title: 'Horn Base R' });
hornBaseR_ArmatureFolder.addBinding(hornBaseR_Armature.rotation, 'x', { min: -1, max: 1, label: 'rotate x' });
hornBaseR_ArmatureFolder.addBinding(hornBaseR_Armature.rotation, 'y', { min: -1, max: 1, label: 'rotate y' });
hornBaseR_ArmatureFolder.addBinding(hornBaseR_Armature.rotation, 'z', { min: -1, max: 1, label: 'rotate z' });

// head
const head_Armature = bones.find((bone) => bone.name === 'head_Armature');
const head_ArmatureFolder = pane.addFolder({ title: 'Head' });
head_ArmatureFolder.addBinding(head_Armature.rotation, 'x', { min: -1, max: 1, label: 'rotate x' });
head_ArmatureFolder.addBinding(head_Armature.rotation, 'y', { min: -1, max: 1, label: 'rotate y' });
head_ArmatureFolder.addBinding(head_Armature.rotation, 'z', { min: -1, max: 1, label: 'rotate z' });
head_ArmatureFolder.addBinding(head_Armature.position, 'x', { min: -1, max: 1, label: 'pos x' });
head_ArmatureFolder.addBinding(head_Armature.position, 'y', { min: -1, max: 1, label: 'pos y' });
head_ArmatureFolder.addBinding(head_Armature.position, 'z', { min: -1, max: 1, label: 'pos z' });

</script>
<template>
    <primitive :object="model" :scale="8" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="1" />
    <TresAmbientLight :intensity="1" />
</template>
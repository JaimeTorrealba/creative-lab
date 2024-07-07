<script setup>
import { watch, shallowRef, ref } from 'vue'
import { useLoop } from '@tresjs/core'
import { Matrix4 } from 'three'


const rotationMatrix = new Matrix4().makeRotationX(Math.PI / 180);
const translationMatrix = ref(new Matrix4().makeTranslation(0, 1, -0.5))

const boxRef = shallowRef(null)

watch(boxRef, (box) => {
    const pivot_inv = new Matrix4().invert(new Matrix4(), false);
    box.applyMatrix4(pivot_inv);

    box.applyMatrix4(translationMatrix.value)
    box.matrixWorldNeedsUpdate = true
})


const { onBeforeRender } = useLoop()

onBeforeRender(() => {
    if (!boxRef.value) return
    boxRef.value.applyMatrix4(rotationMatrix)

})
</script>
<template>
    <TresMesh ref="boxRef">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshBasicMaterial :color="0x00ff00" />
    </TresMesh>
    <TresGridHelper :rotation-x="Math.PI * 0.5" :size="10" :divisions="10" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
</template>
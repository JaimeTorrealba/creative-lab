<script setup>
import { ref, shallowRef } from 'vue'
import { useTresContext, useRenderLoop } from '@tresjs/core'
import { useFBO, useTweakPane } from '@tresjs/cientos'

const fboTarget = useFBO()
const fboTarget2 = useFBO()
const currentScene = ref()
const exampleScene = shallowRef()
const renderedScene = shallowRef()

const { camera, renderer, scene } = useTresContext()

const { pane } = useTweakPane()

const changeScene = pane.addButton({
    title: 'Change Scene',
});
changeScene.on('click', () => {
    currentScene.value = currentScene.value === 'exampleScene' ? 'renderedScene' : 'exampleScene'
});

const { onLoop } = useRenderLoop()

onLoop(() => {
    if (renderer.value) {
        renderedScene.value.visible = true;
        exampleScene.value.visible = false;

        renderer.value.setRenderTarget(fboTarget.value);

        renderer.value.render(scene.value, camera.value);
        // renderer.value.setRenderTarget(fboTarget.value)
        // renderer.value.render(scene.value, camera.value)
        // renderer.value.setRenderTarget(fboTarget2.value)
    }
})
</script>
<template>
    <TresGroup ref="renderedScene">
        <TresMesh>
            <TresBoxGeometry :args="[1, 1, 1]" />
            <TresMeshStandardMaterial :color="0x00ff44" />
        </TresMesh>
    </TresGroup>
    <TresGroup ref="exampleScene">
        <TresMesh>
            <TresSphereGeometry :args="[0.75, 16]" />
            <TresMeshStandardMaterial :color="0xffff44" />
        </TresMesh>
    </TresGroup>
</template>
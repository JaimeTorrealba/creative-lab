<script setup>
import { ref, shallowRef } from 'vue'
import { useTresContext, useRenderLoop } from '@tresjs/core'
import { useFBO, useTweakPane } from '@tresjs/cientos'


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
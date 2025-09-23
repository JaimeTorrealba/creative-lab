<script setup>
import { Stars, MouseParallax, Smoke } from '@tresjs/cientos'
// import { EffectComposer, BloomPmndrs } from '@tresjs/post-processing'
</script>
<template>
    <TresFogExp2 :color="0x03544e" :density="0.001" />
    <MouseParallax :factor="1" />

    <Stars />
    <!-- <Suspense>
        <EffectComposer>
            <BloomPmndrs :luminance-threshold="15" :luminance-smoothing="0.1" :intensity="0.15" :radius="0.25" />
        </EffectComposer>
    </Suspense> -->
    <Suspense>
        <Smoke texture='/textures/smoke.png' :segments="2" :width="4" :depth="1" :position="[0, 0, -7.5]" />
    </Suspense>
    <TresPointLight name="orange" :args="[0xcc6600, 50, 45, 1.7]" :position="[-1, -1, -2.5]" />
    <TresPointLight name="red" :args="[0xd8547e, 50, 45, 1.7]" :position="[1, 1, -2.5]" />
    <TresPointLight name="blue" :args="[0x3677ac, 50, 45, 1.7]" :position="[0, 0, -2.5]" />
    <TresDirectionalLight :args="[0xff8c19]" :position="[0, 0, 1]" />
    <TresAmbientLight :args="[0x555555]" />
</template>
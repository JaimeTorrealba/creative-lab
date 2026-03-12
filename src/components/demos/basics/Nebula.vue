<script setup>
import { onMounted, onBeforeUnmount, reactive, shallowRef } from 'vue'
import { useTres, useLoop } from '@tresjs/core'
import { Smoke } from '@tresjs/cientos'
import { EffectComposerPmndrs, BloomPmndrs } from '@tresjs/post-processing'
import { Pane } from 'tweakpane'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader'
import { EquirectangularReflectionMapping } from 'three'

const url = "/textures/NightSkyHDRI008_2K_HDR.exr"
const { scene } = useTres()
let pane

const bloom = reactive({
    luminanceThreshold: 0,
    luminanceSmoothing: 0.1,
    intensity: 1,
    radius: 0.25,
    mipmapBlur: false,
})

const smoke = reactive({
    scale: 3,
    width: 4,
    depth: 1,
    segments: 4,
})
await new EXRLoader().load(
    url,
    (environment) => {
        environment.mapping = EquirectangularReflectionMapping;
      scene.value.environment = environment
      scene.value.background = environment
    }
  );

onMounted(() => {
    pane = new Pane({ title: 'Bloom' })
    pane.addBinding(bloom, 'luminanceThreshold', { min: 0, max: 30, step: 0.01, label: 'Threshold' })
    pane.addBinding(bloom, 'luminanceSmoothing', { min: 0, max: 1, step: 0.01, label: 'Smoothing' })
    pane.addBinding(bloom, 'intensity', { min: 0, max: 5, step: 0.01, label: 'Intensity' })
    pane.addBinding(bloom, 'radius', { min: 0, max: 1, step: 0.01, label: 'Radius' })
    pane.addBinding(bloom, 'mipmapBlur', { label: 'Mipmap Blur' })

    pane.addBinding(smoke, 'scale', { min: 0.1, max: 20, step: 0.1, label: 'Smoke Scale' })
    pane.addBinding(smoke, 'width', { min: 0.1, max: 20, step: 0.1, label: 'Smoke Width' })
    pane.addBinding(smoke, 'depth', { min: 0.1, max: 20, step: 0.1, label: 'Smoke Depth' })
    pane.addBinding(smoke, 'segments', { min: 1, max: 64, step: 1, label: 'Smoke Segments' })
})

onBeforeUnmount(() => {
    pane?.dispose()
})

const smoke1 = shallowRef()
const smoke2 = shallowRef()
const smoke3 = shallowRef()

const { onBeforeRender } = useLoop()

const multiplier = 0.25

onBeforeRender(({elapsed}) => {
    smoke1.value.instance.position.y = Math.sin(elapsed) * multiplier
    smoke1.value.instance.position.x = Math.cos(elapsed) * multiplier
    smoke2.value.instance.position.z = Math.cos(elapsed) * multiplier
    smoke2.value.instance.position.x = Math.cos(elapsed) * multiplier
    smoke3.value.instance.position.z = Math.cos(elapsed) * multiplier
    smoke3.value.instance.position.y = Math.cos(elapsed) * multiplier
})


</script>
<template>
    <TresFogExp2 :color="0x03544e" :density="0.001" />
    <Suspense>
        <EffectComposerPmndrs>
            <BloomPmndrs
                :luminance-threshold="bloom.luminanceThreshold"
                :luminance-smoothing="bloom.luminanceSmoothing"
                :intensity="bloom.intensity"
                :radius="bloom.radius"
                :mipmap-blur="bloom.mipmapBlur"
            />
        </EffectComposerPmndrs>
    </Suspense>
    <Suspense>
        <Smoke ref="smoke1" texture='/textures/smoke.png' :scale="smoke.scale" :color="0xf7f7f7" :segments="smoke.segments" :width="smoke.width" :depth="smoke.depth" :position="[0, 0, 0]" />
    </Suspense>
    <Suspense>
        <Smoke ref="smoke2" texture='/textures/smoke.png' :scale="smoke.scale" :color="0xf7f7f7" :segments="smoke.segments" :width="smoke.width" :depth="smoke.depth" :position="[2, 2, 0]" />
    </Suspense>
    <Suspense>
        <Smoke ref="smoke3" texture='/textures/smoke.png' :scale="smoke.scale" :color="0xf7f7f7" :segments="smoke.segments" :width="smoke.width" :depth="smoke.depth" :position="[-2, -2, 0]" />
    </Suspense>
    <TresPointLight name="orange" :args="[0xcc6600, 50, 45, 1.7]" :position="[-1, -1, -2.5]" />
    <TresPointLight name="red" :args="[0xd8547e, 50, 45, 1.7]" :position="[1, 1, -2.5]" />
    <TresPointLight name="blue" :args="[0x3677ac, 50, 45, 1.7]" :position="[0, 0, -2.5]" />
    <TresDirectionalLight :args="[0xff8c19]" :position="[0, 0, 1]" />
    <TresAmbientLight :args="[0x555555]" />
</template>
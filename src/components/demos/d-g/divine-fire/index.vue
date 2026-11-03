<script setup>
import { onMounted, onUnmounted, reactive } from 'vue'
import { useLoop } from '@tresjs/core'
import { EffectComposerPmndrs, BloomPmndrs } from '@tresjs/post-processing'
import { createSharedFireUniforms, FIRE_DEFAULTS } from './fireUniforms'
import { applyDivineFire, igniteFire } from './divineFire'
import { attachFireLight, updateFireLight } from './fireLight'
import { createSubjects, disposeSubject } from './subjects'
import { createFirePane } from './firePane'

const { onBeforeRender } = useLoop()

const fireParams = { ...FIRE_DEFAULTS }
const uniforms = createSharedFireUniforms(fireParams)
const sceneParams = { showSource: true, wireframe: false, animate: true, lightStrength: 6 }
const bloom = reactive({ intensity: 1.2, threshold: 0.7 })

const subjects = await createSubjects()

const fires = subjects.map(({ key, root }, index) => ({
  ...applyDivineFire(root, uniforms),
  key,
  light: attachFireLight(root),
  seed: index * 17.3
}))

const trigger = {
  burning: Object.fromEntries(fires.map(({ key }) => [key, true])),
  leadIn: 1.2,
  leadOut: 1.5
}

const pane = createFirePane({ fires, trigger, fireParams, uniforms, sceneParams, bloom })

onMounted(() => fires.forEach((fire) => igniteFire(fire, trigger.leadIn)))

onBeforeRender(({ delta, elapsed }) => {
  uniforms.uTime.value = elapsed
  if (sceneParams.animate) subjects.forEach(({ mixer }) => mixer?.update(delta))
  fires.forEach(({ light, intensity, seed }) => {
    updateFireLight(light, intensity.value, sceneParams.lightStrength, elapsed, seed)
  })
})

onUnmounted(() => {
  pane.dispose()
  fires.forEach((fire) => fire.dispose())
  subjects.forEach(disposeSubject)
})
</script>

<template>
  <primitive v-for="subject in subjects" :key="subject.key" :object="subject.root" />
  <TresMesh :rotation-x="-Math.PI / 2">
    <TresPlaneGeometry :args="[14, 14]" />
    <TresMeshStandardMaterial color="#17110d" :roughness="1" />
  </TresMesh>
  <TresAmbientLight :intensity="0.35" />
  <TresDirectionalLight :position="[-4, 6, 3]" :intensity="0.6" color="#9fb4ff" />
  <Suspense>
    <EffectComposerPmndrs>
      <BloomPmndrs
        :intensity="bloom.intensity"
        :luminance-threshold="bloom.threshold"
        :luminance-smoothing="0.2"
        mipmap-blur
      />
    </EffectComposerPmndrs>
  </Suspense>
</template>

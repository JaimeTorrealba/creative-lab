<script setup>
import { ref, computed, watch } from 'vue'
import { useAnimations, useGLTF } from '@tresjs/cientos'

const { state } = useGLTF('/models/jaimeAvatar.glb')

const animations = computed(() => state.value?.animations || [])
const model = computed(() => state?.value?.scene)
const { actions } = useAnimations(animations, model)

const currentAction = ref()

watch(actions, (newActions) => {
  currentAction.value = newActions.animation_0
  currentAction.value.play()
})

</script>
<template>
    <primitive v-if="model" :object="model" :scale="0.5" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="1" />
    <TresAmbientLight :intensity="1" />
    <TresAxesHelper :size="1" />
</template>
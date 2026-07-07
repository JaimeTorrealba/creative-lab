<script setup>
import { Text3D } from '@tresjs/cientos'
import { shallowRef } from 'vue'
import { useLoop } from '@tresjs/core'

const fontPath = 'https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json'

const textGroupRef = shallowRef()

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  if (!textGroupRef.value) return
  textGroupRef.value.rotation.y += 0.004
})
</script>

<template>
  <TresGroup ref="textGroupRef">
    <Suspense>
      <Text3D
        :font="fontPath"
        :size="2"
        :height="0.5"
        :bevel-enabled="true"
        :bevel-thickness="0.05"
        :bevel-size="0.03"
        center
      >
        404
        <TresMeshNormalMaterial />
      </Text3D>
    </Suspense>
  </TresGroup>
</template>

<script setup>
import { useTres } from '@tresjs/core'
import { shallowRef } from 'vue'
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark'

const { renderer } = useTres()

const spark = shallowRef(new SparkRenderer({ renderer }))
const splatMesh = shallowRef(new SplatMesh({ url: '/splats/San_Jer_nimo_el_Real_Facade.ply' }))
splatMesh.value.rotation.x = Math.PI
</script>

<template>
  <primitive :object="spark" />
  <primitive :object="splatMesh" />
</template>

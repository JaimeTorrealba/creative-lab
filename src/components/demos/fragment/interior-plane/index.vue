<script setup>
import { Color } from 'three'
import { onMounted, onUnmounted } from 'vue'
import { useTextures } from '@tresjs/cientos'
import { watchOnce } from '@vueuse/core'
import { Pane } from 'tweakpane'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'

const uniforms = {
  uInteriorDepth: { value: 1.5 },
  uInteriorRowCount: { value: 1.0 },
  uInteriorColCount: { value: 1.0 },
  uShadowIntensity: { value: 0.5 },

  uBackWallColor: { value: new Color('#444') },
  uBackWallTexture: { value: null },
  uBackWallHasTexture: { value: false },
  uBackWallTextureEnabled: { value: false },

  uLeftWallColor: { value: new Color('#444') },
  uLeftWallTexture: { value: null },
  uLeftWallHasTexture: { value: false },
  uLeftWallTextureEnabled: { value: false },

  uRightWallColor: { value: new Color('#444') },
  uRightWallTexture: { value: null },
  uRightWallHasTexture: { value: false },
  uRightWallTextureEnabled: { value: false },

  uCeilWallColor: { value: new Color('#444') },
  uCeilWallTexture: { value: null },
  uCeilWallHasTexture: { value: false },
  uCeilWallTextureEnabled: { value: false },

  uFloorWallColor: { value: new Color('#444') },
  uFloorWallTexture: { value: null },
  uFloorWallHasTexture: { value: false },
  uFloorWallTextureEnabled: { value: false },

  uFrontWallTexture: { value: null },
  uFrontWallHasTexture: { value: false },
  uFrontWallTextureEnabled: { value: false }
}

const { textures, isLoading } = useTextures([
  '/textures/interior_plane/back.png',
  '/textures/interior_plane/wall.png',
  '/textures/interior_plane/ceiling.png',
  '/textures/interior_plane/floor.png'
])

watchOnce(isLoading, (v) => {
  if (v) return
  const [back, wall, ceil, floor] = textures.value

  uniforms.uBackWallTexture.value = back
  uniforms.uBackWallHasTexture.value = true
  uniforms.uBackWallTextureEnabled.value = true

  uniforms.uLeftWallTexture.value = wall
  uniforms.uLeftWallHasTexture.value = true
  uniforms.uLeftWallTextureEnabled.value = true

  uniforms.uRightWallTexture.value = wall
  uniforms.uRightWallHasTexture.value = true
  uniforms.uRightWallTextureEnabled.value = true

  uniforms.uCeilWallTexture.value = ceil
  uniforms.uCeilWallHasTexture.value = true
  uniforms.uCeilWallTextureEnabled.value = true

  uniforms.uFloorWallTexture.value = floor
  uniforms.uFloorWallHasTexture.value = true
  uniforms.uFloorWallTextureEnabled.value = true
})

const params = {
  depth: 1.5,
  rows: 1,
  cols: 1,
  shadow: 0.5
}

let pane

onMounted(() => {
  pane = new Pane({ title: 'Interior Plane' })

  pane
    .addBinding(params, 'depth', { min: 0.1, max: 5, step: 0.01, label: 'Depth' })
    .on('change', ({ value }) => {
      uniforms.uInteriorDepth.value = value
    })

  pane
    .addBinding(params, 'rows', { min: 1, max: 6, step: 1, label: 'Rows' })
    .on('change', ({ value }) => {
      uniforms.uInteriorRowCount.value = value
    })

  pane
    .addBinding(params, 'cols', { min: 1, max: 6, step: 1, label: 'Cols' })
    .on('change', ({ value }) => {
      uniforms.uInteriorColCount.value = value
    })

  pane
    .addBinding(params, 'shadow', { min: 0, max: 1, step: 0.01, label: 'Shadow' })
    .on('change', ({ value }) => {
      uniforms.uShadowIntensity.value = value
    })
})

onUnmounted(() => pane?.dispose())
</script>

<template>
  <TresMesh :scale="[2, 2, 1]">
    <TresPlaneGeometry :args="[1, 1]" />
    <TresShaderMaterial :vertex-shader="vertex" :fragment-shader="fragment" :uniforms="uniforms" />
  </TresMesh>
</template>

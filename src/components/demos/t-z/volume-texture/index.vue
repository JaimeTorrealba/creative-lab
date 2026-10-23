<script setup>
import { onBeforeUnmount } from 'vue'
import { useLoop } from '@tresjs/core'
import {
  BackSide,
  BoxGeometry,
  EdgesGeometry,
  LineBasicNodeMaterial,
  LineSegments,
  Mesh,
  MeshBasicNodeMaterial
} from 'three/webgpu'
import { PAWPAWSAURUS_VOLUME, createVolumeTexture, fetchVolumeBytes } from './volume'
import { createPaletteTexture, fillPaletteTexture } from './palettes'
import { createVolumeColorNode, createVolumeUniforms } from './raycast'
import { createVolumePane } from './pane'

const params = {
  palette: 'RdPu',
  invertColor: true,
  shading: true,
  autoRotate: true,
  rotationSpeed: 0.2,
  showOutline: true
}

const volumeBytes = await fetchVolumeBytes(PAWPAWSAURUS_VOLUME.url)
const volumeTexture = createVolumeTexture(volumeBytes, PAWPAWSAURUS_VOLUME.dimensions)
const paletteTexture = createPaletteTexture(params.palette)
const uniforms = createVolumeUniforms()

// Back faces only, so the volume still renders when the camera is inside the box
const boxGeometry = new BoxGeometry(1, 1, 1)
const volumeMaterial = new MeshBasicNodeMaterial({
  side: BackSide,
  transparent: true,
  depthWrite: false
})
volumeMaterial.colorNode = createVolumeColorNode(
  volumeTexture,
  paletteTexture,
  uniforms,
  PAWPAWSAURUS_VOLUME.dimensions
)
const volumeMesh = new Mesh(boxGeometry, volumeMaterial)
volumeMesh.scale.set(...PAWPAWSAURUS_VOLUME.scale)

const outlineGeometry = new EdgesGeometry(boxGeometry)
const outlineMaterial = new LineBasicNodeMaterial({ color: '#555555' })
const outline = new LineSegments(outlineGeometry, outlineMaterial)
volumeMesh.add(outline)

const pane = createVolumePane({
  uniforms,
  params,
  onPaletteChange: (paletteName) => fillPaletteTexture(paletteTexture, paletteName),
  onOutlineChange: (visible) => (outline.visible = visible)
})

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  if (params.autoRotate) volumeMesh.rotation.y += params.rotationSpeed * delta
})

const disposables = [
  volumeTexture,
  paletteTexture,
  boxGeometry,
  outlineGeometry,
  volumeMaterial,
  outlineMaterial
]

onBeforeUnmount(() => {
  pane.dispose()
  disposables.forEach((resource) => resource.dispose())
})
</script>

<template>
  <primitive :object="volumeMesh" />
</template>

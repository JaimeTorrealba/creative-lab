<script setup>
import { shallowRef, watch, reactive, computed, ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stats, useTweakPane } from '@tresjs/cientos';
import { MeshLambertMaterial, BoxGeometry, Object3D, InstancedMesh } from 'three';
import { getBlock, setBlockInstanceId, setBlockId } from '@/utils/minecraftHelpers'
import { createNoise2D } from 'simplex-noise'

// CONSTANTS
const canvasRef = shallowRef(null)
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshLambertMaterial({ color: 0x00ff00 });
const data = ref([])
const size = reactive({
  width: 32,
  height: 16,
})
const options = reactive({
  scale: 30,
  magnitude: 0.5,
  offset: 0.2
})
const count = computed(() => size.width * size.width * size.height)

const { pane } = useTweakPane()
pane.addBinding(size, 'width', {
  label: 'Width',
  min: 1,
  max: 64,
  step: 1,
})
pane.addBinding(size, 'height', {
  label: 'Height',
  min: 1,
  max: 64,
  step: 1,
})
pane.addBinding(options, 'scale', {
  label: 'Scale',
  min: 1,
  max: 60,
  step: 1
})
pane.addBinding(options, 'magnitude', {
  label: 'Magnitude',
  min: 0,
  max: 1,
  step: 0.1
})
pane.addBinding(options, 'offset', {
  label: 'Offset',
  min: 0,
  max: 1,
  step: 0.1
})

watch([size, options], () => {
  initializedTerrain()
  generateTerrain()
  uploadInstanceMatrix()
})
watch(canvasRef, () => {
  initializedTerrain()
  generateTerrain()
  uploadInstanceMatrix()
})

// METHODS
const uploadInstanceMatrix = () => {
  canvasRef.value.context.scene.value.clear()
  const instanceMesh = new InstancedMesh(geometry, material, count.value)
  const dummy = new Object3D();
  instanceMesh.clear()
  let index = 0
  for (let x = 0; x < size.width; x++) {
    for (let y = 0; y < size.height; y++) {
      for (let z = 0; z < size.width; z++) {
        const blockId = getBlock(x, y, z, { data, size }).id
        const instanceId = index
        if (blockId !== 0) {
          dummy.position.set(x + 0.5, y + 0.5, z + 0.5)
          dummy.updateMatrix()
          instanceMesh.setMatrixAt(instanceId, dummy.matrix)
          setBlockInstanceId(x, y, z, instanceId, { data, size })
          index++
        }
      }
    }
  }
  instanceMesh.instanceMatrix.needsUpdate = true
  canvasRef.value.context.scene.value.add(instanceMesh)
}
const initializedTerrain = () => {
  data.value = [];
  for (let x = 0; x < size.width; x++) {
    const slice = []
    for (let y = 0; y < size.height; y++) {
      const row = []
      for (let z = 0; z < size.width; z++) {
        row.push({
          id: 0,
          instanceId: null
        })
      }
      slice.push(row)
    }
    data.value.push(slice)
  }
}
const generateTerrain = () => {
  const noise2D = createNoise2D()
  for (let x = 0; x < size.width; x++) {
    for (let z = 0; z < size.width; z++) {
      const value = noise2D(x / options.scale, z / options.scale)
      const scaledNoise = options.offset + options.magnitude * value
      let height = scaledNoise * size.height
      height = Math.max(0, Math.min(height, size.height - 1))
      for (let y = 0; y <= height; y++) {
        setBlockId(x, y, z, 1, { data, size })
      }
    }
  }
}

</script>
<template>
  <TresCanvas window-size clear-color="#80a0e0" ref="canvasRef">
    <TresPerspectiveCamera :position="[-32, 16, -32]" :fov="45" :aspect="1" :near="0.1" :far="1000"
      :look-at="[0, 0, 0]" />
    <OrbitControls />
    <Stats />
    <TresDirectionalLight :position="[1, 1, 1]" />
    <TresDirectionalLight :position="[-1, 1, -0.5]" />
    <TresAmbientLight />
  </TresCanvas>
</template>
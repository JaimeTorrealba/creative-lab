<script setup>
import { shallowRef, watch, reactive, computed, ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stats, useTweakPane } from '@tresjs/cientos';
import { MeshLambertMaterial, BoxGeometry, Object3D, InstancedMesh, Color } from 'three';
import { getBlock, setBlockInstanceId, setBlockId, blocks, isBlockObscured } from '@/utils/minecraftHelpers'
import { createNoise2D } from 'simplex-noise'
import alea from 'alea';

// CONSTANTS
const canvasRef = shallowRef(null)
const instanceMesh = shallowRef(null)
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshLambertMaterial();

const data = ref([])
const size = reactive({
  width: 32,
  height: 16,
})
const options = reactive({
  scale: 30,
  magnitude: 0.5,
  offset: 0.2,
  seeds: 60
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
pane.addBinding(options, 'seeds', {
  label: 'Seeds',
  min: 0,
  max: 200,
  step: 5
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
const disposeScene = () => {
  const scene = canvasRef.value.context.scene.value
  instanceMesh.value && scene.remove(instanceMesh.value)
  scene.traverse(obj => {
    if (obj.dispose) obj.dispose();
  })
}
const uploadInstanceMatrix = () => {
  disposeScene()
  instanceMesh.value = new InstancedMesh(geometry, material, count.value)
  const dummy = new Object3D();
  let index = 0
  for (let x = 0; x < size.width; x++) {
    for (let y = 0; y < size.height; y++) {
      for (let z = 0; z < size.width; z++) {
        const blockId = getBlock(x, y, z, { data, size }).id
        const blockType = Object.values(blocks).find(block => block.id === blockId)
        const instanceId = index
        if (blockId !== blocks.empty.id && !isBlockObscured(x, y, z, {data, size})) {
          dummy.position.set(x + 0.5, y + 0.5, z + 0.5)
          dummy.updateMatrix()
          instanceMesh.value.setMatrixAt(instanceId, dummy.matrix)
          instanceMesh.value.setColorAt(instanceId, new Color(blockType?.color))
          setBlockInstanceId(x, y, z, instanceId, { data, size })
          index++
        }
      }
    }
  }
  instanceMesh.value.instanceMatrix.needsUpdate = true
  canvasRef.value.context.scene.value.add(instanceMesh.value)
}
const initializedTerrain = () => {
  data.value = [];
  for (let x = 0; x < size.width; x++) {
    const slice = []
    for (let y = 0; y < size.height; y++) {
      const row = []
      for (let z = 0; z < size.width; z++) {
        row.push({
          id: blocks.empty.id,
          instanceId: null
        })
      }
      slice.push(row)
    }
    data.value.push(slice)
  }
}
const generateTerrain = () => {
  const prng = alea(options.seeds);
  const noise2D = createNoise2D(prng)
  for (let x = 0; x < size.width; x++) {
    for (let z = 0; z < size.width; z++) {
      const value = noise2D(x / options.scale, z / options.scale)
      const scaledNoise = options.offset + options.magnitude * value
      let height = scaledNoise * size.height
      height = Math.max(0, Math.min(Math.floor(height), size.height - 1))
      for (let y = 0; y < size.height; y++) {
        if (y === height) {
          setBlockId(x, y, z, blocks.grass.id, { data, size })
        } else if (y < height) {
          setBlockId(x, y, z, blocks.dirt.id, { data, size })
        } else if(y > height) {
          setBlockId(x, y, z, blocks.empty.id, { data, size })
        }
      }
    }
  }
}

</script>
<template>
  <TresCanvas window-size clear-color="#80a0e0" ref="canvasRef">
    <TresPerspectiveCamera :position="[45, 45, 45]" :fov="45" :aspect="1" :near="0.1" :far="1000" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <Stats />
    <TresDirectionalLight :intensity="100" :position="[-1, 1, -0.5]" />
    <TresAmbientLight />
  </TresCanvas>
</template>
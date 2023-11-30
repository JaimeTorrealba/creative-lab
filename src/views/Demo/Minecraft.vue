<script setup>
import { shallowRef, watch, reactive, computed } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stats, useTweakPane } from '@tresjs/cientos';
import { MeshLambertMaterial, BoxGeometry, Object3D, InstancedMesh } from 'three';

const canvasRef = shallowRef(null)
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshLambertMaterial({ color: 0x00ff00 });

const size = reactive({
  width: 16,
  height: 8,
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
const btn = pane.addButton({
  title: 'Generate',
  label: 'World',   // optional
});
btn.on('click', () => {
  uploadInstanceMatrix()
});

watch(canvasRef, () => {
  uploadInstanceMatrix()
})

const uploadInstanceMatrix = () => {
  canvasRef.value.context.scene.value.clear()
  const instanceMesh = new InstancedMesh(geometry, material, count.value)
  const dummy = new Object3D();
  instanceMesh.clear()
  let index = 0
  for (let x = 0; x < size.width; x++) {
    for (let y = 0; y < size.height; y++) {
      for (let z = 0; z < size.width; z++) {
        dummy.position.set(x + 0.5, y + 0.5, z + 0.5)
        dummy.updateMatrix()
        instanceMesh.setMatrixAt(index++, dummy.matrix)
      }
    }
  }
  instanceMesh.instanceMatrix.needsUpdate = true
  canvasRef.value.context.scene.value.add(instanceMesh)
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
    <TresAmbientLight :intensity="0.1" />
  </TresCanvas>
</template>
<script setup>
import { reactive, shallowRef, watch } from 'vue';
import { Box3, Vector3, Raycaster, Object3D } from 'three';
import { Pane } from 'tweakpane';
import { RoundedBox } from '@tresjs/cientos'

const torusRef = shallowRef()
const roundedBoxRef = shallowRef()
const instanceMeshRef = shallowRef()

let voxels = [];
let dummy, rayCaster, rayCasterIntersects = [];

rayCaster = new Raycaster();
const pane = new Pane();

const params = reactive({
    gridSize: 0.24,
    boxSize: .24,
    boxRoundness: .03
});

pane.addBinding(params, 'gridSize', {
    min: 0.1,
    max: 1,
    step: 0.1
});
pane.addBinding(params, 'boxSize', {
    min:0.01,
    max: 2,
    step: 0.01
});
pane.addBinding(params, 'boxRoundness', {
    min: 0.01,
    max: 2,
    step: 0.01
});

function isInsideMesh(pos, ray, mesh) {
    rayCaster.set(pos, ray);
    rayCasterIntersects = rayCaster.intersectObject(mesh, false);
    return rayCasterIntersects.length % 2 === 1;
}

function voxelizeMesh() {
    voxels = [];
    if(!torusRef.value) return;
    const boundingBox = new Box3().setFromObject(torusRef.value);
    
    for (let i = boundingBox.min.x; i < boundingBox.max.x; i += params.gridSize) {
        for (let j = boundingBox.min.y; j < boundingBox.max.y; j += params.gridSize) {
            for (let k = boundingBox.min.z; k < boundingBox.max.z; k += params.gridSize) {
                const pos = new Vector3(i, j, k);
                if (isInsideMesh(pos, new Vector3(0, 0, 1), torusRef.value)) {
                    voxels.push({
                        position: pos
                    })
                }
            }
        }
    }
}

const setInstanceMesh = () => {
    dummy = new Object3D();

    for (let i = 0; i < voxels.length; i++) {
        dummy.position.copy(voxels[i].position);
        dummy.updateMatrix();
        instanceMeshRef.value.setMatrixAt(i, dummy.matrix);
    }
    instanceMeshRef.value.instanceMatrix.needsUpdate = true
}

watch(torusRef, () => {
    voxelizeMesh()
})

watch(instanceMeshRef, () => {
    setInstanceMesh()
})
watch(() => params.gridSize, () => {
    voxelizeMesh()
    setInstanceMesh()
})
</script>
<template>
    <TresMesh ref="torusRef" :visible="false">
        <TresTorusGeometry :args="[4, 1.5, 32, 32]" />
        <TresMeshStandardMaterial :color="0x333" />
    </TresMesh>
    <RoundedBox ref="roundedBoxRef" :visible="true"
        :args="[params.boxSize, params.boxSize, params.boxSize, 2, params.boxRoundness]">
        <TresMeshLambertMaterial :color="0xffff55" />
    </RoundedBox>

    <TresInstancedMesh v-if="roundedBoxRef" ref="instanceMeshRef"
        :args="[roundedBoxRef.instance.geometry, roundedBoxRef.instance.material, voxels.length]" />
</template>
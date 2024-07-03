<script setup lang="ts">
import { ref, shallowRef, watchEffect } from 'vue';
import type { TresVector3 } from '@tresjs/core'
import { Vector3 } from 'three'

// TODO proper dispose
export interface MultiCloneProps {
    /**
     * Text here.
     *
     * @default 5
     * @type {number}
     * @memberof MultiCloneProps
     */
    count?: boolean
    mesh: Object
    xGap?: number | Array<number>
    yGap?: number | Array<number>
    zGap?: number | Array<number>
    position?: TresVector3
}


const props = withDefaults(defineProps<MultiCloneProps>(), {
    count: 5,
    xGap: 0,
    yGap: 0,
    zGap: 0,
    position: () => new Vector3()
})

const array = ref([])
const arrayRef = shallowRef([])
const wrapperRef = shallowRef(null)
const groupPosition = ref(new Vector3(...props.position))

defineExpose({
    instance: wrapperRef,
})

let _gapCount = {
    x: 0,
    y: 0,
    z: 0
}
const _Pos = ref([])

const setGaps = (i, initPos) => {
    let _acc = {
        x: 0,
        y: 0,
        z: 0
    }
    if (i === 0) {
        _acc = {
            x: initPos.x + groupPosition.value.x,
            y: initPos.y + groupPosition.value.y,
            z: initPos.z + groupPosition.value.z
        }
        _Pos.value.push({
            x: initPos.x + groupPosition.value.x,
            y: initPos.y + groupPosition.value.y,
            z: initPos.z + groupPosition.value.z
        })
        return
    }
    // HANDLE X
    if (typeof props.xGap === 'number') {
        _acc.x = _Pos.value[i - 1].x + props.xGap
    } else {
        _acc.x = _Pos.value[i - 1].x + props.xGap[_gapCount.x]
        if (_gapCount.x === props.xGap.length - 1) {
            _gapCount.x = 0
        } else _gapCount.x++
    }
    // HANDLE Y
    if (typeof props.yGap === 'number') {
        _acc.y = _Pos.value[i - 1].y + props.yGap
    } else {
        _acc.y = _Pos.value[i - 1].y + props.yGap[_gapCount.y]
        if (_gapCount.y === props.yGap.length - 1) {
            _gapCount.y = 0
        } else _gapCount.y++
    }
    // HANDLE Z
    if (typeof props.zGap === 'number') {
        _acc.z = _Pos.value[i - 1].z + props.zGap
    } else {
        _acc.z = _Pos.value[i - 1].z + props.zGap[_gapCount.z]
        if (_gapCount.z === props.zGap.length - 1) {
            _gapCount.z = 0
        } else _gapCount.z++
    }
    _Pos.value.push({ x: _acc.x, y: _acc.y, z: _acc.z })
}

const reset = () => {
    // dispose all meshes
    array.value = []
    _Pos.value = []
    _gapCount = {
        x: 0,
        y: 0,
        z: 0
    }
}
const generateArray = () => {
    reset()
    for (let i = 0; i < props.count; i++) {
        setGaps(i, props.mesh.position)
        const currentMesh = props.mesh.clone()
        array.value.push(currentMesh)
    }
    return array
}

// generateArray()

watchEffect(() => {
    generateArray()
})
</script>
<template>
    <TresGroup ref="wrapperRef">
        <primitive v-for="(mesh, index) in array" ref="arrayRef" :object="mesh" :key="mesh.uuid" :position-x="_Pos[index].x"
        :position-y="_Pos[index].y" :position-z="_Pos[index].z" />
    </TresGroup>
    </template>
<script setup>
import { ref, shallowRef, toRefs, watch } from 'vue'
import { useRenderLoop, useTresContext } from '@tresjs/core'
import { Vector3 } from 'three'
// import { PointerLockControls } from '@tresjs/cientos'
import PointerLockControls from './PointerLockControls.vue'

import { useJump } from './composables/useJump'
import { useWalk } from './composables/useWalk'
import { useActions } from './composables/useActions'
// import { useRun } from './composables/useRun'
import { useHeadBobbing } from './composables/useHeadBobbing'

//TODO add run funcion

const props = defineProps({
    ...PointerLockControls.props,
    controlsKeys: {
        type: Array,
        default: () => [
            { name: "forward", keys: ['w', 'W'] },
            { name: "backward", keys: ['s', 'S'] },
            { name: "leftward", keys: ['a', 'A'] },
            { name: "rightward", keys: ['d', 'D'] },
            { name: "jump", keys: [" "] },
            { name: "run", keys: ["Shift"] },
            // Optional actions key map
            { name: "wheelActionUp", action: () => { } },
            { name: "wheelActionDown", action: () => { } },
            {
                name: "actions", actions:
                    [
                        { name: "action", keys: ['e', 'E'], action: () => { } },
                        { name: "action2", keys: ['f', 'F'], action: () => { } },
                        { name: "action3", keys: ['q', 'Q'], action: () => { } },
                        { name: "action4", keys: ['r', 'R'], action: () => { } },
                    ]
            },
        ]
    },
    moveSpeed: {
        type: Number,
        default: 0.1
    },
    gravity: {
        type: Number,
        default: 9.8
    },
    headBobbing: {
        type: Boolean,
        default: true
    },
    headBobbingOptions: {
        type: Object,
        default: () => ({
            speed: 5,
            amplitude: 0.25,
        })
    },
})

const emit = defineEmits(['isMoving'])

const { controlsKeys,
    gravity,
    moveSpeed,
    headBobbing,
    headBobbingOptions,
} = toRefs(props)

const { camera: activeCamera } = useTresContext()

// General options
const PointerLockControlsRef = shallowRef()
const wrapperRef = shallowRef()
const isLocked = shallowRef()
const initCameraPos = activeCamera?.value?.position?.y ?? 0
const isMoving = ref(false)
const rotation = new Vector3()
const [forward, backward, leftward, rightward, jump, run, actions, wheelActionUp, wheelActionDown] = controlsKeys.value

const { getJump, isJumping } = useJump(jump, gravity.value, initCameraPos)
const { xMove, zMove } = useWalk(moveSpeed.value, { forward, backward, leftward, rightward });
// zMove.value? = useRun(run, zMove)
const { headBobbingMov } = useHeadBobbing({ hasHeadBobbing: headBobbing.value, ...headBobbingOptions.value }, initCameraPos);
useActions({ actions, wheelActionUp, wheelActionDown })

watch([xMove, zMove], () => {
    if (zMove.value === 0 && xMove.value === 0) {
        isMoving.value = false
    } else isMoving.value = true
})

watch([isMoving, isJumping], () => {
    if (isMoving.value || isJumping.value) {
        emit('isMoving', true)
    } else emit('isMoving', false)
})

const onLock = (event) => {
    isLocked.value = event
}

const onChangeModel = () => {
    wrapperRef.value.rotation.copy(activeCamera.value.rotation)
    wrapperRef.value.position.copy(activeCamera.value.position).add(activeCamera.value.getWorldDirection(rotation).multiplyScalar(2.5))
}

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
    if (isLocked.value && PointerLockControlsRef.value) {
        PointerLockControlsRef.value.value.moveForward(zMove.value)
        PointerLockControlsRef.value.value.moveRight(xMove.value)
        activeCamera.value.position.y = getJump()
        activeCamera.value.position.y += headBobbingMov(isMoving.value, elapsed)
        onChangeModel()
    }
})
defineExpose({
    PointerLockControlsRef,
})
</script>

<template>
    <PointerLockControls make-default @isLock="e => onLock(e)" ref="PointerLockControlsRef" :camera="camera"
        :domElement="domElement" :selector="selector" />
    <TresGroup ref="wrapperRef">
        <slot />
    </TresGroup>
</template>

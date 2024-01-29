<script setup>
import { ref, shallowRef, toRefs, watchEffect } from 'vue'
import { useRenderLoop, useTresContext } from '@tresjs/core'
import { Vector3 } from 'three'
// import { PointerLockControls } from '@tresjs/cientos'
import PointerLockControls from './PointerLockControls.vue'

import { useJump } from './composables/useJump'
import { useWalk } from './composables/useWalk'
import { useActions } from './composables/useActions'
import { useHeadBobbing } from './composables/useHeadBobbing'
import { states, getMovementKey, getActionsKey } from './composables/utils'

// JUMP will be removed when rapier is ready

const props = defineProps({
    ...PointerLockControls.props,
    controlsKeys: {
        type: Array,
        default: () => [
            { name: "forward", key: 'w' },
            { name: "backward", key: 's' },
            { name: "leftward", key: 'a' },
            { name: "rightward", key: 'd' },
            // Optional actions key map
            { name: "jump", key: "space" },
            { name: "run", key: "Shift" },
            { name: "creep", key: "ctrl" },
            // click actions
            { name: "leftClick", action: () => { } },
            { name: "rightClick", action: () => { } },
            { name: "middleClick", action: () => { } },
            { name: "wheelActionUp", action: () => { } },
            { name: "wheelActionDown", action: () => { } },
            // key actions
            {
                name: "actions", actions:
                    [
                        { name: "action", key: 'e', action: () => console.log('Press e') },
                        { name: "action", key: 'q', action: () => console.log('Press q') },
                        { name: "action", key: 'r', action: () => console.log('Press r') },
                        { name: "action", key: 'f', action: () => console.log('Press f') },
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
    isHeadBobbing: {
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

const emit = defineEmits(['state'])

const { controlsKeys,
    gravity,
    moveSpeed,
    isHeadBobbing,
    headBobbingOptions,
} = toRefs(props)

const { camera: activeCamera } = useTresContext()

// General options
const PointerLockControlsRef = shallowRef()
const wrapperRef = shallowRef()
const isLocked = shallowRef()
const initCameraPos = activeCamera?.value?.position?.y ?? 0
const rotation = new Vector3()
const [ forward, backward, leftward, rightward, run, creep, jump ] = getMovementKey(controlsKeys.value)
const [ leftClick, rightClick, middleClick, wheelActionUp, wheelActionDown, actions ] = getActionsKey(controlsKeys.value, 'actions')

const { getJump, isJumping } = useJump(jump, gravity.value, initCameraPos)
const { sidewardMove, forwardMove, isWalking, isRunning, isCreeping } = useWalk(moveSpeed.value, { forward, backward, leftward, rightward, run, creep });
const { headBobbingMov } = useHeadBobbing({ hasHeadBobbing: isHeadBobbing.value, ...headBobbingOptions.value }, initCameraPos);
useActions({ actions, wheelActionUp, wheelActionDown, leftClick, rightClick, middleClick })

watchEffect(() => {
    if (isRunning.value) emit('state', states.running)
    else if (isCreeping.value) emit('state', states.creeping)
    else if (isWalking.value) emit('state', states.walking)
    else if (isJumping.value) emit('state', states.jumping)
    else emit('state', states.idle)
})

const onLock = (event) => {
    isLocked.value = event
}

const onChangeModel = () => {
    wrapperRef.value.rotation.copy(activeCamera.value.rotation)
    wrapperRef.value.position.copy(activeCamera.value.position).add(activeCamera.value.getWorldDirection(rotation).multiplyScalar(2.5))
}

const onChangePointerLock = () => {
    onChangeModel()
}

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
    if (isLocked.value && PointerLockControlsRef.value) {
        PointerLockControlsRef.value.value.moveForward(forwardMove.value)
        PointerLockControlsRef.value.value.moveRight(sidewardMove.value)
        activeCamera.value.position.y = getJump()
        activeCamera.value.position.y += headBobbingMov(isWalking.value, elapsed)
        if (isWalking.value || isJumping.value) onChangeModel()
    }
})
defineExpose({
    PointerLockControlsRef,
})
</script>

<template>
    <PointerLockControls make-default @change="onChangePointerLock" @isLock="e => onLock(e)" ref="PointerLockControlsRef"
        :camera="camera" :domElement="domElement" :selector="selector" />
    <TresGroup ref="wrapperRef">
        <slot />
    </TresGroup>
</template>

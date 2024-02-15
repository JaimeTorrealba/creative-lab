<script setup>
import { ref, shallowRef, toRefs, watchEffect } from 'vue'
import { useRenderLoop, useTresContext } from '@tresjs/core'
import { Vector3 } from 'three'
// import type { Group } from 'three'
// import { PointerLockControls } from '@tresjs/cientos'
import PointerLockControls from './PointerLockControls.vue'

import { useJump } from './composables/useJump'
import { useWalk } from './composables/useWalk'
import { useActions } from './composables/useActions'
import { useHeadBobbing } from './composables/useHeadBobbing'
import { STATES, getMovementKey, getActionsKey } from './composables/utils'

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
            { name: "jump", key: "space" }, // has gravity
            { name: "run", key: "Shift" }, // has speed
            { name: "creep", key: "ctrl" }, // has speed
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
    headBobbing: {
        type: Object,
        default: () => ({
            active: true,
            speed: 5,
            amplitude: 0.25,
        })
    },
})

const emit = defineEmits(['state', 'isLock', 'change'])

const { controlsKeys,
    moveSpeed,
    headBobbing,
} = toRefs(props)

const { camera: activeCamera } = useTresContext()

// General options
const state = ref(STATES.idle)
const PointerLockControlsRef = shallowRef()
const wrapperRef = shallowRef()
const isLocked = shallowRef()
const initCameraPos = activeCamera?.value?.position?.y ?? 0
const rotationModelGroup = new Vector3()
const [forward, backward, leftward, rightward, run, creep, jump] = getMovementKey(controlsKeys)
const [leftClick, rightClick, middleClick, wheelActionUp, wheelActionDown, actions] = getActionsKey(controlsKeys)

const { getJump, isJumping } = useJump(jump, initCameraPos)
const walkSystem = useWalk(moveSpeed.value, { forward, backward, leftward, rightward, run, creep });
watchEffect(() => {
    if (walkSystem.isRunning.value) state.value = STATES.running
    else if (walkSystem.isCreeping.value) state.value = STATES.creeping
    else if (walkSystem.isWalking.value) state.value = STATES.walking
    else if (isJumping.value) state.value = STATES.jumping
    else state.value = STATES.idle

    emit('state', { state: state.value, direction: walkSystem.direction })
})

const headBobbingMov = useHeadBobbing(headBobbing, initCameraPos);
useActions({ actions, wheelActionUp, wheelActionDown, leftClick, rightClick, middleClick })

const onLock = (event) => {
    isLocked.value = event
    emit('isLock', event)
}
const onChangePointerLock = () => onChangeModel()

const onChangeModel = () => {
    wrapperRef.value.rotation.copy(activeCamera.value.rotation)
    wrapperRef.value.position.copy(activeCamera.value.position).add(activeCamera.value.getWorldDirection(rotationModelGroup).multiplyScalar(2.5))
    emit('change', PointerLockControlsRef)
}

defineExpose({
    root: PointerLockControlsRef,
    models: wrapperRef,
    moveMethods: {
        forward: () => walkSystem.moveForward(),
        backward: () => walkSystem.moveBackward(),
        leftward: () => walkSystem.moveLeftward(),
        rightward: () => walkSystem.moveRightward(),
        run: () => walkSystem.applyRun(),
        creep: () => walkSystem.applyCreep(),
        stopCreep: () => walkSystem.stopCreep(),
        stopRun: () => walkSystem.stopRun(),
        stopSideward: () => walkSystem.stopSideward(),
        stopForward: () => walkSystem.stopForward(),
        jump: () => walkSystem.getJump(),
    },
})

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
    if (isLocked.value) {
        PointerLockControlsRef.value.value.moveForward(walkSystem.forwardMove.value)
        PointerLockControlsRef.value.value.moveRight(walkSystem.sidewardMove.value)
        activeCamera.value.position.y = getJump()
        activeCamera.value.position.y += headBobbingMov(elapsed, walkSystem.isWalking.value, state.value)
        if (walkSystem.isWalking.value || isJumping.value) onChangeModel()
    }
})

</script>

<template>
    <PointerLockControls make-default @change="onChangePointerLock" @isLock="e => onLock(e)" ref="PointerLockControlsRef"
        :camera="camera" :domElement="domElement" :selector="selector" />
    <TresGroup ref="wrapperRef">
        <slot />
    </TresGroup>
    <TresGroup ref="cameraGroupRef" />
</template>

<script setup>
import { ref, shallowRef, toRefs, watch } from 'vue'
import { useRenderLoop, useTresContext } from '@tresjs/core'
import { PointerLockControls } from '@tresjs/cientos'
import { onKeyStroke, onKeyDown, onKeyUp } from '@vueuse/core'

const props = defineProps({
    forward: {
        type: Object,
        default: () => ['w', 'W']
    },
    back: {
        type: Object,
        default: () => ['s', 'S']
    },
    left: {
        type: Object,
        default: () => ['a', 'A']
    },
    right: {
        type: Object,
        default: () => ['d', 'D']
    },
    primaryAction: {
        type: Object,
        default: () => ({ keys: ['e', 'E'], action: () => { } })
    },
    secondaryAction: {
        type: Object,
        default: () => ({ keys: ['f', 'F'], action: () => { } })
    },
    moveSpeed: 0.1,
    jump: {
        type: String,
        default: ' '
    },
    gravity: 9.8,
    headBobbingOptions: {
        type: Object,
        default: () => ({
            speed: 5,
            amplitude: 0.3,
        })
    },
})

const emit = defineEmits(['change'])

const {
    forward,
    back,
    left,
    right,
    jump,
    primaryAction,
    secondaryAction,
    gravity,
    moveSpeed,
    headBobbingOptions,
} = toRefs(props)

const { camera: activeCamera } = useTresContext()

// General options
const PointerLockControlsRef = shallowRef()
const isLocked = shallowRef()
const xMove = ref(0)
const zMove = ref(0)
const initCameraPos = activeCamera?.value?.position?.y ?? 0
const isMoving = ref(false)

onKeyDown(
    primaryAction.value.keys,
    () => primaryAction.value.action(),
)
onKeyDown(
    secondaryAction.value.keys,
    () => primaryAction.value.action(),
)
// // HeadBobbing options
const headBobbingSpeed = headBobbingOptions.value.speed ?? 5
const headBobbingSpeedAmplitude = headBobbingOptions.value.amplitude ?? 0.3
const hasHeadBobbing = headBobbingOptions.value.speed || headBobbingOptions.value.amplitude
const headBobbingMov = (elapsedTime) => isMoving.value
    ? Math.sin(elapsedTime * headBobbingSpeed) * headBobbingSpeedAmplitude + initCameraPos
    : initCameraPos

// // Jump options
const isJumping = ref(false)
const jumpDistance = ref(0)
const jumpGravity = gravity.value ?? 9.8
const initJumpTime = ref(0)

const getJumpTime = () => ((Date.now() - initJumpTime.value) / 1000) * 3
const getJumpDistance = (jumpTime) => initCameraPos + 6 * jumpTime - 0.5 * jumpGravity * jumpTime ** 2
const getJump = () => {
    if (isJumping.value) {
        jumpDistance.value = getJumpDistance(getJumpTime())
        if (jumpDistance.value <= initCameraPos) {
            stopMovement()
            isJumping.value = false
        }
        return jumpDistance.value
    }
    return 0
}

onKeyStroke(jump.value, () => {
    if (!isJumping.value) initJumpTime.value = Date.now()
    startMovement()
    isJumping.value = true
})

// FORWARD DIRECTION MOVEMENTS
onKeyDown(
    forward.value,
    () => {
        startMovement()
        zMove.value = moveSpeed.value
    },
)
onKeyDown(
    back.value,
    () => {
        startMovement()
        zMove.value = -moveSpeed.value
    },
)
onKeyUp(
    [...forward.value, ...back.value],
    () => {
        zMove.value = 0
        stopMovement()
    },
)
// X DIRECTION MOVEMENTS
onKeyDown(
    left.value,
    () => {
        startMovement()
        xMove.value = -moveSpeed.value
    },
)
onKeyDown(
    right.value,
    () => {
        startMovement()
        xMove.value = moveSpeed.value
    },
)
onKeyUp(
    [...left.value, ...right.value],
    () => {
        xMove.value = 0
        stopMovement()
    },
)

const startMovement = () => {
    isMoving.value = true
    emit('change', true)
}

const stopMovement = () => {
    if (zMove.value === 0 && xMove.value === 0) {
        isMoving.value = false
        emit('change', false)
    }
}

const onLock = (event) => {
    isLocked.value = event
}

watch(PointerLockControlsRef, value =>{
    console.log(value?.value)
})

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
    if (isLocked.value && PointerLockControlsRef.value) {
        console.log('jaime ~ onLoop ~ PointerLockControlsRef.value.value:', PointerLockControlsRef.value.value);
        // PointerLockControlsRef.value.value.moveForward(zMove.value)
        // PointerLockControlsRef.value.value.moveRight(xMove.value)
        activeCamera.value.position.y = hasHeadBobbing ? headBobbingMov(elapsed) : initCameraPos
        activeCamera.value.position.y = getJump() + initCameraPos
    }
})
defineExpose({
    // wrapperRef,
    PointerLockControlsRef,
})
</script>

<template>
    <PointerLockControls make-default @change="change()" @isLock="e => onLock(e)" ref="PointerLockControlsRef" />
    <!-- <TresGroup ref="wrapperRef">
        <slot />
    </TresGroup> --></template>

<script setup>
import { ref, shallowRef, toRefs, watch } from 'vue'
import { useRenderLoop, useTresContext } from '@tresjs/core'
import { PointerLockControls } from '@tresjs/cientos'
import { onKeyDown } from '@vueuse/core'
import { useJump } from './composables/useJump'
import { useWalk } from './composables/useWalk'
import { useHeadBobbing } from './composables/useHeadBobbing'

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
    moveSpeed: {
        type: Number,
        default: 0.1
    },
    jump: {
        type: String,
        default: ' '
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
    headBobbing,
    headBobbingOptions,
} = toRefs(props)

const { camera: activeCamera } = useTresContext()

// General options
const PointerLockControlsRef = shallowRef()
const isLocked = shallowRef()
const initCameraPos = activeCamera?.value?.position?.y ?? 0
const isMoving = ref(false)

const { getJump, isJumping } = useJump(jump, gravity.value, initCameraPos)
const { xMove, zMove } = useWalk(moveSpeed.value, { forward, back, left, right });
const { headBobbingMov } = useHeadBobbing({ hasHeadBobbing: headBobbing.value, ...headBobbingOptions.value }, initCameraPos);

onKeyDown(
    primaryAction.value.keys,
    () => primaryAction.value.action(),
)
onKeyDown(
    secondaryAction.value.keys,
    () => primaryAction.value.action(),
)

watch([xMove, zMove], () => {
    if (zMove.value === 0 && xMove.value === 0) {
        isMoving.value = false
        emit('change', false)
    } else isMoving.value = true
})
// const startMovement = () => {
//     isMoving.value = true
//     console.log('jaime ~ startMovement ~ zMove.value:', zMove.value);
//     PointerLockControlsRef.value.value.moveForward(zMove.value)
//     emit('change', true)
// }

// const stopMovement = () => {
//     if (zMove.value === 0 && xMove.value === 0) {
//         isMoving.value = false
//         emit('change', false)
//     }
// }

const onLock = (event) => {
    isLocked.value = event
}

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
    if (isLocked.value && PointerLockControlsRef.value) {
        PointerLockControlsRef.value.value.moveForward(zMove.value)
        PointerLockControlsRef.value.value.moveRight(xMove.value)
        activeCamera.value.position.y = getJump()
        activeCamera.value.position.y += headBobbingMov(isMoving.value, elapsed)
    }
})
defineExpose({
    // wrapperRef,
    PointerLockControlsRef,
})
</script>

<template>
    <PointerLockControls make-default @change="onChange()" @isLock="e => onLock(e)" ref="PointerLockControlsRef" />
    <!-- <TresGroup ref="wrapperRef">
        <slot />
    </TresGroup> -->
</template>

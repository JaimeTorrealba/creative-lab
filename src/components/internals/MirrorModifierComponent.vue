<script setup>
import { shallowRef, onMounted, nextTick } from 'vue'
import { useLoop } from '@tresjs/core'
import { Matrix4} from 'three'

const props = defineProps({
  object: {
    type: Object,
    required: true
  }
})

const mirrorTarget = shallowRef()

onMounted(async() => {
    await nextTick()
    mirrorTarget.value = props.object.clone()
    console.log('jaime ~ onMounted ~ mirrorTarget.value:', mirrorTarget.value);
})

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
    if(!mirrorTarget.value) return
    mirrorTarget.value.position.copy(props.object.position)
    //Check rotation inverse
    // mirrorTarget.value.quaternion.copy(props.object.quaternion)
    const matrix_x = new Matrix4().makeScale( -1, 1, 1 );
    const matrix_y = new Matrix4().makeScale( 1, -1, 1 );
    const matrix_z = new Matrix4().makeScale( 1, 1, -1 );

    // const rotationMatrix = new Matrix4().invert.makeRotationX(Math.PI / 180);
    // mirrorTarget.value.applyMatrix4(rotationMatrix);

    mirrorTarget.value.applyMatrix4(matrix_x);
    mirrorTarget.value.applyMatrix4(matrix_y);
    mirrorTarget.value.applyMatrix4(matrix_z);
    mirrorTarget.value.matrixWorldNeedsUpdate = true
})

</script>
<template>
    <primitive v-if="mirrorTarget" :object="mirrorTarget" />
</template>
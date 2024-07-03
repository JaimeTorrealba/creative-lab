<script setup>
import { TresCanvas } from '@tresjs/core'

</script>
<template>
    <TresCanvas window-size clear-color='#111'>
        <slot />
    </TresCanvas>
</template>
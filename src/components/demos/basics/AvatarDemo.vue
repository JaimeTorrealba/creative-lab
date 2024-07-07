<script setup>
import { GLTFModel } from '@tresjs/cientos'

</script>
<template>
    <Suspense>
        <GLTFModel path="/models/jaimeAvatar.glb" draco />
    </Suspense>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight :intensity="4" />
    <TresAxesHelper :size="1" />
</template>
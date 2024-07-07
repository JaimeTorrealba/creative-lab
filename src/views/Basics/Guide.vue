<script setup>
import { reactive } from 'vue'
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/basics/MiniMapDemo.vue'

const stats = reactive({
    objects: 0,
    vertices: 0,
    triangles: 0
}
)

const onUpdateStats = (_stats) => {
    stats.objects = _stats.objects
    stats.vertices = _stats.vertices
    stats.triangles = _stats.triangles
}

</script>
<template>
    <div class="info-menu">
        <p>objects: {{ stats.objects }}</p>
        <p>vertices:{{ stats.vertices }}</p>
        <p>triangles:{{ stats.triangles }}</p>
    </div>
    <div id="mini-map" class="mini-map"></div>
    <TresCanvas window-size clear-color="#626A71">
        <TresPerspectiveCamera :position="[0, 0, 5]" :look-at="[0, 3, 0]" :args="[45, 1, 0.1, 1000]" />
        <Suspense>
            <TheExperience @stats="onUpdateStats" />
        </Suspense>
    </TresCanvas>
</template>
<style scoped>
.mini-map {
    position: absolute;
    bottom: 0;
    right: 5%;
    width: 200px;
    height: 200px;
    border-radius: 4px;
    z-index: 100;
    background: transparent;
    border: 1px solid white;
    color: white;
    font-size: 12px;
    box-shadow: 1px 1px 5px 3px rgba(0, 0, 0, 0.5);
}

.info-menu {
    position: absolute;
    bottom: 0;
    left: 0;
    border-radius: 4px;
    z-index: 100;
    padding: 10px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 12px;
}
</style>
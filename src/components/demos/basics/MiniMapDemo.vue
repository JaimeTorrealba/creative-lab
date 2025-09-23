<script setup>
import { onMounted, nextTick, shallowRef, computed } from 'vue';
import { useLoop, extend, useTres } from '@tresjs/core'
import { useGLTF, OrbitControls } from '@tresjs/cientos';
import { WebGLRenderer, PerspectiveCamera } from 'three'
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper.js'

//todo emit stats

const wrapperRef = shallowRef()
const { scene, camera } = useTres()
const emit = defineEmits(['stats'])

const { state: _model } = useGLTF('/models/footman/source/Footman_RIG.glb')

const model = computed(() => _model.value?.scene)

const onChange = () => {
    wrapperRef.value.rotation.copy(camera.value.rotation)
}

extend({ ViewHelper })

function getStats(scene) {
    let _objects = 0;
    let _vertices = 0;
    let _triangles = 0;
    for (let i = 0, l = scene.children.length; i < l; i++) {
        const _object = scene.children[i];
        _object.traverseVisible(function (object) {
            _objects++;
            if (object.isMesh || object.isPoints) {
                const geometry = object.geometry;
                _vertices += geometry.attributes.position.count;
                if (object.isMesh) {
                    if (geometry.index !== null) {
                        _triangles += geometry.index.count / 3;
                    } else {
                        _triangles += geometry.attributes.position.count / 3;
                    }
                }
            }
        });
    }
    emit('stats', { objects: _objects, vertices: _vertices, triangles: _triangles })
}

const { onBeforeRender } = useLoop()

onMounted(async () => {
    await nextTick()
    const miniMap = document.getElementById('mini-map')
    const miniMapRenderer = new WebGLRenderer({ antialias: true, alpha: true })
    miniMapRenderer.setSize(200, 200)
    miniMap.appendChild(miniMapRenderer.domElement)

    const miniMapCamera = new PerspectiveCamera(25, 1, 0.1, 1000)
    miniMapCamera.position.set(0, 100, 1)
    miniMapCamera.lookAt(0, 100, 0)
    getStats(scene.value)
    onBeforeRender(() => {
        miniMapRenderer.render(scene.value, miniMapCamera)

    })
})
</script>
<template>
    <OrbitControls @change="onChange" />
    <TresGroup ref="wrapperRef" :position="[0, 100, 0]">
        <TresViewHelper :scale="0.1" />
    </TresGroup>
    <primitive v-if="model" :position-y="-1" :object="model" />
    <TresDirectionalLight :position="[0, 10, 0]" :intensity="1" />
    <TresAmbientLight :intensity="0.5" />
</template>
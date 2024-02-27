<script setup>
import { onMounted, nextTick, ref } from 'vue';
import { TresCanvas, useRenderLoop, extend } from '@tresjs/core'
import { OrbitControls, useGLTF } from '@tresjs/cientos';
import { shallowRef } from 'vue';
import { Vector3, Quaternion, WebGLRenderer, PerspectiveCamera } from 'three'
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper.js'

const canvasRef = shallowRef()
const wrapperRef = shallowRef()
const activeCamera = shallowRef()
const { scene: model } = await useGLTF('/models/footman/source/Footman_RIG.glb')

const onChange = () => {
    wrapperRef.value.rotation.copy(activeCamera.value.rotation)
}

extend({ ViewHelper })

const objects = ref(0)
const vertices = ref(0)
const triangles = ref(0)

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

    objects.value = _objects;
    vertices.value = _vertices;
    triangles.value = _triangles;

    // objectsText.setValue(objects.format());
    // verticesText.setValue(vertices.format());
    // trianglesText.setValue(triangles.format());

}

const { onLoop } = useRenderLoop()

onMounted(async () => {
    await nextTick()
    activeCamera.value = canvasRef.value.context.camera.value
    const miniMap = document.getElementById('mini-map')
    const miniMapRenderer = new WebGLRenderer({ antialias: true, alpha: true })
    miniMapRenderer.setSize(200, 200)
    miniMap.appendChild(miniMapRenderer.domElement)

    const miniMapCamera = new PerspectiveCamera(25, 1, 0.1, 1000)
    miniMapCamera.position.set(0, 100, 1)
    miniMapCamera.lookAt(0, 100, 0)
    getStats(canvasRef.value.context.scene.value)
    onLoop(() => {
        miniMapRenderer.render(canvasRef.value.context.scene.value, miniMapCamera)

    })
})

</script>
<template>
    <div class="info-menu">
        <p>objects: {{ objects }}</p>
        <p>vertices: {{ vertices }}</p>
        <p>triangles: {{ triangles }}</p>
    </div>
    <div id="mini-map" class="mini-map">

    </div>
    <TresCanvas window-size clear-color="#626A71" ref="canvasRef">
        <TresPerspectiveCamera :position="[0, 0, 5]" :fov="45" :aspect="1" :near="0.1" :far="1000" :look-at="[0, 3, 0]" />
        <OrbitControls @change="onChange" />
        <TresGroup ref="wrapperRef" :position="[0, 100, 0]">
            <TresViewHelper :scale="0.1" />
        </TresGroup>
        <primitive :position-y="-1" :object="model" />
        <TresDirectionalLight :position="[0, 10, 0]" :intensity="1" />
        <TresAmbientLight :intensity="0.5" />
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
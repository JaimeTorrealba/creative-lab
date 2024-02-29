<script setup>
import { nextTick, onMounted, shallowRef } from 'vue';
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import {
    PathTracingSceneGenerator,
    PathTracingRenderer,
    PhysicalPathTracingMaterial,
    GradientEquirectTexture,
} from 'three-gpu-pathtracer';
import { CustomBlending, MeshBasicMaterial } from 'three';


const canvasRef = shallowRef(null);
let tiles = 2;
let blitQuad, ptRenderer;

const onChange = () => {
    ptRenderer.reset();
}

onMounted(async () => {
    await nextTick();
    const { scene, renderer, camera } = canvasRef.value.context
    // initialize the path tracing material and renderer
    const ptMaterial = new PhysicalPathTracingMaterial();
    ptRenderer = new PathTracingRenderer(renderer.value);
    ptRenderer.setSize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio);
    ptRenderer.tiles.setScalar(3);
    ptRenderer.camera = camera.value;
    ptRenderer.material = ptMaterial;

    blitQuad = new FullScreenQuad(new MeshBasicMaterial({
        map: ptRenderer.target.texture,
        blending: CustomBlending,
    }));

    // init quad for rendering to the canvas
    const fsQuad = new FullScreenQuad(new MeshBasicMaterial({
        map: ptRenderer.target.texture,
        blending: CustomBlending,
    }));

    const generator = new PathTracingSceneGenerator();

    const { bvh, textures, materials, lights } = generator.generate(scene.value);
    const geometry = bvh.geometry;

    // update bvh and geometry attribute textures
    ptMaterial.bvh.updateFrom(bvh);
    ptMaterial.attributesArray.updateFrom(
        geometry.attributes.normal,
        geometry.attributes.tangent,
        geometry.attributes.uv,
        geometry.attributes.color,
    );

    // update materials and texture arrays
    ptMaterial.materialIndexAttribute.updateFrom(geometry.attributes.materialIndex);
    ptMaterial.textures.setTextures(renderer.value, 2048, 2048, textures);
    ptMaterial.materials.updateFrom(materials, textures);

    // update the lights
    ptMaterial.lights.updateFrom(lights);

    // set the environment map
    const texture = new GradientEquirectTexture();
    texture.bottomColor.set(0xffffff);
    texture.bottomColor.set(0x666666);
    texture.update();
    ptRenderer.material.envMapInfo.updateFrom(texture);


    const { onLoop } = useRenderLoop()

    onLoop(() => {
        ptRenderer.update();
        // if using alpha = true then the target texture will change every frame
        // so we must retrieve it before render.
        fsQuad.material.map = ptRenderer.target.texture;

        // copy the current state of the path tracer to canvas to display
        fsQuad.render(renderer.value);

    });
})

</script>
<template>
    <TresCanvas shadows window-size clear-color="#111" ref="canvasRef">
        <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
        <OrbitControls @change="onChange" />
        <TresMesh cast-shadow>
            <TresSphereGeometry :args="[1, 16]" />
            <TresMeshStandardMaterial :color="0x00ff00" :roughness="0.25" :metalness="1" />
        </TresMesh>
        <TresMesh receive-shadow :rotate-x="Math.PI * -0.5" :position-y="-1">
            <TresPlaneGeometry :args="[5, 5]" />
            <TresMeshStandardMaterial :color="0xf7f7f7" :roughness="0.25" :metalness="1" />
        </TresMesh>
        <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
        <TresAmbientLight />
    </TresCanvas>
</template>
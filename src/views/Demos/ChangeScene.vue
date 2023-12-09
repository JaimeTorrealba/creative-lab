<script setup>
import { shallowRef } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import {
  Vector3, WebGLRenderTarget, PerspectiveCamera, Scene,
  Color,
  DirectionalLight,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
} from 'three'
// import RenderTargets from '../../components/internals/RenderTargets.vue';

const canvasRef = shallowRef(null)
const camSettings = { fov: 45, near: 0.1, far: 500 };
const cameraPos = new Vector3(-16, 8, 16);

// RENDER TARGET SECTION
const targetPlaneSize = { width: 6, height: 7 };
const targetPlanePosition = { x: -5, y: targetPlaneSize.height / 2, z: 5 };
const renderTargetWidth = targetPlaneSize.width * 512;
const renderTargetHeight = targetPlaneSize.height * 512;
const renderTarget = new WebGLRenderTarget(renderTargetWidth, renderTargetHeight);

// SECONDARY CAMERA
const secondaryAspect = renderTargetWidth / renderTargetHeight;
const secondaryCamera = new PerspectiveCamera(camSettings.fov, secondaryAspect,
  camSettings.near, camSettings.far);
secondaryCamera.position.set(targetPlanePosition.x, targetPlanePosition.y + 4, targetPlanePosition.z);
secondaryCamera.lookAt(new Vector3(10, 5, -10));

// SECONDARY SCENE
const secondaryScene = new Scene();
secondaryScene.background = new Color(0x333);
const secondaryDirectionalLight = new DirectionalLight(0xFFFFFF, 1);
secondaryDirectionalLight.position.set(-10, 10, 10);
secondaryDirectionalLight.castShadow = true;
secondaryDirectionalLight.shadow.mapSize.width = 4096;
secondaryDirectionalLight.shadow.mapSize.height = 4096;
const d = 35;
secondaryDirectionalLight.shadow.camera.left = - d;
secondaryDirectionalLight.shadow.camera.right = d;
secondaryDirectionalLight.shadow.camera.top = d;
secondaryDirectionalLight.shadow.camera.bottom = - d;
secondaryScene.add(secondaryDirectionalLight);

const geometry = new BoxGeometry(3, 3, 3);
const material = new MeshStandardMaterial({ color: 0x00ff00 });
const cube = new Mesh(geometry, material);
cube.position.set(10, 5, -10);
secondaryScene.add(cube);

const { onLoop } = useRenderLoop()

onLoop(({elapsed}) => {
  if (canvasRef.value) {
    canvasRef.value.context.renderer.value.setRenderTarget(renderTarget);
    canvasRef.value.context.renderer.value.render(secondaryScene, secondaryCamera);
    canvasRef.value.context.renderer.value.setRenderTarget(null);
    cube.rotation.x = elapsed;
    cube.rotation.y = elapsed;
  }
})
</script>
<template>
  <TresCanvas window-size antialias shadowMap-enabled :clear-color="0xa8def0" ref="canvasRef">
    <TresPerspectiveCamera :position="cameraPos" :fov="camSettings.fov" :aspect="1" :near="camSettings.near"
      :far="camSettings.far" />
    <OrbitControls enableDamping :enablePan="false" :enableZoom="false" />
    <TresMesh name="Target plane" :position="[0, 0, 0]
      ">
      <TresPlaneGeometry :args="[targetPlaneSize.width, targetPlaneSize.height, 32]" castShadow />
      <TresMeshPhongMaterial :map="renderTarget.texture" />
    </TresMesh>
    <TresMesh receive-shadow name="Floor" :position-y="-3" :rotation-x="Math.PI * -0.5">
      <TresCircleGeometry :args="[25, 25, 32]" />
      <TresMeshStandardMaterial :color="0xa52a2a" />
    </TresMesh>
    <TresDirectionalLight :position="[3, 10, -4]" :intensity="1" castShadow
      :shadow-mapSize="{ width: 4096, height: 4096 }" :shadow-camera-left="-d" :shadow-camera-right="d"
      :shadow-camera-top="d" :shadow-camera-bottom="-d" />
    <TresAmbientLight />
  </TresCanvas>
</template>
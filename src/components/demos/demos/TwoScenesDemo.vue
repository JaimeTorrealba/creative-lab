<script setup>
import { useTres, useLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import {
  Vector3, WebGLRenderTarget, PerspectiveCamera, Scene,
  Color,
  DirectionalLight,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
} from 'three'

const { renderer, camera } = useTres()

const camSettings = {
  fov: 45,
  near: 0.1,
  far: 500,
}

// RENDER TARGET SECTION
const targetPlaneSize = { width: 6, height: 6 };
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
const cubes = []

for (let i = 0; i < 100; i++) {
  cubes.push(new Mesh(geometry, material));
  cubes[i].position.x = (Math.random() - 0.5) * 100;
  cubes[i].position.y = (Math.random() - 0.5) * 100;
  cubes[i].position.z = (Math.random() - 0.5) * 100;

  cubes[i].rotation.x = Math.random() * Math.PI;
  cubes[i].rotation.y = Math.random() * Math.PI;

  const scale = Math.random(); //todas las donas con diferente tamaño
  cubes[i].scale.set(scale, scale, scale); // puedes usar scale para evitar repetir 3 veces el valor recuerda
  secondaryScene.add(cubes[i]);
}

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
    secondaryCamera.position.copy(camera.value.position);
    cubes.map(cube => cube.rotation.y += 0.01)
    renderer.setRenderTarget(renderTarget);
    renderer.render(secondaryScene, secondaryCamera);
    renderer.setRenderTarget(null);
})
</script>
<template>
    <OrbitControls enableDamping :enablePan="false" :enableZoom="false" />
    <TresMesh name="Target plane" :position="[0, 0, 0]
      ">
      <TresCircleGeometry :args="[targetPlaneSize.width, 32]" castShadow />
      <TresMeshPhongMaterial :map="renderTarget.texture" />
    </TresMesh>
    <TresMesh receive-shadow name="Floor">
      <TresTorusGeometry :args="[targetPlaneSize.width + 1.9, 2]" />
      <TresMeshStandardMaterial :color="0xa52a2a" />
    </TresMesh>
    <TresDirectionalLight :position="[3, 10, -4]" :intensity="1" castShadow
      :shadow-mapSize="{ width: 4096, height: 4096 }" :shadow-camera-left="-d" :shadow-camera-right="d"
      :shadow-camera-top="d" :shadow-camera-bottom="-d" />
</template>
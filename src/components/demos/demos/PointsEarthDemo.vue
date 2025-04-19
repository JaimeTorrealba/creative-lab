<script setup>
import { useTresContext } from "@tresjs/core";
import { Stars } from "@tresjs/cientos";
import { BloomPmndrs, EffectComposerPmndrs } from '@tresjs/post-processing'
import {
  CircleGeometry,
  MeshPhysicalMaterial,
  InstancedMesh,
  Object3D,
  ImageLoader,
} from "three";

//_canvas 2D
const { scene } = useTresContext();
const loader = new ImageLoader();
loader.load("/textures/earthspec1k.jpg", (image) => {
  const press = 1024;
  const _canvas = document.createElement("canvas");
  _canvas.style.transform = "scale(0.25)";
  _canvas.style.position = "absolute";
  _canvas.style.zIndex = "999";
  _canvas.style.top = "-20%";
  _canvas.style.left = "-20%";

  _canvas.width = press;
  _canvas.height = press;
  const ctx = _canvas.getContext("2d");
  document.body.appendChild(_canvas);
  ctx.drawImage(image, 0, 0, press, press);
  const imageData = ctx.getImageData(0, 0, press, press);
  const data = imageData.data;
  const length = data.length;
  let pixels = Array.from(Array(press), () => Array(press).fill(0));
  
  for (let i = 0; i < length; i += 4) {
      const x = i / 4 % press;
      const y = Math.floor(i / 4 / press);
      pixels[x][y] = imageData.data[i] < 20 ? 1 : 0;

    }


  const pointsNumber = 5000;
  const goldenRation = (1 + Math.sqrt(5)) / 2;
  const positions = [];

  // Generate points on a sphere using the golden ratio method
  for (let i = 0; i < pointsNumber; i++) {
    let prog = i / pointsNumber;
    const theta = 2 * Math.PI * i / goldenRation;
    const phi = Math.acos(1 - 2 * prog);
    const x = Math.cos(theta) * Math.sin(phi);
    const y = Math.cos(phi);
    const z = Math.sin(theta) * Math.sin(phi);
    let u = 1 - (Math.asin(y)/Math.PI + 0.5)
    let v = 1 - (Math.atan2(z,x) + Math.PI) / (2 * Math.PI);
    if(pixels[Math.floor(v * press)][Math.floor(u * press)]){
        positions.push([x, y, z]);
    }
  }

  const dotGeometry = new CircleGeometry(0.01, 16);
  const dotMaterial = new MeshPhysicalMaterial({
    color: 0x00ff00,
  });

  const dots = new InstancedMesh(dotGeometry, dotMaterial, positions.length)
  const dummy = new Object3D();

  for (let i = 0; i < positions.length; i++) {
    dummy.position.set(positions[i][0], positions[i][1], positions[i][2]);
    dummy.lookAt(positions[i][0] * 2, positions[i][1] * 2, positions[i][2] * 2);

    dummy.updateMatrix();
    dots.setMatrixAt(i, dummy.matrix);
  }
  dots.instanceMatrix.needsUpdate = true;
  scene.value.add(dots);
});
</script>
<template>
  <Stars />
  <Suspense>
    <EffectComposerPmndrs>
      <BloomPmndrs
        :radius="0.85"
        :intensity="4.0"
        :luminance-threshold="0.1"
        :luminance-smoothing="0.3"
        mipmap-blur
      />
    </EffectComposerPmndrs>
  </Suspense>
  <TresMesh :visible="true">
    <TresIcosahedronGeometry :args="[1, 64]" />
    <TresMeshStandardMaterial :color="0x333" :roughness="0.5" :metalness="0.5" />
  </TresMesh>
</template>

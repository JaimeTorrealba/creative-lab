<script setup>
import { shallowRef } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import {
  OrbitControls,
  Sampler,
} from '@tresjs/cientos'
import vertex from '@/components/shaders/grass/vertex.glsl'
import fragment from '@/components/shaders/grass/fragment.glsl'
import { DoubleSide, ShaderMaterial, PlaneGeometry } from 'three'

// const { scene: model } = await useGLTF('/models/wheat.glb')
// const geometry = model.children[1].children[0].geometry
// geometry.rotateX(Math.PI * -0.5)

const count = 50000
// const dummy = new Object3D();
const instanceRef = shallowRef(null)
const geometry = new PlaneGeometry(0.1, 1, 1, 4);
geometry.translate(0, 0.5, 0);

const leavesMaterial = new ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTime: { value: 0.0 },
  },
  side: DoubleSide,
});

// watch(instanceRef, value => {
//   for (let i = 0; i < count; i++) {
//     dummy.position.set((Math.random() - 0.5) * 10,
//       0, (Math.random() - 0.5) * 10);
//     dummy.scale.setScalar(0.5 + Math.random() * 0.5);
//     dummy.rotation.y = Math.random() * Math.PI;
//     dummy.updateMatrix();
//     value.setMatrixAt(i, dummy.matrix);
//   }
// })

const { onLoop } = useRenderLoop()

onLoop(({elapsed}) => {
  leavesMaterial.uniforms.uTime.value = elapsed
})
</script>
<template>
  <TresCanvas window-size antialias clear-color="#333" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 5, -3]" :fov="45" :aspect="1" :near="0.1" :far="1000" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <Sampler :count="count">
      <TresMesh :rotation-x="Math.PI * -0.5" :visible="false">
        <TresPlaneGeometry :args="[10, 10]" />
        <TresMeshBasicMaterial :color="0xe4e4e4" />
      </TresMesh>

      <TresInstancedMesh ref="instanceRef" :rotation-x="Math.PI * 0.5"
        :args="[geometry, leavesMaterial, 1000]">
      </TresInstancedMesh>
    </Sampler>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
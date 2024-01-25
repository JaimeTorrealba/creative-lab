<script setup>
import { watch, shallowRef, reactive } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { OrbitControls, Sampler, Sky } from '@tresjs/cientos'
import * as THREE from 'three'
import { Pane } from 'tweakpane';

const pane = new Pane();

const PARAMS = reactive({
  density: 5
})
pane.addBinding(PARAMS, 'density', {
  label: 'Density',
  min: 0.0000001,
  max: 2,
  step: 0.0000001
});

const shaders = []
const ModifyShader_ = (s) => {
  shaders.push(s);
  s.uniforms.fogTime = { value: 0.0 };
}
const cameraRef = shallowRef()
const groundRef = shallowRef()


THREE.ShaderChunk.fog_pars_fragment = `
USE_FOG
	uniform vec3 fogColor;
	varying vec3 vWorldPosition;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
// #endif
`

THREE.ShaderChunk.fog_fragment = `
#ifdef USE_FOG
	#ifdef FOG_EXP2
      vec3 fogOrigin = cameraPosition;
      vec3 fogDirection = normalize(vWorldPosition - fogOrigin);
      float fogDepth = distance(vWorldPosition, fogOrigin);
      float heightFactor = 0.05;
      float fogFactor = heightFactor * exp(-fogOrigin.y * fogDensity) * (
          1.0 - exp(-fogDepth * fogDirection.y * fogDensity)) / fogDirection.y;
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif
  `

THREE.ShaderChunk.fog_vertex = `
#ifdef USE_FOG
vWorldPosition = worldPosition.xyz;
#endif
`

THREE.ShaderChunk.fog_pars_vertex = `
#ifdef USE_FOG
	varying vec3 vWorldPosition;
#endif
`


watch(cameraRef, value => {
  const fog = new THREE.FogExp2(0xDFE9F3, PARAMS.density);
  value.parent.fog = fog
  groundRef.value.material.onBeforeCompile = ModifyShader_;
})

const { onLoop } = useRenderLoop()

onLoop(({elapsed}) =>{
  for (let s of shaders) {
    s.uniforms.fogTime.value = elapsed;
  }

})

</script>
<template>
  <TresCanvas shadows window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[75, 20, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" ref="cameraRef" />
    <OrbitControls />
    <Sky />
    <!-- <TresFogExp2 :color="0xDFE9F3" :density="1" /> -->
    <!-- <TresFog :color="0xDFE9F3" :density="4" /> -->
    <Sampler :count="5000">
      <TresMesh receive-shadow :rotate-x="-Math.PI * 0.5" ref="groundRef">
        <TresPlaneGeometry :args="[500, 500]" />
        <TresMeshStandardMaterial :color="0x808080" />
      </TresMesh>

      <TresInstancedMesh cast-shadow :rotate-x="-Math.PI * 0.5" :position-y="1" :args="[null, null, 1000]">
        <TresBoxGeometry :args="[2, 2, 10]" />
        <TresMeshNormalMaterial />
      </TresInstancedMesh>
    </Sampler>

    <TresDirectionalLight cast-shadow :position="[0, 2, 4]" :intensity="2" :shadow-bias="-0.001"
      :shadow-mapSize-width="2048" :shadow-mapSize-height="2048" :shadow-camera-near="0.5" :shadow-camera-far="500"
      :shadow-camera-left="100" :shadow-camera-right="-100" :shadow-camera-top="100" :shadow-camera-bottom="-100" />
    <TresAmbientLight />
  </TresCanvas>
</template>
<style scoped></style>
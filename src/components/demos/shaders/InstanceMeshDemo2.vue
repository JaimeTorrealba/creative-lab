<script setup>
import { shallowRef, watch } from "vue";
import { useLoop, extend } from "@tresjs/core";
import { useTexture } from "@tresjs/cientos";
import { BoxGeometry, ShaderMaterial } from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { watchOnce } from "@vueuse/core";

const { state: texture, isLoading } = useTexture("/textures/matcap example.png");
watchOnce(isLoading, (value) => {
  if (!value) {
    shader.uniforms.uMatCap.value = texture.value;
  }
});

extend({ InstancedMesh2 });

const shader = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uMatCap: { value: null },
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    uniform float aRandom;

    #include <instanced_pars_vertex>
    #include <color_pars_vertex>

    void main() {
      #include <color_vertex>
      #include <instanced_vertex>
      vec4 modelPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
      modelPosition.y += aRandom * sin(uTime + 15.*aRandom) * 0.4;
      modelPosition = viewMatrix * modelPosition;
      gl_Position = projectionMatrix * modelPosition;
      vUv = uv;
      vViewPosition = -modelPosition.xyz;
      // normal
      vNormal = normalMatrix * mat3(instanceMatrix) * normal;
    }
  `,
  fragmentShader: `
    uniform sampler2D uMatCap;
    varying vec2 vUv;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    #include <color_pars_fragment>

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
      vec3 y = cross(viewDir, x);
      vec2 uv = vec2(dot(x, normal), dot(y, normal)) * 0.495 + 0.5;
      vec4 matcapColor = texture2D(uMatCap,uv);
      // gl_FragColor = vec4(vNormal, 1);
      gl_FragColor = matcapColor;
    }
  `,
});
const geometry = new BoxGeometry(1, 1, 1);
const rows = 100;
const count = rows * rows;
const random = new Float32Array(count);

const instanceMeshRef = shallowRef(null);

watch(instanceMeshRef, (value) => {
  value.initUniformsPerInstance({ vertex: { aRandom: "float" } });
  value.addInstances(count, (obj, index) => {
    obj.position.x = (index % rows) - rows / 2;
    obj.position.z = Math.floor(index / rows) - rows / 2;
    random[index] = Math.random()
  });
  random.map((_, index) => {
    value.setUniformAt(index, "aRandom", random[index]);
  });
});

const { onBeforeRender } = useLoop();

onBeforeRender(({ delta }) => {
  if (shader) {
    shader.uniforms.uTime.value += delta;
  }
});
</script>
<template>
  <TresInstancedMesh2
    ref="instanceMeshRef"
    :args="[geometry, shader, { capacity: count }]"
  />
</template>

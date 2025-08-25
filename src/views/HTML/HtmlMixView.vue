<script setup>
import { computed, watchEffect, shallowRef, watch } from "vue";
import { TresCanvas, useRenderLoop, useTexture } from "@tresjs/core";
import { Vector2 } from "three";
import { useWindowSize, useMouse } from "@vueuse/core";

const { map: imgToShader } = await useTexture({ map: "/images/imgToShader.jpg" });

const canvasRef = shallowRef(null);
const { width, height } = useWindowSize();
const { x, y } = useMouse();
const fov = computed(() => 2 * Math.atan(height.value / 2 / 600) * (180 / Math.PI));
const aspect = computed(() => width.value / height.value);

const shader = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(width.value, height.value) },
  },
  vertexShader: `
  uniform float uTime;
    void main(){
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
  uniform vec2 uResolution;
  uniform float uTime;

    void main(){
      vec2 uv = gl_FragCoord.xy/uResolution.xy;
      // Time varying pixel color
      vec3 col = 0.5 + 0.5 * cos(uTime + uv.xyx + vec3(0,2,4));

    gl_FragColor = vec4(col,1.0);
    }
  `,
};
const imgShader = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(width.value, height.value) },
    uHover: { value: new Vector2(0.5, 0.5) },
    uImage: { value: imgToShader },
  },
  vertexShader: `
  uniform float uTime;
  uniform vec2 uHover;
  varying vec2 vUv;
    void main(){
      float dist = distance(uv,uHover);
      vec3 newPos = position;
      newPos.z += uHover.x*10.*sin(dist*10. + uTime);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      vUv = uv;
    }
  `,
  fragmentShader: `
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uHoverState;
  uniform vec2 uHover;
  uniform sampler2D uImage;
  varying vec2 vUv;

    void main(){
      vec2 newUV = vUv;
      vec4 img = texture2D(uImage,newUV);
      //img.r *= uHover.x;
      gl_FragColor = img;
    }
  `,
};

watch(canvasRef, (canvas) => {
  const { context } = canvas;
  console.log("jaime ~ canvas:", context.renderer.value);
});

watchEffect(() => {
  shader.uniforms.uResolution.value = new Vector2(width.value, height.value);
  x.value = (x.value / width.value) * 2 - 1;
  y.value = -(y.value / height.value) * 2 + 1;
});
const updateUniforms = (ev) => {
  ev.object.material.uniforms.uHover.value = ev.uv;
};

const { onLoop } = useRenderLoop();

onLoop(({ elapsed }) => {
  shader.uniforms.uTime.value = elapsed;
});
</script>
<template>
  <TresCanvas
    window-size
    clear-color="#f7f7f7"
    alpha
    antialias
    ref="canvasRef"
    class="canvas"
  >
    <TresPerspectiveCamera :args="[fov, aspect, 100, 2000]" :position="[0, 0, 600]" />
    <TresMesh :rotation="[0, 0, -3.075]" :position="[0, height / 2, 0]" name="topShader">
      <TresPlaneGeometry :args="[width * 2, height / 3, 10, 10]" />
      <TresShaderMaterial v-bind="shader" />
    </TresMesh>
    <TresMesh :position="[0, -0.99 * (height / 2), 0]" name="bottomPlane">
      <TresPlaneGeometry :args="[width * 2, height / 3, 10, 10]" />
      <TresMeshBasicMaterial color="#333" />
    </TresMesh>
    <!-- image -->
    <TresMesh
      name="planeImg"
      :position="[width / 5 + 75, 0, 0]"
      @pointer-move="(ev) => updateUniforms(ev)"
    >
      <TresPlaneGeometry :args="[405, 532, 10, 10]" />
      <TresShaderMaterial v-bind="imgShader" />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="3" cast-shadow />
    <TresAmbientLight />
  </TresCanvas>
  <section class="html-page">
    <div class="columns row-container">
      <div class="column text-container">
        <h1 class="has-text-centered is-title is-size-2 my-4F">Is not responsive yet</h1>
        <p class="px-4 text-subtitle-1">
          Hover over the image and see, the whole three.js scene is actually under the
          page.
        </p>
        <p class="px-4 text-subtitle-1">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla eligendi soluta
          voluptate facere molestiae consequatur.
        </p>
      </div>
      <div class="column image-container">
        <figure class="image">
          <img class="img" src="/images/imgToShader.jpg" alt="image" />
        </figure>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.canvas {
  z-index: 10;
}
.image-container {
  height: 100vh;
  z-index: -10;
}
.html-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  color: #333;
}
.text-container {
  min-height: 100vh;
  display:grid;
  place-content: center;
  position: relative;
  z-index:10
}
.img {
  display: none;
}
</style>

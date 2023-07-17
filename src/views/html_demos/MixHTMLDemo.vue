<script setup>
import { computed, watchEffect, shallowRef } from 'vue'
import { TresCanvas, useRenderLoop, useTexture } from '@tresjs/core'
import { useFBX } from '@tresjs/cientos'
import { Vector2 } from 'three'
import { useWindowSize, useMouse } from '@vueuse/core'
import { MouseParallax } from '@tresjs/cientos'

const shield = await useFBX('/models/icons/shield.fbx')
const wallet = await useFBX('/models/icons/wallet.fbx')
const money = await useFBX('/models/icons/money.fbx')
const { map: imgToShader } = await useTexture({ map: '/images/imgToShader.jpg' })
const canvas = shallowRef(null)

const { width, height } = useWindowSize()
const { x, y } = useMouse()

const shader = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(width.value, height.value) }
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
  `
}
const imgShader = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(width.value, height.value) },
    uHover: { value: new Vector2(0.5, 0.5) },
    uImage: { value: imgToShader }
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
  `
}

watchEffect(() => {
  shader.uniforms.uResolution.value = new Vector2(width.value, height.value)
  x.value = (x.value / width.value) * 2 - 1
  y.value = -(y.value / height.value) * 2 + 1
})
const updateUniforms = (ev) => {
  ev.object.material.uniforms.uHover.value = ev.uv
}
const fov = computed(() => 2 * Math.atan(height.value / 2 / 600) * (180 / Math.PI))

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
  shader.uniforms.uTime.value = elapsed
})
</script>
<template>
  <TresCanvas window-size clear-color="transparent" ref="canvas" class="canvas">
    <TresPerspectiveCamera :args="[fov, width / height, 100, 2000]" :position="[0, 0, 600]" />
    <MouseParallax :factor="10" />
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
    <!-- models -->
    <Suspense>
      <primitive
        :object="shield"
        :scale="[0.5, 0.5, 0.5]"
        :position="[width * -0.5 + 350, 30, 0]"
        :rotation="[0, 1.1, 0]"
      />
    </Suspense>
    <Suspense>
      <primitive
        :object="wallet"
        :scale="[0.5, 0.5, 0.5]"
        :position="[width * -0.5 + 350, height / 6 - 240, 0]"
        :rotation="[0, 1.1, 0]"
      />
    </Suspense>
    <Suspense>
      <primitive
        :object="money"
        :scale="[0.5, 0.5, 0.5]"
        :position="[width * -0.5 + 350, height / 6 - 325, 0]"
        :rotation="[0, 0.6, 0]"
      />
    </Suspense>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="3" cast-shadow />
    <TresAmbientLight />
  </TresCanvas>
  <section class="html-page">
    <v-row class="row-container" align="center" no-gutters>
      <v-col cols="2"></v-col>
      <v-col>
        <h1 class="text-center text-h3">Is not responsive yet</h1>
        <p class="px-4 text-subtitle-1">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla eligendi soluta voluptate
          facere molestiae consequatur.
        </p>
        <div>
          <div class="icons"><p class="icon-text text-h4">Super safe</p></div>
          <div class="icons">
            <p class="icon-text text-h4">Safe your wallet</p>
          </div>
          <div class="icons">
            <p class="icon-text text-h4">Safe your money</p>
          </div>
        </div>
      </v-col>
      <v-col class="image-container debug" cols="5">
        <figure class="image">
          <img class="img" src="/images/imgToShader.jpg" alt="image" />
        </figure>
      </v-col>
    </v-row>
  </section>
</template>
<style lang="scss" scoped>
.image-container{
  height: 100vh;
  z-index: -999;
}
.html-page {
  outline: 1px solid red;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  color: #333;
}
.row-container {
  min-height: 100vh;
}
.img {
  display: none;
}
.buttons {
  background-color: transparent;
  z-index: 1000;
}
.icons {
  height: 100px;
  margin-bottom: 0.5rem;
}
.icon-text {
  margin-left: 15%;
  padding-top: 5%;
  @media screen and (max-width: 1900px) and (min-width: 1500px) {
    margin-left: 20%;
  }
  @media screen and (max-width: 1499px) and (min-width: 1300px) {
    margin-left: 30%;
  }
  @media screen and (max-width: 1399px) and (min-width: 1200px) {
    margin-left: 50%;
  }
}
</style>

<script setup>
import { computed, watchEffect, shallowRef, onMounted } from 'vue'
import { TresCanvas, useRenderLoop, useTexture } from '@tresjs/core'
import { useFBX } from '@tresjs/cientos'
import { Vector2, Raycaster } from 'three'
import { useWindowSize, useMouse } from '@vueuse/core'
import { PamCameraMouse } from '@tresjs/cientos'

const shield = await useFBX('/models/icons/shield.fbx')
const wallet = await useFBX('/models/icons/wallet.fbx')
const money = await useFBX('/models/icons/money.fbx')
const { map: imgToShader } = await useTexture({ map: '/images/imgToShader.jpg' })
const canvas = shallowRef(null)
const shieldRef = shallowRef(null)
const walletRef = shallowRef(null)
const moneyRef = shallowRef(null)
const imgRef = shallowRef(null)

const { width, height } = useWindowSize()
const { x, y } = useMouse()

const raycaster = new Raycaster()

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
    uHoverState: { value: 0 },
    uImage: { value: imgToShader }
  },
  vertexShader: `
  uniform float uTime;
  uniform vec2 uHover;
  uniform float uHoverState;
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

  //Implementation without mouse move event on tres
  if (canvas.value) {
    raycaster.setFromCamera(new Vector2(x.value, y.value), canvas.value.camera)
    const intersects = raycaster.intersectObjects(canvas.value.scene.children)
    if (intersects.length > 0) {
      let obj = intersects[0].object
      if (obj.name === 'planeImg') {
        obj.material.uniforms.uHover.value = intersects[0].uv
      }
    }
  }
})
const fov = computed(() => 2 * Math.atan(height.value / 2 / 600) * (180 / Math.PI))

onMounted(() => {
  shieldRef.value = canvas.value.scene.getObjectByName('Shield')
  shieldRef.value.scale.set(
    shieldRef.value.scale.x / 2,
    shieldRef.value.scale.y / 2,
    shieldRef.value.scale.z / 2
  )
  shieldRef.value.position.x = -1 * (width.value / 2) + 350
  shieldRef.value.position.y = height.value / 6 - 125
  shieldRef.value.rotation.z = 1.1
  //Wallet
  walletRef.value = canvas.value.scene.getObjectByName('Button')
  walletRef.value.scale.set(
    walletRef.value.scale.x / 2,
    walletRef.value.scale.y / 2,
    walletRef.value.scale.z / 2
  )
  walletRef.value.position.x = -1 * (width.value / 2) + 350
  walletRef.value.position.y = height.value / 6 - 240
  walletRef.value.rotation.z = 1.1
  //money
  moneyRef.value = canvas.value.scene.getObjectByName('Plane006')
  moneyRef.value.scale.set(
    moneyRef.value.scale.x / 2,
    moneyRef.value.scale.y / 2,
    moneyRef.value.scale.z / 2
  )
  moneyRef.value.position.x = -1 * (width.value / 2) + 350
  moneyRef.value.position.y = height.value / 6 - 325
})

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
  shader.uniforms.uTime.value = elapsed
})
</script>
<template>
  <main class="below debug">
    <TresCanvas window-size clear-color="transparent" ref="canvas">
      <TresPerspectiveCamera :args="[fov, width / height, 100, 2000]" :position="[0, 0, 600]" />
      <PamCameraMouse :factor="10" />
      <TresMesh :rotation="[0, 0, -3.075]" :position="[0, height / 2, 0]">
        <TresPlaneGeometry :args="[width * 2, height / 3, 10, 10]" />
        <TresShaderMaterial v-bind="shader" />
      </TresMesh>
      <TresMesh :position="[0, -0.99 * (height / 2), 0]">
        <TresPlaneGeometry :args="[width * 2, height / 3, 10, 10]" />
        <TresMeshBasicMaterial color="#333" />
      </TresMesh>
      <!-- image -->
      <TresMesh name="planeImg" v-if="imgRef" :position="[width / 5 + 75, 0, 0]">
        <TresPlaneGeometry :args="[405, 532, 10, 10]" />
        <TresShaderMaterial v-bind="imgShader" />
      </TresMesh>
      <!-- models -->
      <TresMesh v-bind="shield" />
      <TresMesh v-bind="wallet" />
      <TresMesh v-bind="money" />
      <TresDirectionalLight :position="[0, 2, 4]" :intensity="3" cast-shadow />
      <TresAmbientLight />
    </TresCanvas>
    <section class="hero is-fullheight has-background-grey-lighter">
      <div class="hero-body">
        <div class="container has-text-centered">
          <div class="columns is-8 is-variable">
            <div class="column is-two-thirds has-text-left">
              <h1 class="title is-1">Evolving business with technology</h1>
              <p class="is-size-4">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla eligendi soluta
                voluptate facere molestiae consequatur.
              </p>
              <div class="social-media">
                <div class="icons"><p class="icon-text is-size-4">Super safe</p></div>
                <div class="icons">
                  <p class="icon-text is-size-4">Safe your wallet</p>
                </div>
                <div class="icons">
                  <p class="icon-text is-size-4">Safe your money</p>
                </div>
              </div>
            </div>
            <div class="column is-one-third has-text-left">
              <figure class="image">
                <img
                  ref="imgRef"
                  class="img"
                  src="../../public/images/imgToShader.jpg"
                  alt="image"
                />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
<style scoped>
.img {
  display: none;
}
.below {
  background-color: transparent;
  z-index: 1000;
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
  margin-left: 20%;
  padding-top: 2.5%;
}
</style>

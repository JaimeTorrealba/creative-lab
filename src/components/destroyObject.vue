<script setup>
import { shallowRef, onMounted } from 'vue'
import { OrbitControls } from '@tresjs/cientos'
import gsap from 'gsap'
import { TresCanvas, useRenderLoop, useTexture } from '@tresjs/core'
import { AdditiveBlending, Vector3, Spherical, BufferAttribute, Color } from 'three'

const pointsRef = shallowRef()

let squareColor = new Color()
// squareColor.setHex( 0x4F4F4F);
squareColor.setHex( 0x4f4);
console.log('jaime ~ squareColor:', squareColor.g);

onMounted(() => {
  console.log(pointsRef.value.geometry)
  pointsRef.value.geometry.setAttribute('position', new BufferAttribute(positionArray, 3))
  pointsRef.value.geometry.setAttribute( 'color', new BufferAttribute( squareColorArray, 3 ));
})



const pointsOptions = {
  size: 0.2,
  vertexColors: true,
  transparent: false,
  blending: AdditiveBlending,
}

const count = 100000

const positionArray = new Float32Array(count * 3)
const squareColorArray = new Float32Array(count * 3)

for (let i = 0; i < count; i++) {
  // positionArray[i * 3 + 0] = Math.random() - 0.5
  // positionArray[i * 3 + 1] = Math.random()
  // positionArray[i * 3 + 2] = Math.random() - 0.5
  positionArray[i] = (Math.random() - 0.5)
  squareColorArray[i *3 ] = squareColor.r
  squareColorArray[i *3 + 1] = squareColor.g
  squareColorArray[i *3 + 2] = squareColor.b

  // squareColorArray[i * 3 + 0] = squareColor.r
  // squareColorArray[i * 3 + 1] = squareColor.g
  // squareColorArray[i * 3 + 2] = squareColor.b
}

const shader = {
  transparent: false,
  blending: AdditiveBlending,
  depthWrite: false,
  size: 0.2,
  vertexColors: true,

  vertexShader: `
    varying vec3 vColor;
    void main() {
      vColor = color;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }`,
}

const destroySquare = () => {
  const squareGeo = pointsRef.value.geometry.attributes.position

  if (squareGeo.count === 0) {
    gsap.to(squareGeo, {
      count: count,
      duration: 3
    })
    return
  }

  gsap.to(squareGeo, {
    count: 0,
    duration: 1
  })
}
</script>
<template>
  <button @click="destroySquare()">go wild</button>
  <Suspense>
    <TresCanvas window-size clear-color="#f7f7f7">
      <TresPerspectiveCamera
        :args="[1, 32, 32]"
        :position="[0, 0, 5]"
        :fov="45"
        :aspect="1"
        :near="0.1"
        :far="1000"
      />
      <OrbitControls />
      <TresPoints ref="pointsRef">
        <!-- <TresBufferGeometry :position="[positionArray, 3]" /> -->
        <TresShaderMaterial v-bind="shader" />
      </TresPoints>
      <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
      <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
      <TresAmbientLight />
    </TresCanvas>
  </Suspense>
</template>
<style scoped>
.mouse-chg {
  cursor: grab;
}
</style>

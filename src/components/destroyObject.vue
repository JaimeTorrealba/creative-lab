<script setup>
import { shallowRef, onMounted } from 'vue'
import { PamCameraMouse, Text3D } from '@tresjs/cientos'
import gsap from 'gsap'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { SphereGeometry, BoxGeometry, BufferAttribute, ConeGeometry } from 'three'

const fontPath = 'https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json'

const squareRef = shallowRef()
const sphereRef = shallowRef()
const triangleRef = shallowRef()

const squareGeo = new BoxGeometry(1.5,1.5,1, 10, 10, 10).toNonIndexed()
const sphereGeo = new SphereGeometry(1, 20, 20).toNonIndexed()
const triangleGeo = new ConeGeometry(0.9, 1.5, 20, 20).toNonIndexed();


onMounted(() => {
  squareRef.value.geometry.dispose()
  squareRef.value.geometry = squareGeo
  const lenSquare = squareRef.value.geometry.attributes.position.count
  let squareRandoms = new Float32Array(lenSquare * 3)
  for (let i = 0; i < lenSquare; i+= 3) {
    let r = Math.random()
    squareRandoms[i] = r
    squareRandoms[i + 1] = r
    squareRandoms[i + 2] = r
  }
  squareRef.value.geometry.setAttribute('aRandom', new BufferAttribute(squareRandoms, 1))

  // sphere
  sphereRef.value.geometry.dispose()
  sphereRef.value.geometry = sphereGeo
  const lenSphere = sphereRef.value.geometry.attributes.position.count

  let sphereRandoms = new Float32Array(lenSphere * 3)
  for (let i = 0; i < lenSquare; i+= 3) {
    let r = Math.random()
    sphereRandoms[i] = r
    sphereRandoms[i + 1] = r
    sphereRandoms[i + 2] = r
  }
  sphereRef.value.geometry.setAttribute('aRandom', new BufferAttribute(sphereRandoms, 1))

  // triangle
   triangleRef.value.geometry.dispose()
   triangleRef.value.geometry = triangleGeo
  const lenTriangle = triangleRef.value.geometry.attributes.position.count

  let triangleRandoms = new Float32Array(lenTriangle * 3)
  for (let i = 0; i < lenSquare; i+= 3) {
    let r = Math.random()
    triangleRandoms[i] = r
    triangleRandoms[i + 1] = r
    triangleRandoms[i + 2] = r
  }
  triangleRef.value.geometry.setAttribute('aRandom', new BufferAttribute(triangleRandoms, 1))

})

const squareShader = {
  vertexShader: `
  attribute vec3 aRandom;
  uniform float uTime;
  uniform float uProgress;
    void main() {
      vec3 newPos = position;
      newPos.x += (aRandom.x * uv.x -0.5)* uProgress * 2.0;
      newPos.y += (aRandom.x * uv.y -0.5)* uProgress * 2.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
    }
  `,
  fragmentShader: `
  uniform float uProgress;
    void main() {
      gl_FragColor = vec4(0.3,0.3,0.3, 1.0 - uProgress);
    }`,
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 } // cambiar a 0
  },
  transparent:true
}
const sphereShader = {
  vertexShader: `
  attribute float aRandom;
  uniform float uTime;
  uniform float uProgress;
    void main() {
      vec3 newPos = position;
      newPos += (aRandom * normal) * uProgress * 2.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
    }
  `,
  fragmentShader: `
  uniform float uProgress;
    void main() {
      gl_FragColor = vec4(0.9,0.69,0.23, 1.0 - uProgress);
    }`,
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 } // cambiar a 0
  },
  transparent:true
}

const triangleShader = {
  vertexShader: `
  attribute vec3 aRandom;
  uniform float uTime;
  uniform float uProgress;
    void main() {
      vec3 newPos = position;
      //newPos.xy += (aRandom.xy * uv.xy -0.5)* 1.0 * 2.0;
      // newPos.y += (aRandom.x * uv.y -0.5)* uProgress * 2.0;
      //newPos += (aRandom * normal) * 1.0 * 2.0;
      newPos.x += (aRandom.x * uv.x -0.5)* uProgress * 2.0;
      newPos.y += (aRandom.x * uv.y -0.5)* uProgress * 2.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
    }
  `,
  fragmentShader: `
  uniform float uProgress;
    void main() {
      gl_FragColor = vec4(0.5,0.85,0.77, 1.0 - uProgress);
    }`,
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 }
  },
  transparent:true
}

const { onLoop } = useRenderLoop()
onLoop(() => {
  squareShader.uniforms.uTime.value += 0.01
  sphereShader.uniforms.uTime.value += 0.01
  triangleShader.uniforms.uTime.value += 0.01
})

const destroySquare = () => {
  gsap.to(squareShader.uniforms.uProgress, {
    value: 1,
    duration: 1,
    ease: 'power4.in',
  })
}
const destroySphere = () => {
  gsap.to(sphereShader.uniforms.uProgress, {
    value: 1,
    duration: 1,
    ease: 'power4.in',
  })
}
const destroyTriangle = () => {
  gsap.to(triangleShader.uniforms.uProgress, {
    value: 1,
    duration: 1,
    ease: 'power4.in',
  })
}
const destroyAll = () => {
  destroySquare()
  destroySphere()
  destroyTriangle()
}
const restore = () => {
    gsap.to([
    squareShader.uniforms.uProgress,
    sphereShader.uniforms.uProgress,
    triangleShader.uniforms.uProgress
  ], {
    value: 0,
    duration: 1,
    ease: 'back',
    })
  }
</script>
<template>
  <div class="is-flex is-justify-content-center">
    <button class="mr-2 my-2 button is-danger" @click="destroyAll()">Destroy All</button>
    <button class="mr-2 my-2 button is-success" @click="restore()">Restore</button>
  </div>
  <Suspense>
    <TresCanvas window-size clear-color="#000">
      <TresPerspectiveCamera
        :position="[0, 0, 7.5]"
        :fov="45"
        :aspect="1"
        :near="0.1"
        :far="1000"
        :look-at="[0, 0, 0]"
      />
      <Suspense>
        <Text3D :font="fontPath" :position="[0, 2, 0 ]" center />
      </Suspense>
      <TresMesh ref="squareRef" @click="destroySquare()">
        <TresBoxGeometry :args="[1, 1, 1, 10, 10, 10]" />
        <TresShaderMaterial v-bind="squareShader" />
      </TresMesh>
      <TresMesh ref="sphereRef" :position="[3, 0, 0]" @click="destroySphere()">
        <TresIcosahedronGeometry :args="[0.75, 10]"  />
        <TresShaderMaterial v-bind="sphereShader" />
      </TresMesh>
      <TresMesh ref="triangleRef" :position="[-3, 0, 0]" @click="destroyTriangle()">
        <TresConeGeometry :args="[1, 1.5, 60, 60]"  />
        <TresShaderMaterial v-bind="triangleShader" />
      </TresMesh>
      <PamCameraMouse :factor="0.5" />
      <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
      <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
      <TresAmbientLight />
    </TresCanvas>
  </Suspense>
</template>
<style scoped>
.mouse-chg {
  cursor: grab;
}
</style>

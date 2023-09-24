<script setup>
import { shallowRef, watch } from 'vue'
import { MouseParallax, Text3D } from '@tresjs/cientos'
import gsap from 'gsap'
import { TresCanvas } from '@tresjs/core'
import { SphereGeometry, BoxGeometry, BufferAttribute, ConeGeometry } from 'three'
import fragment from '@/components/shaders/destroyGeos/fragment.glsl'
import vertex from '@/components/shaders/destroyGeos/vertex.glsl'

const fontPath = 'https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json'

const squareRef = shallowRef()
const sphereRef = shallowRef()
const triangleRef = shallowRef()

const squareGeo = new BoxGeometry(1.5, 1.5, 1, 10, 10, 10).toNonIndexed()
const sphereGeo = new SphereGeometry(1, 20, 20).toNonIndexed()
const triangleGeo = new ConeGeometry(0.9, 1.5, 20, 20).toNonIndexed()

watch(squareRef, value => {
  value.geometry.dispose()
  value.geometry = squareGeo
  const lenSquare = value.geometry.attributes.position.count
  let squareRandoms = new Float32Array(lenSquare * 3)
  for (let i = 0; i < lenSquare; i += 3) {
    let r = Math.random()
    squareRandoms[i] = r
    squareRandoms[i + 1] = r
    squareRandoms[i + 2] = r
  }
  value.geometry.setAttribute('aRandom', new BufferAttribute(squareRandoms, 1))
})

watch(sphereRef, value => {
  value.geometry.dispose()
  value.geometry = sphereGeo
  const lenSphere = value.geometry.attributes.position.count

  let sphereRandoms = new Float32Array(lenSphere * 3)
  for (let i = 0; i < lenSphere; i += 3) {
    let r = Math.random()
    sphereRandoms[i] = r
    sphereRandoms[i + 1] = r
    sphereRandoms[i + 2] = r
  }
  value.geometry.setAttribute('aRandom', new BufferAttribute(sphereRandoms, 1))
})

watch(triangleRef, value => {
  value.geometry.dispose()
  value.geometry = triangleGeo
  const lenTriangle = value.geometry.attributes.position.count

  let triangleRandoms = new Float32Array(lenTriangle * 3)
  for (let i = 0; i < lenTriangle; i += 3) {
    let r = Math.random()
    triangleRandoms[i] = r
    triangleRandoms[i + 1] = r
    triangleRandoms[i + 2] = r
  }
  value.geometry.setAttribute('aRandom', new BufferAttribute(triangleRandoms, 1))
})

const squareShader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uProgress: { value: 0 }
  },
  transparent: true
}
const sphereShader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uProgress: { value: 0 }
  },
  transparent: true
}
const triangleShader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uProgress: { value: 0 }
  },
  transparent: true
}

const destroyGeo = (geo) => {
  gsap.to(geo.uniforms.uProgress, {
    value: 1,
    duration: 1,
    ease: 'power4.in'
  })
}

const destroySquare = () => destroyGeo(squareShader)
const destroySphere = () => destroyGeo(sphereShader)
const destroyTriangle = () => destroyGeo(triangleShader)
const destroyAll = () => {
  destroySquare()
  destroySphere()
  destroyTriangle()
}
const restore = () => {
  gsap.to(
    [
      squareShader.uniforms.uProgress,
      sphereShader.uniforms.uProgress,
      triangleShader.uniforms.uProgress
    ],
    {
      value: 0,
      duration: 1,
      ease: 'back'
    }
  )
}
</script>
<template>
  <div class="d-flex justify-center ontop">
    <v-btn class="mr-2 my-2 is-danger" @click="destroyAll()">Destroy All</v-btn>
    <v-btn class="mr-2 my-2 is-success" @click="restore()">Restore</v-btn>
  </div>
  <Suspense>
    <TresCanvas window-size clear-color="#000">
      <TresPerspectiveCamera :position="[0, 0, 7.5]" />
      <Suspense>
        <Text3D
          text="Click on geometry"
          :font="fontPath"
          :position="[0, 2, 0]"
          center
          :look-at="[0, 0, 7.5]"
        />
      </Suspense>
      <TresMesh ref="squareRef" @click="destroySquare()">
        <TresBoxGeometry />
        <TresShaderMaterial v-bind="squareShader" />
      </TresMesh>
      <TresMesh ref="sphereRef" :position="[3, 0, 0]" @click="destroySphere()">
        <TresIcosahedronGeometry />
        <TresShaderMaterial v-bind="sphereShader" />
      </TresMesh>
      <TresMesh ref="triangleRef" :position="[-3, 0, 0]" @click="destroyTriangle()">
        <TresConeGeometry />
        <TresShaderMaterial v-bind="triangleShader" />
      </TresMesh>
      <MouseParallax :factor="0.5" />
      <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
      <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
      <TresAmbientLight />
    </TresCanvas>
  </Suspense>
</template>
<style>
.ontop{
  position: relative;
  z-index: 999;
}
</style>

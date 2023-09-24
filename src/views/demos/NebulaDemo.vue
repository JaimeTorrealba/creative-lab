<script setup>
import { shallowRef, onMounted, watchEffect } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { Stars, MouseParallax, Smoke, OrbitControls } from '@tresjs/cientos'
import { useWindowSize } from '@vueuse/core'
// import { EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
// import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js'

const blueLightRef = shallowRef(null)
// const { onLoop } = useRenderLoop()
// const { width, height } = useWindowSize()

// let effectComposer

// watchEffect(() => {
//   if (canvasRef.value) {
//     canvasRef.value.renderer.setSize(width.value, height.value)
//     canvasRef.value.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//     effectComposer = new EffectComposer(canvasRef.value.renderer)
//     effectComposer.addPass(new RenderPass(canvasRef.value.scene, canvasRef.value.camera))
//     const renderBloomPass = new BloomPass(
//       1.0, // strength
//       25, // kernel size
//       4, // sigma ?
//       2560 // blur render target resolution
//     )
//     effectComposer?.addPass(renderBloomPass)

//     onLoop(() => {
//       effectComposer.render()
//     })
//   }
// })

</script>
<template>
  <TresCanvas window-size clear-color="#03544e" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 2.5]"  />
    <!-- <FogExp2 :color="0x03544e" :density="0.001" /> -->
    <MouseParallax :factor="1" />
    <!-- <OrbitControls /> -->
    <Stars />
    <!-- <EffectComposer>
        <Bloom :luminance-threshold="0.1" :luminance-smoothing="0.3" mipmap-blur :intensity="4.0" :radius="0.85" />
      </EffectComposer> -->
    <Suspense>
      <Smoke texture='/textures/smoke.png' :segments="2" :width="4" :depth="1" :position="[0, 0, -7.5]" />
    </Suspense>
    <TresPointLight name="orange" :args="[0xcc6600, 50, 45, 1.7]" :position="[-1, -1, -2.5]" />
    <TresPointLight name="red" :args="[0xd8547e, 50, 45, 1.7]" :position="[1, 1,-2.5]" />
    <TresPointLight
      name="blue"
      ref="blueLightRef"
      :args="[0x3677ac, 50, 45, 1.7]"
      :position="[0, 0, -2.5]"
    />
    <TresDirectionalLight :args="[0xff8c19]" :position="[0, 0, 1]" />
    <TresAmbientLight :args="[0x555555]" />
  </TresCanvas>
</template>

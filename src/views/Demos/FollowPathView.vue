<script setup>
import { onMounted, shallowRef } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { useGLTF, OrbitControls } from '@tresjs/cientos'
import { Vector3, LineLoop, BufferGeometry, LineBasicMaterial, CatmullRomCurve3 } from 'three'
import { Flow } from 'three/examples/jsm/modifiers/CurveModifier.js'
import transformSVGPath from '@/components/external/transformSVGPath/TSP.js'

let pointsCount = 1000
let flow
const canvasRef = shallowRef(null)

const { scene: snakeModel } = await useGLTF('/models/snake_tiger_keelback_rhabdophis_tigrinus.glb')
// snakeModel.scale.set(1,0.1,0.1)
// snakeModel.rotation.set(Math.PI , 0,0)
onMounted(() => {
  const pathToFollow = document.getElementById('toPath')

  const getCenteredSvgPoints = (svg, scale) => {
    const viewBox = svg.getAttribute('viewBox').split(' ')
    const width = parseFloat(viewBox[2])
    const height = parseFloat(viewBox[3])
    const path = svg.querySelector('path').getAttribute('d')
    const shape = transformSVGPath(path)
    const points = shape.getPoints(pointsCount).map((points) => {
      // center origin path
      let v = new Vector3(points.x - width / 2, 0, points.y - height / 2)
      v = v.multiplyScalar(scale)
      return v
    })
    return points
  }
  const showLineFromPoints = (points, color) => {
    const line = new LineLoop(
      new BufferGeometry().setFromPoints(points),
      new LineBasicMaterial({ color })
    )
    // // line.geometry.center()
    canvasRef.value.context.scene.value.add(line)
  }
  const followPoints = (snakeCurve) => {
    flow = new Flow(snakeModel)
    flow.updateCurve(0, snakeCurve)
    canvasRef.value.context.scene.value.add(flow.object3D)
  }

  const originalPoints = getCenteredSvgPoints(pathToFollow, 0.1)
  showLineFromPoints(originalPoints, 0xff0000)
  const snakeCurve = new CatmullRomCurve3(originalPoints, true)
  console.log('jaime ~ onMounted ~ snakeCurve:', snakeCurve);
  followPoints(snakeCurve)
})

const { onLoop } = useRenderLoop()
onLoop(() => {
  if (flow) {
    flow.moveAlongCurve(-0.001)
  }
})
</script>
<template>
  <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" id="toPath">
    <defs></defs>
    <path style="stroke: rgb(0, 0, 0); fill: none;"
      d="M 171.156 321.549 C 154.342 321.549 136.312 355.625 141.975 372.615 C 154.385 409.843 187.823 431.298 227.273 421.437 C 238.747 418.568 246.823 413.155 253.648 402.918 C 259.795 393.697 270.67 381.967 273.288 371.493 C 278.858 349.213 287.535 320.951 282.828 297.419 C 278.033 273.439 268.252 252.539 250.842 235.129 C 244.676 228.963 235.745 222.857 230.64 216.049 C 209.868 188.354 178.007 165.628 150.393 145.903 C 140.774 139.033 136.939 125.155 129.63 117.845 C 123.336 111.552 138.441 91.395 142.536 88.664 C 160.654 76.586 177.042 70.803 199.214 63.412 C 206.465 60.995 219.595 56.737 227.834 59.484 C 234.31 61.642 240.649 67.914 246.914 71.829 C 256.736 77.968 268.177 85.797 276.094 93.715 C 289.929 107.55 280.149 144.962 274.972 160.494 C 269.143 177.98 266.963 197.578 262.626 214.927 C 257.554 235.215 240.335 253.441 228.395 269.36 C 218.876 282.052 211.294 288.707 200.898 299.102 C 195.791 304.209 183.662 307.359 179.012 312.009 C 176.938 314.083 169.628 320.988 166.667 320.988">
    </path>
  </svg>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, -25, -35]" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
<style scoped>
svg {
  display: none;
}
</style>

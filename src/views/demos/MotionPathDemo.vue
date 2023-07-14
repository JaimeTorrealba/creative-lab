<script setup>
import { onMounted, shallowRef } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { useGLTF, OrbitControls } from '@tresjs/cientos'
import { Vector3, LineLoop, BufferGeometry, LineBasicMaterial, CatmullRomCurve3 } from 'three'
import { Flow } from 'three/examples/jsm/modifiers/CurveModifier.js'
import transformSVGPath from '../components/external/transformSVGPath/TSP.js'

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
      let v = new Vector3(points.x - width / 2,  0 , points.y - height / 2)
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
     line.geometry.center()
    canvasRef.value.scene.add(line)
  }
  const followPoints = (snakeCurve) => {
    flow = new Flow(snakeModel)
    flow.updateCurve(0,snakeCurve)
    canvasRef.value.scene.add(flow.object3D)
  }

  const originalPoints = getCenteredSvgPoints(pathToFollow, 0.1)
  // showLineFromPoints(originalPoints, 0xff0000)
  const snakeCurve = new CatmullRomCurve3(originalPoints, true)
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
          <path style="fill: rgb(216, 216, 216); stroke: rgb(0, 0, 0);" d="M 223.65 90.79 C 231.938 90.79 224.175 82.873 221.187 85.862 C 220.119 86.93 219.09 88.37 217.901 89.558 C 217.713 89.746 216.118 92.292 217.08 93.254 C 221.376 97.549 227.501 95.435 231.863 93.254 C 232.913 92.729 235.701 88.058 234.738 87.094 C 232.998 85.354 232.24 82.953 229.81 80.524 C 227.983 78.696 219.985 79.482 217.901 80.524 C 212.493 83.228 202.163 85.595 206.814 94.896 C 210.501 102.27 232.654 106.456 236.791 98.182 C 238.62 94.524 244.698 91 241.719 85.041 C 235.989 73.581 208.536 70.098 202.297 82.577 C 200.725 85.722 194.964 91.729 196.959 95.718 C 199.028 99.856 200.405 101.547 204.35 103.52 C 205.941 104.315 209.604 102.614 210.921 103.931 C 213.332 106.343 220.149 106.394 224.061 106.394 C 238.026 106.394 247.273 102.266 253.628 89.558 C 257.534 81.745 248.197 77.147 245.004 73.953 C 237.184 66.133 206.387 63.901 195.316 69.436 C 188.02 73.084 186.899 78.161 182.586 84.63 C 178.89 90.174 178.48 95.224 178.48 102.288 C 178.48 107.807 178.051 115.393 180.122 119.535 C 191.702 142.696 213.366 139.638 230.631 156.904 C 232.197 158.469 230.729 164.902 231.863 167.17 C 239.681 182.805 215.431 198.379 202.297 198.379 C 201.483 197.942 191.192 202.058 190.359 202.891 C 187.6 205.65 179.067 204.909 175.521 208.455 C 167.706 216.27 158.745 235.491 165.629 249.26 C 173.612 265.225 196.696 271.826 203.961 286.354 C 206.93 292.294 205.553 299.168 207.67 305.52 C 208.806 308.927 210.15 316.011 208.907 319.74 C 201.524 341.886 197.771 354.369 182.94 369.2 C 178.293 373.847 174.458 382.273 168.102 386.511 C 158.89 392.652 144.012 401.935 137.808 411.24 C 133.894 417.111 129.487 427.599 125.443 431.643 C 121.553 435.533 134.1 437.208 134.717 437.825 C 135.167 438.275 147.7 459.964 147.7 460.082 C 169.231 455.298 161.643 486.809 155.737 498.62 C 139.997 530.1 113.108 543.948 78.456 555.498 C 71.664 557.762 57.48 564.485 49.399 560.444 C 36.014 553.752 24.544 554.633 11.685 544.988 C 9.88 543.634 -0.453 536.725 4.266 532.005 C 7.351 528.921 9.243 522.082 12.304 519.022 C 14.516 516.81 33.991 513.506 37.034 516.549 C 39.272 518.787 39.911 523.754 42.598 526.441 C 43.744 527.586 46.388 532.462 45.071 535.096 C 41.534 542.17 23.906 548.41 19.104 538.806 C 18.586 537.769 10.109 532.345 14.158 528.295 C 15.077 527.377 29.653 519.06 33.942 523.349 C 35.368 524.775 35.405 527.903 37.034 529.532 C 39.177 531.675 34.977 533.443 34.561 533.86 C 29.048 539.372 23.193 528.914 27.142 528.914"></path>
        </svg>
  <TresCanvas window-size clear-color="#000" ref="canvasRef">
    <TresPerspectiveCamera
      :position="[0, -15, 0]"
      :fov="45"
      :aspect="1"
      :near="0.1"
      :far="1000"
      :look-at="[0, 0, 0]"
    />
    <OrbitControls />
    <!-- <primitive :object="snakeModel" :scale="1" /> -->
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
<style scoped>
svg {
  display: none;
}
</style>

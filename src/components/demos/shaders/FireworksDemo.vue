<script setup>
import { useTres } from '@tresjs/core'
import { useTextures } from '@tresjs/cientos'
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Points, ShaderMaterial, Spherical, Uniform, Vector3 } from 'three'
import { useDevicePixelRatio, useEventListener, useWindowSize } from '@vueuse/core'
import gsap from 'gsap'
import { ref, watch, onMounted } from 'vue'
// Shaders
import vertexShader from '@/components/demos/shaders/shaders/fireworks/vertex.glsl'
import fragmentShader from '@/components/demos/shaders/shaders/fireworks/fragment.glsl'

const { scene, renderer } = useTres()
const { pixelRatio } = useDevicePixelRatio()
const { width, height } = useWindowSize()

const material = ref(null)

const texturesPaths = [
  '/textures/particles/circle_02.png',
  '/textures/particles/circle_03.png',
  '/textures/particles/circle_05.png',
  '/textures/particles/scorch_01.png',
  '/textures/particles/smoke_03.png',
  '/textures/particles/smoke_08.png',
  '/textures/particles/star_06.png',
  '/textures/particles/star_07.png',
  '/textures/particles/star_08.png',
  '/textures/particles/star_09.png',
]

const { textures } = useTextures(texturesPaths)

function createFireworks(options) {
  const { count, position, size, radius, color = '#ffffff' } = options

  const positionArray = new Float32Array(count * 3)
  const sizeArray = new Float32Array(count)
  const decayArray = new Float32Array(count)

  // The might loop
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    const spherical = new Spherical(
      radius * (0.7 + Math.random() * 0.25),
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2,
    )
    const position = new Vector3().setFromSpherical(spherical)

    positionArray[i3] = position.x
    positionArray[i3 + 1] = position.y
    positionArray[i3 + 2] = position.z
    sizeArray[i] = Math.random()
    decayArray[i] = 1 + Math.random()
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positionArray, 3))
  geometry.setAttribute('aSize', new Float32BufferAttribute(sizeArray, 1))
  geometry.setAttribute('aDecay', new Float32BufferAttribute(decayArray, 1))
  material.value = new ShaderMaterial(
    {
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: new Uniform(0),
        uSize: new Uniform(size),
        uResolution: new Uniform(new Vector3(width.value, height.value, pixelRatio.value)),
        uTexture: new Uniform(textures.value?.[Math.floor(Math.random() * textures.value.length)]),
        uColor: new Uniform(color),
        uProgress: new Uniform(0),
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    },
  )

  // Points
  const fireworks = new Points(geometry, material.value)
  fireworks.position.copy(position)
  scene.value.add(fireworks)

  const destroyFirework = () => {
    scene.value.remove(fireworks)
    geometry.dispose()
    material.value?.dispose()
  }

  gsap.to(
    material.value?.uniforms.uProgress,
    {
      value: 1,
      duration: 3,
      onComplete: destroyFirework
    },
  )
}

watch([width, height, pixelRatio], () => {
  if (material.value) {
    material.value.uniforms.uResolution.value = new Vector3(width.value, height.value, pixelRatio.value)
  }
})

const rand = (min = 0, max = 1) => Math.random() * (max - min) + min

const createRandomFirework = () => {
  const color = new Color()
  color.setHSL(rand(0, 1),1, 0.7)
  const limit = 5
  const position = new Vector3(rand(-limit, limit), rand(-limit, limit), rand(-limit, limit))
  createFireworks({
    count: Math.floor(rand(400, 1000)),
    position,
    size: rand(0.05, 0.2),
    radius: rand(0.5, 3),
    color
  })
}

useEventListener(renderer.domElement, 'click', createRandomFirework)

watch(textures, (newTextures) => {
  if (material.value) {
    material.value.uniforms.uTexture.value = newTextures?.[Math.floor(Math.random() * newTextures.length)]
  }

})

onMounted(() => {
  createRandomFirework()
})
</script>

<template>
  <TresGroup />
</template>
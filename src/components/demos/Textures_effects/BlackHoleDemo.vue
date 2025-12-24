<script setup>
import { watch } from 'vue'
import { Vector2, DoubleSide } from 'three'
import { useLoop } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { useWindowSize, watchOnce } from '@vueuse/core'

import vertex from './shaders/BlackHole/vertex.glsl'
import fragment from './shaders/BlackHole/fragment.glsl'

// Background image (same as original)
const bgUrl = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1427&q=80'

// Mass parameters
let blackholeMass = 1500
let curBlackholeMass = 0

// Window size, mouse state
const { width, height } = useWindowSize()
const mouse = new Vector2(0, 0)
let moved = false

const { state: texture, isLoading } = useTexture(bgUrl)

watchOnce(isLoading, (value) => {
  if (!value) {
    shader.uniforms.u_texture.value = texture.value
  }
})

const shader = {
  uniforms : {
    u_resolution: { value: new Vector2(width.value, height.value) },
    u_mouse: { value: mouse },
    u_mass: { value: 0 },
    u_time: { value: 0 },
    u_clickedTime: { value: 0 },
    u_texture: { value: texture }
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  side: DoubleSide
}

// Event listeners for pointer and click
function onMove(e) {
	mouse.set(e.clientX, height.value - e.clientY)
	moved = true
}

// Keep resolution uniform in sync
watch([width, height], ([w, h]) => {
	shader.uniforms.u_resolution.value.set(w, h)
})

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
	shader.uniforms.u_time.value = elapsed

	if (curBlackholeMass < blackholeMass - 50) {
		curBlackholeMass += (blackholeMass - curBlackholeMass) * 0.03
	}
	shader.uniforms.u_mass.value = curBlackholeMass * 0.00001

	// Click-based swirl disabled; keep clicked time at 0
	shader.uniforms.u_clickedTime.value = 0.0

	if (!moved) {
		mouse.y = (-(height.value / 2) + Math.sin(elapsed * 0.7) * (height.value * 0.25)) + height.value
		mouse.x = (width.value / 2) + Math.sin(elapsed * 0.6) * -(width.value * 0.35)
	}
})
</script>


<template>
	<TresMesh @pointermove="onMove">
		<TresPlaneGeometry :args="[2, 2]" />
		<TresShaderMaterial v-bind="shader" />
	</TresMesh>
</template>

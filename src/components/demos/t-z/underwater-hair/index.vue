<script setup>
import { BackSide, DoubleSide, Vector2, Vector3 } from 'three'
import { OrbitControls } from '@tresjs/cientos'
import { useLoop, useTres } from '@tresjs/core'
import { onMounted, onUnmounted, reactive, ref, shallowRef } from 'vue'
import DragControls from '@/components/internals/DragControls.vue'
import { buildHairGeometry, sampleScalp } from './buildHairGeometry'
import { createGuideLineGeometry, createHairSim } from './hairSim'
import { createBackdropUniforms, createHairUniforms, createUniformSync } from './hairUniforms'
import { createMarineSnow } from './marineSnow'
import { createMarschnerLut } from './marschnerLut'
import { createShadowPipeline } from './shadowPipeline'
import { createParams } from './params'
import { setupPane } from './ui'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import backdropVertex from './backdropVertex.glsl'
import backdropFragment from './backdropFragment.glsl'

const HEAD_RADIUS = 1
const HAIR_LENGTH = 3.6
const SCALP_ANGLE = 2.0
const SNOW_COUNT = 1500
const SNOW_BOX = 26

const params = reactive(createParams())
const headRef = shallowRef()
const hairGeometry = shallowRef()
const guideGeometry = shallowRef()
const isDragging = ref(false)

let sim = null

const lut = createMarschnerLut()
lut.bake(params)

const shadow = createShadowPipeline({
  guideTexture: null,
  guideSize: new Vector2(1, 1)
})

const uniforms = createHairUniforms(params, {
  shadowUniforms: shadow.uniforms,
  lutM: lut.mTexture,
  lutN: lut.nTexture
})
const backdropUniforms = createBackdropUniforms(params)
const syncUniforms = createUniformSync(params, uniforms, backdropUniforms)

const headPosition = () => headRef.value?.position ?? new Vector3()

const build = () => {
  const { guideCount, segments } = params
  const head = headPosition()
  const roots = sampleScalp(guideCount, SCALP_ANGLE)

  const staleSim = sim
  const staleHair = hairGeometry.value
  const staleGuides = guideGeometry.value

  sim = createHairSim({
    roots,
    guideCount,
    segments,
    hairLength: HAIR_LENGTH,
    headRadius: HEAD_RADIUS
  })
  sim.reset(head.x, head.y, head.z, params)

  hairGeometry.value = buildHairGeometry({
    roots,
    guideCount,
    renderStrands: params.renderStrands,
    tessellation: params.tessellation,
    radius: HEAD_RADIUS + HAIR_LENGTH + SNOW_BOX,
    mode: params.primitive
  })
  guideGeometry.value = createGuideLineGeometry(sim)

  uniforms.uGuides.value = sim.texture
  uniforms.uGuideSize.value.set(segments, guideCount)
  shadow.setGuides(sim.texture, segments, guideCount)
  shadow.setGeometry(hairGeometry.value)

  // Only release the old buffers once nothing points at them any more.
  staleSim?.texture.dispose()
  staleHair?.dispose()
  staleGuides?.dispose()
}

build()

const snow = createMarineSnow(SNOW_COUNT, SNOW_BOX)

const { renderer } = useTres()
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta, elapsed }) => {
  const head = headPosition()

  sim.step(delta, elapsed, params, head)

  if (params.showGuides && guideGeometry.value) {
    guideGeometry.value.attributes.position.needsUpdate = true
  }

  snow.update(delta, elapsed)
  syncUniforms(elapsed)

  if (params.shadowEnabled && params.hairVisible && renderer) {
    shadow.syncShape(uniforms, params.shadowWidthScale, params.shadowOpacity)
    shadow.render(renderer, uniforms.uLightPos.value, head, HEAD_RADIUS + HAIR_LENGTH + 1)
  }
})

let pane

onMounted(() => {
  pane = setupPane(params, {
    rebuild: build,
    rebake: () => lut.bake(params),
    resizeShadow: () => shadow.setSize(params.shadowSize),
    resetHair: () => {
      const head = headPosition()
      sim.reset(head.x, head.y, head.z, params)
    },
    resetHead: () => {
      headRef.value?.position.set(0, 0, 0)
      sim.reset(0, 0, 0, params)
    }
  })
})

onUnmounted(() => {
  pane?.dispose()
  shadow.dispose()
  lut.dispose()
  sim?.texture.dispose()
  hairGeometry.value?.dispose()
  guideGeometry.value?.dispose()
  snow.dispose()
})
</script>

<template>
  <OrbitControls
    :enabled="!isDragging"
    :target="[0, -1.2, 0]"
    :min-distance="2.5"
    :max-distance="30"
  />

  <TresFogExp2 :color="params.waterColor" :density="params.fogDensity" />

  <TresMesh :visible="params.backdropVisible">
    <TresSphereGeometry :args="[60, 32, 32]" />
    <TresShaderMaterial
      :vertex-shader="backdropVertex"
      :fragment-shader="backdropFragment"
      :uniforms="backdropUniforms"
      :side="BackSide"
      :depth-write="false"
    />
  </TresMesh>

  <TresPoints :geometry="snow.geometry" :visible="params.snowVisible">
    <TresPointsMaterial
      :color="0xbfe4ec"
      :size="0.035"
      :size-attenuation="true"
      :transparent="true"
      :opacity="0.45"
      :depth-write="false"
    />
  </TresPoints>

  <TresMesh ref="headRef" :visible="params.headVisible">
    <TresSphereGeometry :args="[HEAD_RADIUS, 64, 64]" />
    <TresMeshStandardMaterial
      :color="params.headColor"
      :roughness="params.headRoughness"
      :metalness="0.05"
    />
  </TresMesh>

  <DragControls
    v-if="headRef"
    :objects="[headRef]"
    @dragstart="isDragging = true"
    @dragend="isDragging = false"
  />

  <TresMesh
    v-if="hairGeometry && params.primitive === 'ribbon'"
    :geometry="hairGeometry"
    :visible="params.hairVisible"
    :frustum-culled="false"
  >
    <TresShaderMaterial
      :vertex-shader="vertex"
      :fragment-shader="fragment"
      :uniforms="uniforms"
      :transparent="true"
      :alpha-to-coverage="true"
      :side="DoubleSide"
      :wireframe="params.wireframe"
    />
  </TresMesh>

  <TresLineSegments
    v-if="hairGeometry && params.primitive === 'line'"
    :geometry="hairGeometry"
    :visible="params.hairVisible"
    :frustum-culled="false"
  >
    <TresShaderMaterial
      :vertex-shader="vertex"
      :fragment-shader="fragment"
      :uniforms="uniforms"
      :transparent="true"
    />
  </TresLineSegments>

  <TresLineSegments
    v-if="guideGeometry"
    :geometry="guideGeometry"
    :visible="params.showGuides"
    :frustum-culled="false"
  >
    <TresLineBasicMaterial :color="0x66ffcc" />
  </TresLineSegments>

  <TresAmbientLight :intensity="0.35" />
  <TresDirectionalLight
    :position="[params.lightPos.x, params.lightPos.y, params.lightPos.z]"
    :color="params.lightColor"
    :intensity="params.lightIntensity"
  />
</template>

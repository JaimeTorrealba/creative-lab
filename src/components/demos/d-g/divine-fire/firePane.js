import { Pane } from 'tweakpane'
import { extinguishFire, igniteFire, setFireWireframe, setSourceVisibility } from './divineFire'

const FLAME_BINDINGS = [
  ['height', 'uHeight', { min: 0, max: 2 }],
  ['inflate', 'uInflate', { min: 0, max: 0.1 }],
  ['tongueScale', 'uTongueScale', { label: 'tongue scale', min: 0, max: 10 }],
  ['tongueSpeed', 'uTongueSpeed', { label: 'tongue speed', min: 0, max: 4 }],
  ['tongueVariation', 'uTongueVariation', { label: 'tongue variation', min: 0, max: 1 }],
  ['erosion', 'uErosion', { min: 0, max: 2 }],
  ['softness', 'uSoftness', { min: 0.01, max: 1 }],
  ['fresnelPower', 'uFresnelPower', { label: 'fresnel', min: 0, max: 5 }]
]

const TEXTURE_BINDINGS = [
  ['textureScale', 'uTextureScale', { label: 'scale', min: 0.2, max: 10 }],
  ['scrollSpeed', 'uScrollSpeed', { label: 'scroll speed', min: 0, max: 4 }],
  ['distortion', 'uDistortion', { min: 0, max: 1.5 }],
  ['distortionSpeed', 'uDistortionSpeed', { label: 'distortion speed', min: 0, max: 2 }]
]

const COLOR_BINDINGS = [
  ['colorCore', 'uColorCore', { label: 'core' }],
  ['colorMid', 'uColorMid', { label: 'mid' }],
  ['colorDeep', 'uColorDeep', { label: 'deep' }]
]

const bindNumberUniforms = (folder, params, uniforms, bindings) =>
  bindings.forEach(([key, uniformName, options]) => {
    folder.addBinding(params, key, options).on('change', ({ value }) => {
      uniforms[uniformName].value = value
    })
  })

const bindColorUniforms = (folder, params, uniforms, bindings) =>
  bindings.forEach(([key, uniformName, options]) => {
    folder.addBinding(params, key, options).on('change', ({ value }) => {
      uniforms[uniformName].value.set(value)
    })
  })

const setFireBurning = (fire, burning, trigger) =>
  burning ? igniteFire(fire, trigger.leadIn) : extinguishFire(fire, trigger.leadOut)

const setAllFiresBurning = (pane, fires, trigger, burning) => {
  fires.forEach((fire) => {
    trigger.burning[fire.key] = burning
    setFireBurning(fire, burning, trigger)
  })
  pane.refresh()
}

const addTriggerFolder = (pane, fires, trigger) => {
  const folder = pane.addFolder({ title: 'Trigger' })
  fires.forEach((fire) => {
    folder.addBinding(trigger.burning, fire.key).on('change', ({ value }) => {
      setFireBurning(fire, value, trigger)
    })
  })
  folder.addButton({ title: 'Ignite all' }).on('click', () => {
    setAllFiresBurning(pane, fires, trigger, true)
  })
  folder.addButton({ title: 'Extinguish all' }).on('click', () => {
    setAllFiresBurning(pane, fires, trigger, false)
  })
  folder.addBinding(trigger, 'leadIn', { label: 'lead in (s)', min: 0.1, max: 5 })
  folder.addBinding(trigger, 'leadOut', { label: 'lead out (s)', min: 0.1, max: 5 })
}

const addSceneFolder = (pane, { fires, sceneParams, bloom, fireParams, uniforms }) => {
  const folder = pane.addFolder({ title: 'Scene', expanded: false })
  const sourceBinding = folder.addBinding(sceneParams, 'showSource', { label: 'source meshes' })
  sourceBinding.on('change', ({ value }) => {
    fires.forEach((fire) => setSourceVisibility(fire, value))
  })
  folder.addBinding(sceneParams, 'wireframe').on('change', ({ value }) => {
    fires.forEach((fire) => setFireWireframe(fire, value))
  })
  folder.addBinding(fireParams, 'debugMask', { label: 'normal mask' }).on('change', ({ value }) => {
    uniforms.uDebugMask.value = value ? 1 : 0
  })
  folder.addBinding(sceneParams, 'animate')
  folder.addBinding(sceneParams, 'lightStrength', { label: 'fire light', min: 0, max: 20 })
  folder.addBinding(bloom, 'intensity', { label: 'bloom', min: 0, max: 5 })
  folder.addBinding(bloom, 'threshold', { label: 'bloom threshold', min: 0, max: 2 })
}

export const createFirePane = ({ fires, trigger, fireParams, uniforms, sceneParams, bloom }) => {
  const pane = new Pane({ title: 'Divine Fire' })

  addTriggerFolder(pane, fires, trigger)

  const flames = pane.addFolder({ title: 'Flames' })
  bindNumberUniforms(flames, fireParams, uniforms, FLAME_BINDINGS)

  const texture = pane.addFolder({ title: 'Fire texture', expanded: false })
  bindNumberUniforms(texture, fireParams, uniforms, TEXTURE_BINDINGS)

  const color = pane.addFolder({ title: 'Color', expanded: false })
  bindColorUniforms(color, fireParams, uniforms, COLOR_BINDINGS)
  bindNumberUniforms(color, fireParams, uniforms, [
    ['brightness', 'uBrightness', { min: 0, max: 6 }]
  ])

  addSceneFolder(pane, { fires, sceneParams, bloom, fireParams, uniforms })

  return pane
}

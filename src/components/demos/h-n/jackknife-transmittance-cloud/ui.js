import { Pane } from 'tweakpane'
import { ESTIMATOR, VIEW_MODE, lightDirFromAngles, params, u } from './params'

const ESTIMATOR_OPTIONS = {
  'Biased ray marching': ESTIMATOR.BIASED_RAY_MARCHING,
  'Jackknife (paper)': ESTIMATOR.JACKKNIFE,
  'Ratio tracking': ESTIMATOR.RATIO_TRACKING,
  Reference: ESTIMATOR.REFERENCE
}

export function setupUI({ getMaxDensity, reset, resize, regenerateVolume }) {
  const pane = new Pane({ title: 'Jackknife Transmittance' })

  // Push params into uniforms; changes that alter the integrand need a reset.
  function apply(needsReset) {
    u.estA.value = params.estimatorA
    u.estB.value = params.estimatorB
    u.lightSamples.value = params.lightSamples
    u.refSteps.value = params.referenceSteps
    u.camSteps.value = params.cameraSteps

    u.densityScale.value = params.densityScale
    u.majorant.value = getMaxDensity() * params.densityScale
    u.albedo.value = params.albedo
    u.g.value = params.anisotropy
    u.lightDir.value.copy(lightDirFromAngles(params.lightAzimuth, params.lightElevation))
    u.lightIntensity.value = params.lightIntensity
    u.ambient.value = params.ambient

    u.viewMode.value = params.viewMode
    u.splitX.value = params.split
    u.diffAmp.value = params.diffAmp
    u.exposure.value = params.exposure
    u.tonemap.value = params.tonemap ? 1 : 0

    if (needsReset) reset()
  }

  const onSample = () => apply(true)
  const onDisplay = () => apply(false)

  const fVolume = pane.addFolder({ title: 'Volume' })
  fVolume
    .addBinding(params, 'seed', { min: 0, max: 999999, step: 1 })
    .on('change', () => regenerateVolume())
  fVolume.addButton({ title: 'reroll' }).on('click', () => {
    params.seed = Math.floor(Math.random() * 1_000_000)
    pane.refresh()
    regenerateVolume()
  })

  const fEst = pane.addFolder({ title: 'Estimators' })
  fEst
    .addBinding(params, 'estimatorA', { label: 'A', options: ESTIMATOR_OPTIONS })
    .on('change', onSample)
  fEst
    .addBinding(params, 'estimatorB', { label: 'B (split)', options: ESTIMATOR_OPTIONS })
    .on('change', onSample)
  fEst
    .addBinding(params, 'lightSamples', {
      label: 'light samples N',
      min: 2,
      max: 64,
      step: 2
    })
    .on('change', onSample)
  fEst
    .addBinding(params, 'referenceSteps', {
      label: 'reference steps',
      min: 32,
      max: 512,
      step: 32
    })
    .on('change', onSample)
  fEst
    .addBinding(params, 'cameraSteps', {
      label: 'camera steps',
      min: 16,
      max: 192,
      step: 8
    })
    .on('change', onSample)

  const fMedium = pane.addFolder({ title: 'Medium & Light' })
  fMedium
    .addBinding(params, 'densityScale', { label: 'density', min: 0.5, max: 40, step: 0.5 })
    .on('change', onSample)
  fMedium.addBinding(params, 'albedo', { min: 0, max: 1, step: 0.01 }).on('change', onSample)
  fMedium
    .addBinding(params, 'anisotropy', { label: 'HG g', min: -0.9, max: 0.9, step: 0.05 })
    .on('change', onSample)
  fMedium
    .addBinding(params, 'lightAzimuth', { label: 'light azimuth', min: -180, max: 180, step: 1 })
    .on('change', onSample)
  fMedium
    .addBinding(params, 'lightElevation', { label: 'light elevation', min: -10, max: 89, step: 1 })
    .on('change', onSample)
  fMedium
    .addBinding(params, 'lightIntensity', { label: 'intensity', min: 0, max: 10, step: 0.1 })
    .on('change', onSample)
  fMedium.addBinding(params, 'ambient', { min: 0, max: 1, step: 0.01 }).on('change', onSample)

  const fView = pane.addFolder({ title: 'View' })
  fView
    .addBinding(params, 'viewMode', {
      label: 'mode',
      options: {
        'Split A | B': VIEW_MODE.SPLIT,
        'Single (A)': VIEW_MODE.SINGLE,
        'Difference A − Ref': VIEW_MODE.DIFFERENCE
      }
    })
    .on('change', onSample)
  fView.addBinding(params, 'split', { min: 0, max: 1, step: 0.01 }).on('change', onSample)
  fView
    .addBinding(params, 'diffAmp', { label: 'diff ×', min: 1, max: 100, step: 1 })
    .on('change', onDisplay)
  fView.addBinding(params, 'exposure', { min: 0.1, max: 6, step: 0.05 }).on('change', onDisplay)
  fView.addBinding(params, 'tonemap', { label: 'tonemap (Reinhard)' }).on('change', onDisplay)
  fView
    .addBinding(params, 'renderScale', { label: 'render scale', min: 0.25, max: 1, step: 0.25 })
    .on('change', () => resize())
  fView.addBinding(params, 'accumulate')
  fView.addButton({ title: 'reset accumulation' }).on('click', () => reset())

  apply(true)
  return pane
}

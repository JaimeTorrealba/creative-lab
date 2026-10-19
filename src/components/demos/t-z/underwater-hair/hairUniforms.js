import { Color, Vector2, Vector3 } from 'three'

// Plain uniform objects on purpose: uTime and the guide texture are written every frame, and
// routing that through Vue reactivity would re-render the whole subtree 60 times a second.
// Spreading the shadow pipeline's block keeps those { value } objects shared by reference, so
// one update drives both the camera pass and the shadow pass.
export const createHairUniforms = (params, { shadowUniforms, lutM, lutN }) => ({
  ...shadowUniforms,

  uGuides: { value: null },
  uGuideSize: { value: new Vector2(1, 1) },
  uWidth: { value: params.strandWidth },
  uTipTaper: { value: params.tipTaper },
  uCurlAmount: { value: params.curlAmount },
  uCurlFrequency: { value: params.curlFrequency },
  uClumping: { value: params.clumping },

  uRootColor: { value: new Color(params.rootColor) },
  uTipColor: { value: new Color(params.tipColor) },
  uColorVariation: { value: params.colorVariation },
  uOpacity: { value: params.opacity },
  uRoundness: { value: params.roundness },

  uShadingModel: { value: params.shadingModel },
  uShine: { value: params.shine },
  uSpecColor1: { value: new Color(params.specColor1) },
  uSpecColor2: { value: new Color(params.specColor2) },
  uPrimaryShift: { value: params.primaryShift },
  uSecondaryShift: { value: params.secondaryShift },
  uPrimaryExp: { value: params.primaryExp },
  uSecondaryExp: { value: params.secondaryExp },
  uDiffuseWrap: { value: params.diffuseWrap },
  uRootShadow: { value: params.rootShadow },
  uAmbient: { value: params.ambient },

  uLutM: { value: lutM },
  uLutN: { value: lutN },
  uAbsorption: { value: new Vector3(0.6, 1.1, 1.9) },

  uLightPos: { value: new Vector3() },
  uLightColor: { value: new Color(params.lightColor) },
  uLightIntensity: { value: params.lightIntensity },

  uWaterColor: { value: new Color(params.waterColor) },
  uWaterDensity: { value: params.waterDensity },
  uCausticIntensity: { value: params.causticIntensity },
  uCausticScale: { value: params.causticScale },
  uCausticSpeed: { value: params.causticSpeed },
  uTime: { value: 0 }
})

export const createBackdropUniforms = (params) => ({
  uWaterColor: { value: new Color(params.waterColor) },
  uDeepColor: { value: new Color(params.deepColor) },
  uLightColor: { value: new Color(params.lightColor) },
  uShaftIntensity: { value: params.shaftIntensity },
  uCausticIntensity: { value: params.causticIntensity },
  uCausticSpeed: { value: params.causticSpeed },
  uTime: { value: 0 }
})

// Color.set() parses the hex string, so only pay for it when the picker actually moved.
const absorptionColor = new Color()

export const createUniformSync = (params, uniforms, backdropUniforms) => {
  const cache = {}

  const syncColor = (uniform, key) => {
    if (cache[key] === params[key]) return
    cache[key] = params[key]
    uniform.value.set(params[key])
  }

  return (elapsed) => {
    uniforms.uTime.value = elapsed
    uniforms.uWidth.value = params.strandWidth
    uniforms.uTipTaper.value = params.tipTaper
    uniforms.uCurlAmount.value = params.curlAmount
    uniforms.uCurlFrequency.value = params.curlFrequency
    uniforms.uClumping.value = params.clumping
    uniforms.uColorVariation.value = params.colorVariation
    uniforms.uOpacity.value = params.opacity
    uniforms.uRoundness.value = params.roundness
    uniforms.uShadingModel.value = params.shadingModel
    uniforms.uShine.value = params.shine
    uniforms.uPrimaryShift.value = params.primaryShift
    uniforms.uSecondaryShift.value = params.secondaryShift
    uniforms.uPrimaryExp.value = params.primaryExp
    uniforms.uSecondaryExp.value = params.secondaryExp
    uniforms.uDiffuseWrap.value = params.diffuseWrap
    uniforms.uRootShadow.value = params.rootShadow
    uniforms.uAmbient.value = params.ambient
    uniforms.uLightIntensity.value = params.lightIntensity
    uniforms.uWaterDensity.value = params.waterDensity
    uniforms.uCausticIntensity.value = params.causticIntensity
    uniforms.uCausticScale.value = params.causticScale
    uniforms.uCausticSpeed.value = params.causticSpeed
    uniforms.uShadowStrength.value = params.shadowStrength
    uniforms.uShadowEnabled.value = params.shadowEnabled ? 1 : 0
    uniforms.uLightPos.value.set(params.lightPos.x, params.lightPos.y, params.lightPos.z)

    // Absorption is a colour picker, but it reads as "what the fibre keeps", so invert it into
    // an extinction coefficient the way effective-water derives absorption from a tint.
    if (cache.absorption !== params.absorption) {
      cache.absorption = params.absorption
      absorptionColor.set(params.absorption)
      uniforms.uAbsorption.value.set(
        -Math.log(Math.max(absorptionColor.r, 0.01)) * 0.35,
        -Math.log(Math.max(absorptionColor.g, 0.01)) * 0.35,
        -Math.log(Math.max(absorptionColor.b, 0.01)) * 0.35
      )
    }

    syncColor(uniforms.uRootColor, 'rootColor')
    syncColor(uniforms.uTipColor, 'tipColor')
    syncColor(uniforms.uSpecColor1, 'specColor1')
    syncColor(uniforms.uSpecColor2, 'specColor2')
    syncColor(uniforms.uLightColor, 'lightColor')
    syncColor(uniforms.uWaterColor, 'waterColor')

    backdropUniforms.uTime.value = elapsed
    backdropUniforms.uShaftIntensity.value = params.shaftIntensity
    backdropUniforms.uCausticIntensity.value = params.causticIntensity
    backdropUniforms.uCausticSpeed.value = params.causticSpeed
    backdropUniforms.uWaterColor.value.copy(uniforms.uWaterColor.value)
    backdropUniforms.uLightColor.value.copy(uniforms.uLightColor.value)
    syncColor(backdropUniforms.uDeepColor, 'deepColor')
  }
}

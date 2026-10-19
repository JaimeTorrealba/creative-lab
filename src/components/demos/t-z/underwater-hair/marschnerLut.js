import { DataTexture, FloatType, LinearFilter, RGBAFormat } from 'three'

// Marschner lookup textures, GPU Gems 2 ch. 23 §23.3.
//
// The chapter evaluates hair as a translucent cylinder with three scattering paths —
// R (surface), TT (refract in, out) and TRT (refract, internal reflection, refract out) —
// as S = S_R + S_TT + S_TRT, each factored into S_P = M_P(theta_i, theta_o) * N_P(phi_d, theta_d),
// and bakes M and N into two 128x128 textures so the shader never does the trigonometry.
//
// Two deviations from the chapter, both deliberate:
//
// 1. M is exact (a Gaussian in the half angle). N uses the standard analytic lobes rather than
//    Marschner's full root-solving of the Bravais-index equation. The cubic solve is bakeable,
//    but it is intricate enough that getting it subtly wrong would be invisible to review.
// 2. Absorption is wavelength-dependent and would need three N textures. The LUT carries
//    geometry and Fresnel only; the RGB absorption is applied analytically in the fragment.
//    That is also the nicer control — hair colour becomes physically driven.
//
// The paper's 8-bit packing trick (assuming M_TT = M_TRT to fit two textures) is unnecessary
// here because float textures have the room.

export const LUT_SIZE = 128

const DEG = Math.PI / 180

// Unit-integral Gaussian, the chapter's g(beta; x).
const gaussian = (beta, x) =>
  Math.exp(-(x * x) / (2 * beta * beta)) / (beta * Math.sqrt(2 * Math.PI))

// Schlick Fresnel against the Bravais virtual index, which is how a cylinder's azimuthal
// geometry turns into an effective IOR at a given longitudinal angle.
const fresnel = (eta, cosTheta) => {
  const r0 = ((1 - eta) / (1 + eta)) ** 2
  const c = Math.max(0, Math.min(1, cosTheta))
  return r0 + (1 - r0) * (1 - c) ** 5
}

const bravais = (eta, thetaD) => {
  const sinT = Math.sin(thetaD)
  return Math.sqrt(Math.max(eta * eta - sinT * sinT, 1e-6)) / Math.max(Math.cos(thetaD), 1e-4)
}

export const createMarschnerLut = () => {
  const mData = new Float32Array(LUT_SIZE * LUT_SIZE * 4)
  const nData = new Float32Array(LUT_SIZE * LUT_SIZE * 4)

  const mTexture = new DataTexture(mData, LUT_SIZE, LUT_SIZE, RGBAFormat, FloatType)
  const nTexture = new DataTexture(nData, LUT_SIZE, LUT_SIZE, RGBAFormat, FloatType)

  for (const t of [mTexture, nTexture]) {
    t.minFilter = LinearFilter
    t.magFilter = LinearFilter
    t.generateMipmaps = false
  }

  // M_P(theta_i, theta_o), indexed by (sin theta_i, sin theta_o) over [-1, 1].
  const bakeM = ({ shiftR, shiftTT, shiftTRT, widthR, widthTT, widthTRT }) => {
    const aR = shiftR * DEG
    const aTT = shiftTT * DEG
    const aTRT = shiftTRT * DEG
    const bR = Math.max(widthR, 0.5) * DEG
    const bTT = Math.max(widthTT, 0.5) * DEG
    const bTRT = Math.max(widthTRT, 0.5) * DEG
    let peak = 1e-6

    for (let y = 0; y < LUT_SIZE; y++) {
      const sinO = ((y + 0.5) / LUT_SIZE) * 2 - 1
      const thetaO = Math.asin(Math.max(-1, Math.min(1, sinO)))

      for (let x = 0; x < LUT_SIZE; x++) {
        const sinI = ((x + 0.5) / LUT_SIZE) * 2 - 1
        const thetaI = Math.asin(Math.max(-1, Math.min(1, sinI)))
        const thetaH = (thetaI + thetaO) * 0.5

        const k = (y * LUT_SIZE + x) * 4
        mData[k + 0] = gaussian(bR, thetaH - aR)
        mData[k + 1] = gaussian(bTT, thetaH - aTT)
        mData[k + 2] = gaussian(bTRT, thetaH - aTRT)
        mData[k + 3] = 1
        peak = Math.max(peak, mData[k], mData[k + 1], mData[k + 2])
      }
    }

    // Normalise so the shader's intensity slider means the same thing at any lobe width.
    for (let i = 0; i < mData.length; i += 4) {
      mData[i] /= peak
      mData[i + 1] /= peak
      mData[i + 2] /= peak
    }

    mTexture.needsUpdate = true
  }

  // N_P(phi_d, theta_d), indexed by (cos phi_d, cos theta_d) over [-1, 1].
  const bakeN = ({ iorHair, glintAngle }) => {
    const phiC = Math.max(5, glintAngle) * DEG

    for (let y = 0; y < LUT_SIZE; y++) {
      const cosThetaD = ((y + 0.5) / LUT_SIZE) * 2 - 1
      const thetaD = Math.acos(Math.max(-1, Math.min(1, cosThetaD)))
      const eta = bravais(iorHair, thetaD)

      for (let x = 0; x < LUT_SIZE; x++) {
        const cosPhi = ((x + 0.5) / LUT_SIZE) * 2 - 1
        const phi = Math.acos(Math.max(-1, Math.min(1, cosPhi)))

        // R: specular off the cylinder surface, falling off as cos(phi/2).
        const cosHalf = Math.cos(phi * 0.5)
        const f = fresnel(eta, cosHalf)
        const nR = f * Math.max(cosHalf, 0) * 0.25

        // TT: forward scattering, a narrow lobe peaked at phi = pi (straight through).
        const dTT = phi - Math.PI
        const nTT = (1 - f) * (1 - f) * Math.exp(-(dTT * dTT) / (2 * 0.35 * 0.35))

        // TRT: one internal reflection, giving a broad lobe plus the caustic glint near phi_c.
        const dG = Math.abs(phi) - phiC
        const glint = Math.exp(-(dG * dG) / (2 * 0.18 * 0.18))
        const nTRT = (1 - f) * (1 - f) * f * (0.4 * Math.max(cosHalf, 0) + 1.6 * glint)

        const k = (y * LUT_SIZE + x) * 4
        nData[k + 0] = nR
        nData[k + 1] = nTT
        nData[k + 2] = nTRT
        nData[k + 3] = 1
      }
    }

    // Normalise each lobe to peak at 1, as bakeM does. Without this M*N tops out around 0.25
    // while Scheuermann's strandSpecular peaks at 1, so switching models would look like
    // someone turned the lights off rather than like a different reflectance model.
    let peakR = 1e-6
    let peakTT = 1e-6
    let peakTRT = 1e-6
    for (let i = 0; i < nData.length; i += 4) {
      if (nData[i] > peakR) peakR = nData[i]
      if (nData[i + 1] > peakTT) peakTT = nData[i + 1]
      if (nData[i + 2] > peakTRT) peakTRT = nData[i + 2]
    }
    for (let i = 0; i < nData.length; i += 4) {
      nData[i] /= peakR
      nData[i + 1] /= peakTT
      nData[i + 2] /= peakTRT
    }

    nTexture.needsUpdate = true
  }

  const bake = (params) => {
    bakeM(params)
    bakeN(params)
  }

  const dispose = () => {
    mTexture.dispose()
    nTexture.dispose()
  }

  return { mTexture, nTexture, bake, dispose }
}

import {
  Break,
  Fn,
  If,
  Loop,
  dot,
  float,
  int,
  luminance,
  max,
  min,
  mix,
  normalize,
  select,
  texture,
  texture3D,
  uint,
  uv,
  vec2,
  vec3,
  vec4
} from 'three/tsl'
import { ESTIMATOR, VIEW_MODE, u } from './params'

// TSL implementation of the single-scattering volume renderer with selectable
// transmittance estimators, following the reference GLSL of
// "Jackknife Transmittance and MIS Weight Estimation" (Peters, SIGGRAPH Asia
// 2025), `src/shaders/volume_utilities.glsl` on the `jackknife` branch.

const BG = vec3(0.012, 0.014, 0.02)

// --- RNG (PCG, Jarzynski & Olano) ------------------------------------------

const pcg = /*@__PURE__*/ Fn(([n]) => {
  const state = n.mul(uint(747796405)).add(uint(2891336453)).toVar()
  const word = state
    .shiftRight(state.shiftRight(uint(28)).add(uint(4)))
    .bitXor(state)
    .mul(uint(277803737))
    .toVar()
  return word.shiftRight(uint(22)).bitXor(word)
})

// Advances `seed` (a uint var) and returns a uniform float in [0, 1).
function rand(seed) {
  seed.assign(pcg(seed))
  return float(seed).mul(1 / 4294967296)
}

// --- geometry ----------------------------------------------------------------

// Slab test against the volume AABB [-1, 1]^3. Returns vec2(tNear, tFar).
function rayBox(ro, rd) {
  const inv = vec3(1).div(rd)
  const tA = vec3(-1).sub(ro).mul(inv)
  const tB = vec3(1).sub(ro).mul(inv)
  const tMin = min(tA, tB)
  const tMax = max(tA, tB)
  return vec2(max(max(tMin.x, tMin.y), tMin.z), min(min(tMax.x, tMax.y), tMax.z))
}

function phaseHG(cosTheta, g) {
  const g2 = g.mul(g)
  const denom = g2.add(1).sub(g.mul(cosTheta).mul(2)).max(1e-4)
  return g2
    .oneMinus()
    .div(denom.mul(denom.sqrt()))
    .mul(1 / (4 * Math.PI))
}

export function createPipelines(volumeTexture, rtInitialRead, rtInitialWrite) {
  // Extinction coefficient sigma_t at a world-space position in [-1,1]^3.
  // explicit level 0 => textureSampleLevel, legal in non-uniform loops
  const sampleDensity = (pos) => texture3D(volumeTexture, pos.mul(0.5).add(0.5), 0).r.mul(u.densityScale)

  // Optical depth along [0, tMax] with stratified jittered ray marching:
  // one uniform random sample per equal segment (the estimator family the
  // jackknife method builds on — near-normal distributed by CLT).
  const opticalDepth = (ro, rd, tMax, steps, seed) => {
    const sum = float(0).toVar()
    const dt = tMax.div(float(steps))
    Loop({ start: int(0), end: steps, type: 'int', condition: '<' }, ({ i }) => {
      const t = float(i).add(rand(seed)).mul(dt)
      sum.addAssign(sampleDensity(ro.add(rd.mul(t))))
    })
    return sum.mul(dt)
  }

  // Transmittance exp(-tau) along [0, tMax], via the selected estimator.
  const transmittance = (ro, rd, tMax, est, seed) => {
    const T = float(1).toVar()

    If(est.equal(int(ESTIMATOR.BIASED_RAY_MARCHING)), () => {
      // Naive: exp of a single jittered estimate. E[exp(-tau_hat)] >= exp(-tau)
      // (Jensen), so this systematically OVERestimates transmittance.
      const tau = opticalDepth(ro, rd, tMax, u.lightSamples, seed)
      T.assign(tau.negate().exp())
    })
      .ElseIf(est.equal(int(ESTIMATOR.JACKKNIFE)), () => {
        // Paper: UMVU estimator of exp(-tau) for normal-distributed tau_hat.
        // Two independent estimates at half the budget each (cost parity).
        const half = max(u.lightSamples.div(2), int(1))
        const tau0 = opticalDepth(ro, rd, tMax, half, seed)
        const tau1 = opticalDepth(ro, rd, tMax, half, seed)
        const mean = tau0.add(tau1).mul(0.5)
        const dev = tau0.sub(tau1).mul(0.5).abs()
        // cos(dev) may go negative; that is intentional (signed estimates
        // average out — do not clamp before accumulation).
        T.assign(dev.cos().mul(mean.negate().exp()))
      })
      .ElseIf(est.equal(int(ESTIMATOR.RATIO_TRACKING)), () => {
        // Unbiased null-collision estimator (Novak et al. 2014). Needs the
        // majorant; cost is stochastic, variance high in dense regions.
        If(u.majorant.greaterThan(1e-5), () => {
          const t = float(0).toVar()
          Loop(int(1024), () => {
            t.subAssign(rand(seed).oneMinus().max(1e-7).log().div(u.majorant))
            If(t.greaterThanEqual(tMax), () => {
              Break()
            })
            const d = sampleDensity(ro.add(rd.mul(t)))
            T.mulAssign(d.div(u.majorant).oneMinus())
          })
        })
      })
      .Else(() => {
        // Reference: deterministic midpoint ray marching at high step count.
        const sum = float(0).toVar()
        const dt = tMax.div(float(u.refSteps))
        Loop({ start: int(0), end: u.refSteps, type: 'int', condition: '<' }, ({ i }) => {
          const t = float(i).add(0.5).mul(dt)
          sum.addAssign(sampleDensity(ro.add(rd.mul(t))))
        })
        T.assign(sum.mul(dt).negate().exp())
      })

    return T
  }

  // Single-scattering radiance along a camera ray.
  // Returns vec4(L.rgb, viewTransmittance).
  const radianceFn = Fn(([ro, rd, est, seedIn]) => {
    const seed = seedIn.toVar()
    const L = vec3(0).toVar()
    const T = float(1).toVar()

    const tRange = rayBox(ro, rd).toVar()
    const t0 = max(tRange.x, 0).toVar()
    const t1 = tRange.y.toVar()

    If(t1.greaterThan(t0), () => {
      const dt = t1.sub(t0).div(float(u.camSteps)).toVar()
      const jitter = rand(seed).toVar()
      Loop({ start: int(0), end: u.camSteps, type: 'int', condition: '<' }, ({ i }) => {
        const t = t0.add(float(i).add(jitter).mul(dt))
        const pos = ro.add(rd.mul(t)).toVar()
        const sigmaT = sampleDensity(pos).toVar()
        If(sigmaT.greaterThan(1e-4), () => {
          const lRange = rayBox(pos, u.lightDir).toVar()
          const Tl = transmittance(pos, u.lightDir, max(lRange.y, 0), est, seed)
          const ph = phaseHG(dot(rd, u.lightDir), u.g)
          const inscatter = Tl.mul(ph).mul(u.lightIntensity).add(u.ambient)
          L.addAssign(inscatter.mul(sigmaT.mul(u.albedo)).mul(dt).mul(T))
          T.mulAssign(sigmaT.mul(dt).negate().exp())
          If(T.lessThan(0.0015), () => {
            T.assign(0)
            Break()
          })
        })
      })
    })

    return vec4(L, T)
  })

  const prevAccumTex = texture(rtInitialRead.texture)
  const accumTex = texture(rtInitialWrite.texture)

  // Accumulation pass: renders one sample and running-averages into the RT.
  const sampleNode = Fn(() => {
    const uvC = uv().toVar()
    const px = uvC.mul(u.resolution).toVar()
    const seed = pcg(uint(px.x).add(pcg(uint(px.y).add(pcg(u.frame))))).toVar()

    // primary ray from camera basis
    const ndc = uvC.mul(2).sub(1).toVar()
    const rd = normalize(
      u.camFwd
        .add(u.camRight.mul(ndc.x.mul(u.aspect).mul(u.tanHalfFov)))
        .add(u.camUp.mul(ndc.y.mul(u.tanHalfFov)))
    ).toVar()

    // estimator for this pixel (split screen picks per side)
    const est = select(
      u.viewMode.equal(int(VIEW_MODE.SPLIT)),
      select(uvC.x.lessThan(u.splitX), u.estA, u.estB),
      u.estA
    ).toVar()

    const main = radianceFn(u.camPos, rd, est, seed)
    const col = main.rgb.add(main.a.mul(BG)).toVar()

    // in difference mode also accumulate the reference luminance (alpha)
    const refLum = float(0).toVar()
    If(u.viewMode.equal(int(VIEW_MODE.DIFFERENCE)), () => {
      const seed2 = pcg(seed.bitXor(uint(0x9e3779b9)))
      const ref = radianceFn(u.camPos, rd, int(ESTIMATOR.REFERENCE), seed2)
      refLum.assign(luminance(ref.rgb.add(ref.a.mul(BG))))
    })

    // running average; frame 0 has weight 1, so no clear is needed
    const w = float(1).div(float(u.frame).add(1))
    return mix(prevAccumTex, vec4(col, refLum), w)
  })()

  // Display pass: tonemap / difference heatmap / split divider.
  const displayNode = Fn(() => {
    const uvC = uv().toVar()
    const c = accumTex.toVar()
    const outC = vec3(0).toVar()

    If(u.viewMode.equal(int(VIEW_MODE.DIFFERENCE)), () => {
      // signed error vs reference: red = brighter than reference (positive
      // bias, e.g. naive exp), blue = darker
      const d = luminance(c.rgb).sub(c.a).mul(u.diffAmp).toVar()
      outC.assign(vec3(max(d, 0), d.abs().mul(0.08), max(d.negate(), 0)))
    }).Else(() => {
      const e = max(c.rgb.mul(u.exposure), vec3(0)).toVar()
      If(u.tonemap.equal(int(1)), () => {
        outC.assign(e.div(e.add(1))) // Reinhard
      }).Else(() => {
        outC.assign(e)
      })
    })

    // split divider line (~1.5 px)
    const distPx = uvC.x.sub(u.splitX).abs().mul(u.resolution.x)
    If(u.viewMode.equal(int(VIEW_MODE.SPLIT)).and(distPx.lessThan(1.5)), () => {
      outC.assign(mix(outC, vec3(1), 0.4))
    })

    return vec4(outC, 1)
  })()

  return { sampleNode, displayNode, prevAccumTex, accumTex }
}

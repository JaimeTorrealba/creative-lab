import {
  Break,
  Fn,
  If,
  Loop,
  abs,
  cameraPosition,
  ceil,
  dot,
  float,
  int,
  length,
  max,
  min,
  mix,
  modelWorldMatrixInverse,
  normalize,
  positionLocal,
  select,
  texture,
  texture3D,
  uniform,
  vec2,
  vec3,
  vec4
} from 'three/tsl'

export const COMPOSITION = {
  'Maximum intensity': 0,
  'Threshold / isovalue': 1,
  'Emission absorption': 2
}

const MAX_SAMPLES = 2048
const BOX_MIN = vec3(-0.5)
const BOX_MAX = vec3(0.5)

export const createVolumeUniforms = () => ({
  composition: uniform(COMPOSITION['Maximum intensity'], 'int'),
  samplingRate: uniform(1),
  threshold: uniform(0.5),
  alphaScale: uniform(1),
  invertColor: uniform(1),
  shading: uniform(1)
})

// Returns vec2(tNear, tFar) of the ray against the unit box the volume fills
const intersectBox = (rayOrigin, rayDir) => {
  const tMin = BOX_MIN.sub(rayOrigin).div(rayDir)
  const tMax = BOX_MAX.sub(rayOrigin).div(rayDir)
  const t1 = min(tMin, tMax)
  const t2 = max(tMin, tMax)
  return vec2(max(max(t1.x, t1.y), t1.z), min(min(t2.x, t2.y), t2.z))
}

export const createVolumeColorNode = (volumeTexture, paletteTexture, uniforms, dimensions) => {
  const texelSize = vec3(...dimensions.map((size) => 1 / size))

  // Explicit level 0 compiles to textureSampleLevel, which WGSL allows inside non-uniform loops
  const sampleDensity = (coord) => texture3D(volumeTexture, coord, 0).r

  const samplePalette = (value) => {
    const x = select(uniforms.invertColor.greaterThan(0.5), value.oneMinus(), value)
    return texture(paletteTexture, vec2(x, 0.5), 0).rgb
  }

  const estimateGradient = (coord) => {
    const dx = vec3(texelSize.x, 0, 0)
    const dy = vec3(0, texelSize.y, 0)
    const dz = vec3(0, 0, texelSize.z)
    return vec3(
      sampleDensity(coord.add(dx)).sub(sampleDensity(coord.sub(dx))),
      sampleDensity(coord.add(dy)).sub(sampleDensity(coord.sub(dy))),
      sampleDensity(coord.add(dz)).sub(sampleDensity(coord.sub(dz)))
    )
  }

  // Headlight Lambert on the density gradient; not in the notebook, flat isosurfaces read poorly
  const shadeSurface = (coord, rayDir) => {
    const gradient = estimateGradient(coord)
    const normal = gradient.div(max(length(gradient), 1e-5))
    const diffuse = abs(dot(normal, rayDir)).mul(0.8).add(0.2)
    return mix(float(1), diffuse, uniforms.shading)
  }

  const marchSamples = (ray, onSample) => {
    Loop({ start: int(0), end: ray.sampleCount, type: 'int', condition: '<' }, ({ i }) => {
      const t = ray.tStart.add(ray.tIncr.mul(float(i)))
      const coord = ray.texEntry.add(ray.direction.mul(t)).toVar()
      onSample({ value: sampleDensity(coord).toVar(), coord })
    })
  }

  const composeMaximumIntensity = (ray) => {
    const density = float(0).toVar()
    marchSamples(ray, ({ value }) => {
      density.assign(max(density, value))
      If(density.greaterThanEqual(1), () => {
        Break()
      })
    })
    return vec4(samplePalette(density), density.mul(uniforms.alphaScale))
  }

  const composeThreshold = (ray) => {
    const color = vec4(0).toVar()
    marchSamples(ray, ({ value, coord }) => {
      If(value.greaterThanEqual(uniforms.threshold), () => {
        const rgb = samplePalette(value).mul(shadeSurface(coord, ray.direction))
        color.assign(vec4(rgb, uniforms.alphaScale))
        Break()
      })
    })
    return color
  }

  // Front-to-back alpha blending with premultiplied colors, un-premultiplied for normal blending
  const composeEmissionAbsorption = (ray) => {
    const rgb = vec3(0).toVar()
    const alpha = float(0).toVar()
    marchSamples(ray, ({ value }) => {
      const sampleAlpha = min(value.mul(uniforms.alphaScale), 1)
      const weight = sampleAlpha.mul(alpha.oneMinus())
      rgb.addAssign(samplePalette(value).mul(weight))
      alpha.addAssign(weight)
      If(alpha.greaterThanEqual(0.95), () => {
        Break()
      })
    })
    return vec4(rgb.div(max(alpha, 1e-4)), alpha)
  }

  return Fn(() => {
    const rayOrigin = modelWorldMatrixInverse.mul(vec4(cameraPosition, 1)).xyz.toVar()
    const rayDir = normalize(positionLocal.sub(rayOrigin)).toVar()
    const hit = intersectBox(rayOrigin, rayDir).toVar()
    const color = vec4(0).toVar()

    If(hit.x.lessThanEqual(hit.y), () => {
      // Clamp so a camera inside the box does not sample behind itself
      const entryPoint = rayOrigin.add(rayDir.mul(max(hit.x, 0))).toVar()
      const exitPoint = rayOrigin.add(rayDir.mul(hit.y))
      const entryToExit = exitPoint.sub(entryPoint).toVar()

      // Entry Exit Align Corner sampling (Steneteg et al. 2019), as in the notebook
      const voxelSpan = length(entryToExit.mul(vec3(...dimensions).sub(1)))
      const samples = max(ceil(uniforms.samplingRate.mul(voxelSpan)), 1).toVar()
      const tIncr = length(entryToExit).div(samples).toVar()

      const ray = {
        direction: rayDir,
        texEntry: entryPoint.sub(BOX_MIN).div(BOX_MAX.sub(BOX_MIN)).toVar(),
        sampleCount: int(min(samples, MAX_SAMPLES)).toVar(),
        tStart: tIncr.mul(0.5).toVar(),
        tIncr
      }

      If(uniforms.composition.equal(int(COMPOSITION['Maximum intensity'])), () => {
        color.assign(composeMaximumIntensity(ray))
      })
        .ElseIf(uniforms.composition.equal(int(COMPOSITION['Threshold / isovalue'])), () => {
          color.assign(composeThreshold(ray))
        })
        .Else(() => {
          color.assign(composeEmissionAbsorption(ray))
        })
    })

    return color
  })()
}

// Volumetric Smoke/Clouds Fragment Shader (GLSL3)
precision highp float;
precision highp sampler3D;

in vec3 vOrigin;
in vec3 vDirection;
out vec4 color;

// Textures
uniform highp sampler3D uVolumeTexture;
uniform sampler2D uBlueNoise;
uniform sampler2D uDepthTexture; // reserved for future occlusion pass

// Scene & Camera Parameters
uniform vec2 uBlueNoiseSize;
uniform vec2 uResolution;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uLightDir; // must be normalized
uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;
uniform mat4 uProjectionMatrixInverse;
uniform mat4 uViewMatrixInverse;
uniform mat4 uModelMatrix;
uniform float uCameraNear;
uniform float uCameraFar;

// Cloud Material & Rendering Parameters
uniform float uOpacity;
uniform int uMaxSteps;
uniform int uLightSteps;
uniform float uDensityThreshold;
uniform float uDensityMultiplier;
uniform vec3 uTextureOffset;
uniform float uTextureTiling;
uniform bool uOcclusionMode; // not used here but kept for parity

// Volumetric Mask Uniforms
uniform float u_mask_raio;
uniform float u_mask_achatamentoCima;
uniform float u_mask_achatamentoBaixo;
uniform float u_mask_achatamentoXpos;
uniform float u_mask_achatamentoXneg;
uniform float u_mask_achatamentoZpos;
uniform float u_mask_achatamentoZneg;
uniform float u_mask_softness;
uniform float u_mask_forcaRuido;
uniform highp sampler3D u_mask_noiseMap;
uniform float u_mask_forcaRuidoDetalhe;
uniform highp sampler3D u_mask_noiseDetailMap;
uniform bool u_mask_visualize;

#define PI 3.14159265359
const vec3 EXTINCTION_MULT = vec3(0.6, 0.65, 0.7);
const float DUAL_LOBE_WEIGHT = 0.8;

float getMaskSDF(vec3 p) {
  if (u_mask_raio <= 0.0) return -1.0;
  vec3 q = p;
  q.y /= (p.y > 0.0) ? u_mask_achatamentoCima : u_mask_achatamentoBaixo;
  q.x /= (p.x > 0.0) ? u_mask_achatamentoXpos : u_mask_achatamentoXneg;
  q.z /= (p.z > 0.0) ? u_mask_achatamentoZpos : u_mask_achatamentoZneg;
  float dist = length(q);
  if (dist == 0.0) return u_mask_raio;
  vec3 dir = q / dist;
  vec3 texCoord = (dir * u_mask_raio) * 0.5 + 0.5;
  float n1 = texture(u_mask_noiseMap, texCoord).r * 2.0 - 1.0;
  float n2 = texture(u_mask_noiseDetailMap, texCoord).r * 2.0 - 1.0;
  float disp = n1 * u_mask_forcaRuido + n2 * u_mask_forcaRuidoDetalhe;
  return (u_mask_raio + disp) - dist;
}

float getMaskFactor(vec3 p) {
  float sdf = getMaskSDF(p);
  return smoothstep(0.0, u_mask_softness, sdf);
}

float HenyeyGreenstein(float g, float mu) {
  float gg = g * g;
  return (1.0 / (4.0 * PI)) * ((1.0 - gg) / pow(1.0 + gg - 2.0 * g * mu, 1.5));
}

float PhaseFunction(float g, float costh) {
  return mix(HenyeyGreenstein(-g, costh), HenyeyGreenstein(g, costh), DUAL_LOBE_WEIGHT);
}

vec2 hitBox(vec3 orig, vec3 dir) {
  const vec3 box_min = vec3(-0.5);
  const vec3 box_max = vec3(0.5);
  vec3 inv_dir = 1.0 / dir;
  vec3 tmin_tmp = (box_min - orig) * inv_dir;
  vec3 tmax_tmp = (box_max - orig) * inv_dir;
  vec3 tmin = min(tmin_tmp, tmax_tmp);
  vec3 tmax = max(tmin_tmp, tmax_tmp);
  float t0 = max(tmin.x, max(tmin.y, tmin.z));
  float t1 = min(tmax.x, min(tmax.y, tmax.z));
  return vec2(t0, t1);
}

float getDensity(vec3 p) {
  float mask = getMaskFactor(p);
  if (mask <= 0.0) return 0.0;
  float finalDensity;
  if (u_mask_visualize) {
    finalDensity = 1.0;
  } else {
    vec3 texCoord = (p + 0.5) * uTextureTiling + uTextureOffset;
    float d = texture(uVolumeTexture, texCoord).r;
    if (d < uDensityThreshold) return 0.0;
    finalDensity = d;
  }
  return finalDensity * uDensityMultiplier * mask;
}

float CalculateLightEnergy(vec3 samplePos, vec3 lightDir) {
  float stepLength = 1.0 / float(uLightSteps);
  float acc = 0.0;
  for (int i = 0; i < 256; i++) {
    if (i >= uLightSteps) break;
    vec3 p = samplePos + lightDir * (float(i) + 0.5) * stepLength;
    if (all(greaterThan(p, vec3(-0.5))) && all(lessThan(p, vec3(0.5)))) {
      acc += getDensity(p) * stepLength;
    }
  }
  return exp(-acc);
}

void main() {
  vec3 dir = normalize(vDirection);
  vec2 bounds = hitBox(vOrigin, dir);
  if (bounds.x >= bounds.y) discard;
  bounds.x = max(bounds.x, 0.0);

  // No depth occlusion pass here; set to a very large distance
  float sceneLinearDistance = 1e20;

  float rayLength = bounds.y - bounds.x;
  if (rayLength < 0.001) discard;

  float stepSize = rayLength / float(uMaxSteps);
  float jitter = texture(uBlueNoise, mod(gl_FragCoord.xy, uBlueNoiseSize) / uBlueNoiseSize).r;
  vec3 p = vOrigin + (bounds.x + jitter * stepSize) * dir;

  vec3 accumulatedColor = vec3(0.0);
  vec3 transmittance = vec3(1.0);
  float mu = dot(dir, uLightDir);
  float fade_zone = stepSize * 2.0;

  for (int i = 0; i < 1024; i++) {
    if (i >= uMaxSteps) break;
    // optional safety using view space distance (requires modelViewMatrix built-in)
    float dist_traveled = (float(i) * stepSize) + (jitter * stepSize);
    float dist_remaining = rayLength - dist_traveled;
    if (dist_remaining < 0.0) break;

    float density = getDensity(p);
    if (density > 0.01) {
      float lightEnergy = CalculateLightEnergy(p, uLightDir);
      vec3 sunL = uSunColor * uSunIntensity * lightEnergy;
      float phase = PhaseFunction(0.3, mu);
      vec3 sunScatter = sunL * phase;
      vec3 ambScatter = uAmbientColor * uAmbientIntensity;
      vec3 total = (sunScatter + ambScatter) * density * stepSize;
      float fade_a = smoothstep(0.0, fade_zone, dist_remaining);
      total *= fade_a;
      vec3 stepT = exp(-density * stepSize * EXTINCTION_MULT * uOpacity);
      accumulatedColor += transmittance * total;
      transmittance *= stepT;
      if (length(transmittance) < 0.01) break;
    }
    p += dir * stepSize;
  }

  color = vec4(accumulatedColor, 1.0 - transmittance.r);
}

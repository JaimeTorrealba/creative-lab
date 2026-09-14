#include './sky.glsl';

uniform sampler2D uDetail;
uniform vec4 uOctave[4];
uniform vec3 uEyeLocal;
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uWireColor;
uniform float uMaxElevation;
uniform float uDetailStrength;
uniform float uFresnelPower;
uniform float uSpecularPower;
uniform float uSpecularIntensity;
uniform float uTilt;
uniform vec2 uFadeDetail;
uniform vec2 uFadeHorizon;
uniform int uDebugMode;

in vec3 vLocalPos;
in vec3 vGeoNormal;
in float vDist;
in float vHeight;
in float vRing;

out vec4 fragColor;

// blue where the grid is sparse, red where it is dense
vec3 rampColor(float t) {
  return clamp(vec3(2.0 * t - 1.0, 1.0 - abs(2.0 * t - 1.0), 1.0 - 2.0 * t), 0.0, 1.0);
}

void main() {
  if (uDebugMode == 4) {
    fragColor = vec4(uWireColor, 1.0);
    return;
  }

  // uEyeLocal, never the built-in cameraPosition: that one is in world space, and mixing it with
  // these eye-local positions would be wrong by however far the grid has been re-centred.
  vec3 v = normalize(uEyeLocal - vLocalPos);

  // 18.3 again: the two finest octaves never touch the geometry. No fract() on the uv here,
  // unlike the vertex shader — dFdx across the wrap seam would select the coarsest mip and draw
  // a visible line along it.
  float detailFade = 1.0 - smoothstep(uFadeDetail.x, uFadeDetail.y, vDist);
  vec2 slope = vec2(0.0);
  for (int i = 2; i < 4; i++) {
    vec4 o = uOctave[i];
    vec2 g = texture(uDetail, vLocalPos.xz * o.z + o.xy).rg * 2.0 - 1.0;
    slope += g * (o.w * o.z * uDetailStrength * detailFade);
  }

  vec3 n = normalize(vGeoNormal + vec3(-slope.x, 0.0, -slope.y));

  // 18.5: at grazing angles a perturbed normal tips past the eye, NdotV goes negative and the
  // Fresnel term inverts into black speckle along the horizon. Tilt the normal back toward the
  // viewer as the view flattens, then guarantee what is left still faces it — the correction is
  // exact because dot(n + k * v, v) = dot(n, v) + k.
  float grazing = clamp(abs(v.y) / 0.25, 0.0, 1.0);
  n = normalize(mix(vec3(0.0, 1.0, 0.0), n, mix(1.0, grazing, uTilt)));
  float ndv = dot(n, v);
  if (ndv < 0.05) {
    n = normalize(n + (0.05 - ndv) * v);
    ndv = dot(n, v);
  }

  if (uDebugMode == 1) {
    fragColor = vec4(n * 0.5 + 0.5, 1.0);
    return;
  }
  if (uDebugMode == 2) {
    fragColor = vec4(vec3(clamp(vHeight / uMaxElevation * 0.5 + 0.5, 0.0, 1.0)), 1.0);
    return;
  }
  if (uDebugMode == 3) {
    // pixels per ring, from the screen-space derivative of the interpolated ring index. This is
    // the LOD the r = a0 + a1 i^n law actually delivers, and the only direct way to see where it
    // over- and under-tessellates for a given eye height.
    fragColor = vec4(rampColor(clamp(1.0 / max(fwidth(vRing), 1e-6) / 40.0, 0.0, 1.0)), 1.0);
    return;
  }

  vec3 body = mix(uDeepColor, uShallowColor, smoothstep(-1.0, 1.0, vHeight / uMaxElevation));

  float fresnel = mix(0.02, 1.0, pow(1.0 - ndv, uFresnelPower));
  vec3 color = mix(body, skyColor(reflect(-v, n)), fresnel);

  vec3 h = normalize(uSunDir + v);
  color += uSunColor * pow(max(dot(n, h), 0.0), uSpecularPower) * uSpecularIntensity * fresnel;

  // Blend to the sky along the same bearing, flattened to the horizon, so the sun glow and the
  // azimuthal gradient carry straight through the join. Without this the water simply stops and
  // the outermost ring is a hard colour step against the dome.
  vec3 horizonDir = normalize(vec3(-v.x, 0.0, -v.z));
  color = mix(color, skyColor(horizonDir), smoothstep(uFadeHorizon.x, uFadeHorizon.y, vDist));

  fragColor = vec4(color, 1.0);

  #if defined( TONE_MAPPING )
    fragColor.rgb = toneMapping(fragColor.rgb);
  #endif
  fragColor = linearToOutputTexel(fragColor);
}

// Strand shading, GPU Gems 2 ch. 23 §23.3 and §23.4.
//
// Two shading models behind uShadingModel so they can be compared directly:
//   0 - Scheuermann: Kajiya-Kay diffuse plus two shifted specular lobes. The usual real-time
//       stand-in for Marschner, and cheap.
//   1 - Marschner via the chapter's M and N lookup textures, S = S_R + S_TT + S_TRT.
//
// Self-shadowing is the chapter's opacity shadow map: 16 density slices accumulated in light
// space, read back here as exp(-k * density).

uniform vec3 uRootColor;
uniform vec3 uTipColor;
uniform float uColorVariation;
uniform float uOpacity;
uniform float uRoundness;

uniform int uShadingModel;
uniform float uShine;
uniform vec3 uSpecColor1;
uniform vec3 uSpecColor2;
uniform float uPrimaryShift;
uniform float uSecondaryShift;
uniform float uPrimaryExp;
uniform float uSecondaryExp;
uniform float uDiffuseWrap;
uniform float uRootShadow;
uniform float uAmbient;

uniform sampler2D uLutM;
uniform sampler2D uLutN;
uniform vec3 uAbsorption;

uniform mat4 uLightMatrix;
uniform sampler2D uSlice0;
uniform sampler2D uSlice1;
uniform sampler2D uSlice2;
uniform sampler2D uSlice3;
uniform float uShadowStrength;
uniform float uShadowEnabled;

uniform vec3 uLightPos;
uniform vec3 uLightColor;
uniform float uLightIntensity;

uniform vec3 uWaterColor;
uniform float uWaterDensity;
uniform float uCausticIntensity;
uniform float uCausticScale;
uniform float uCausticSpeed;
uniform float uTime;

varying float vT;
varying float vSide;
varying vec3 vTangent;
varying vec3 vSideVec;
varying vec3 vFaceNormal;
varying vec3 vWorldPos;
varying vec3 vRandom;

vec3 shiftTangent(vec3 T, vec3 N, float shift) {
  return normalize(T + shift * N);
}

float strandSpecular(vec3 T, vec3 V, vec3 L, float exponent) {
  vec3 H = normalize(L + V);
  float dotTH = dot(T, H);
  float sinTH = sqrt(max(0.0, 1.0 - dotTH * dotTH));
  float dirAtten = smoothstep(-1.0, 0.0, dotTH);
  return dirAtten * pow(sinTH, exponent);
}

// Cheap crossed-wave caustics - enough to read as light bands crawling over the hair.
float caustics(vec3 p, float t) {
  vec2 q = p.xz * uCausticScale + p.y * 0.35;
  float v = 0.0;
  float a = 1.0;

  for (int i = 0; i < 3; i++) {
    v += a * sin(q.x + t) * sin(q.y - t * 1.3);
    q = q * 1.9 + vec2(1.7, -2.3);
    a *= 0.6;
  }

  return pow(clamp(v * 0.5 + 0.5, 0.0, 1.0), 3.0);
}

// Opacity shadow map lookup. Four RGBA attachments unpack to the chapter's 16 slices; the
// density between the two bracketing slices is linearly interpolated, exactly as §23.4's
// sigma_interp = w_i * sigma_i + w_{i+1} * sigma_{i+1}.
float opacityShadow() {
  if (uShadowEnabled < 0.5) return mix(uRootShadow, 1.0, vT);

  vec4 lightPos = uLightMatrix * vec4(vWorldPos, 1.0);
  vec3 ndc = lightPos.xyz / lightPos.w;
  vec2 uv = ndc.xy * 0.5 + 0.5;

  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 1.0;

  vec4 a = texture(uSlice0, uv);
  vec4 b = texture(uSlice1, uv);
  vec4 c = texture(uSlice2, uv);
  vec4 d = texture(uSlice3, uv);

  float s[16];
  s[0] = a.r; s[1] = a.g; s[2] = a.b; s[3] = a.a;
  s[4] = b.r; s[5] = b.g; s[6] = b.b; s[7] = b.a;
  s[8] = c.r; s[9] = c.g; s[10] = c.b; s[11] = c.a;
  s[12] = d.r; s[13] = d.g; s[14] = d.b; s[15] = d.a;

  float depth = clamp(ndc.z * 0.5 + 0.5, 0.0, 1.0) * 16.0;
  float x = clamp(depth - 1.0, 0.0, 15.0);
  int i0 = int(floor(x));
  int i1 = min(i0 + 1, 15);
  float density = mix(s[i0], s[i1], x - float(i0));

  return exp(-uShadowStrength * density);
}

void main() {
  vec3 T = normalize(vTangent);
  // A flat ribbon shaded as a cylinder: vSide sweeps -1 to +1 across the strand, so rolling
  // the normal by that much gives the round falloff a single quad would otherwise lack.
  float roll = vSide * uRoundness;
  vec3 N = normalize(vFaceNormal * cos(roll) + normalize(vSideVec) * sin(roll));
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 L = normalize(uLightPos - vWorldPos);

  float jitter = mix(1.0 - uColorVariation, 1.0 + uColorVariation, vRandom.y);
  vec3 base = mix(uRootColor, uTipColor, vT) * jitter;

  // Kajiya-Kay: a cylinder has no single normal, so diffuse falls off with sin(T, L).
  float dotTL = dot(T, L);
  float sinTL = sqrt(max(0.0, 1.0 - dotTL * dotTL));
  float wrapped = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
  float diffuse = mix(uDiffuseWrap, 1.0, mix(sinTL, wrapped, 0.5));

  vec3 spec;

  if (uShadingModel == 1) {
    // ---- Marschner, through the chapter's two lookup textures ----
    float sinThetaI = clamp(dot(L, T), -1.0, 1.0);
    float sinThetaO = clamp(dot(V, T), -1.0, 1.0);
    float thetaI = asin(sinThetaI);
    float thetaO = asin(sinThetaO);
    float thetaD = (thetaO - thetaI) * 0.5;

    // Azimuthal difference from the components of L and V perpendicular to the fibre axis.
    vec3 lPerp = L - T * sinThetaI;
    vec3 vPerp = V - T * sinThetaO;
    float cosPhiD = clamp(dot(normalize(lPerp), normalize(vPerp)), -1.0, 1.0);

    vec3 M = texture(uLutM, vec2(sinThetaI * 0.5 + 0.5, sinThetaO * 0.5 + 0.5)).rgb;
    vec3 Nl = texture(uLutN, vec2(cosPhiD * 0.5 + 0.5, cos(thetaD) * 0.5 + 0.5)).rgb;

    // Wavelength-dependent absorption is applied here rather than baked, so one LUT serves all
    // three channels. Path length through the fibre grows as the light bends further around it.
    float phi = acos(cosPhiD);
    float path = 2.0 * cos(phi * 0.5) / max(cos(thetaD), 0.1);
    vec3 absorb = exp(-uAbsorption * path);

    vec3 sR = vec3(M.r * Nl.r) * uSpecColor1;
    vec3 sTT = M.g * Nl.g * absorb * base;
    vec3 sTRT = M.b * Nl.b * absorb * uSpecColor2;
    spec = (sR + sTT + sTRT) * uShine;
  } else {
    // ---- Scheuermann: two shifted lobes standing in for R and TRT ----
    float shiftNoise = (vRandom.y - 0.5) * 0.25;
    vec3 T1 = shiftTangent(T, N, uPrimaryShift + shiftNoise);
    vec3 T2 = shiftTangent(T, N, uSecondaryShift + shiftNoise);

    spec = uSpecColor1 * strandSpecular(T1, V, L, uPrimaryExp);
    spec += uSpecColor2 * strandSpecular(T2, V, L, uSecondaryExp) * (0.4 + 0.6 * vRandom.y);
    spec *= uShine;
  }

  float selfShadow = opacityShadow();
  float caustic = 1.0 + uCausticIntensity * caustics(vWorldPos, uTime * uCausticSpeed);

  vec3 light = uLightColor * uLightIntensity * caustic;
  vec3 color = base * uAmbient + light * (base * diffuse + spec) * selfShadow;

  // Beer-Lambert extinction through the water between the strand and the camera.
  float transmittance = exp(-length(cameraPosition - vWorldPos) * uWaterDensity);
  color = mix(uWaterColor, color, transmittance);

  gl_FragColor = vec4(color, uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

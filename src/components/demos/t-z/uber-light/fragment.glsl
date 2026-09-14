varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;

uniform sampler2D uMap;
uniform float uUseMap;
uniform vec3 uBaseColor;

uniform mat4 uWorldToLight;
uniform vec3 uLightPos;
uniform vec3 uLightColor;
uniform float uIntensity;

uniform float uCutOn;
uniform float uCutOff;
uniform float uNearEdge;
uniform float uFarEdge;

uniform float uWidth;
uniform float uHeight;
uniform float uWidthEdge;
uniform float uHeightEdge;
uniform float uRoundness;

uniform float uAmbient;
uniform float uDiffuse;
uniform float uSpecular;
uniform float uRoughness;

uniform float uCookie;
uniform float uCookieScale;

float distanceShape(float z) {
  return smoothstep(uCutOn - uNearEdge, uCutOn, z) *
         (1.0 - smoothstep(uCutOff, uCutOff + uFarEdge, z));
}

// p = light-space xy projected onto the z = 1 reference plane
float clipSuperellipse(vec2 p, float a, float b, float A, float B, float roundness) {
  float x = max(abs(p.x), 1e-6);
  float y = max(abs(p.y), 1e-6);
  if (roundness < 1e-2) {
    // pure barn doors: rectangle with independently feathered edges
    return (1.0 - smoothstep(a, A, x)) * (1.0 - smoothstep(b, B, y));
  }
  float re = 2.0 / roundness;
  float q = pow(pow(x / a, re) + pow(y / b, re), -1.0 / re);
  float r = pow(pow(x / A, re) + pow(y / B, re), -1.0 / re);
  return 1.0 - smoothstep(q, r, 1.0);
}

float cookiePattern(vec2 p) {
  vec2 g = sin(p * uCookieScale * 3.14159265);
  return smoothstep(-0.2, 0.6, g.x * g.y);
}

void main() {
  vec3 albedo = mix(uBaseColor, texture2D(uMap, vUv).rgb, uUseMap);
  vec3 lp = (uWorldToLight * vec4(vWorldPos, 1.0)).xyz;

  float atten = 0.0;
  // the light rig aims down its local +Z (Object3D.lookAt convention)
  if (lp.z > 0.0) {
    vec2 proj = lp.xy / lp.z;
    atten = distanceShape(lp.z) *
            clipSuperellipse(proj, uWidth, uHeight, uWidth + uWidthEdge, uHeight + uHeightEdge, uRoundness);
    atten *= mix(1.0, cookiePattern(proj), uCookie);
  }

  vec3 N = normalize(vWorldNormal);
  vec3 L = normalize(uLightPos - vWorldPos);
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 H = normalize(L + V);
  float ndl = max(dot(N, L), 0.0);
  float shininess = 2.0 / (uRoughness * uRoughness) - 2.0;
  float spec = ndl > 0.0 ? pow(max(dot(N, H), 0.0), shininess) : 0.0;

  vec3 light = uLightColor * uIntensity * atten;
  vec3 color = albedo * uAmbient + light * (albedo * uDiffuse * ndl + uSpecular * spec);
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

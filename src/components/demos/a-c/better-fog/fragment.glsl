uniform sampler2D uColorMap;
uniform sampler2D uNormalMap;
uniform sampler2D uAoMap;
uniform int uMode;
uniform float uFogDensity;
uniform vec3 uFogColor;
uniform vec3 uSunColor;
uniform float uSunPower;
uniform float uHeightFogA;
uniform float uHeightFogB;
uniform vec3 uBetaExt;
uniform vec3 uBetaIns;
uniform vec3 uSunDir;

varying vec2 vUv;
varying vec3 vWorldPos;

// https://iquilezles.org/articles/fog/
vec3 applyFog(vec3 col, float t, vec3 ro, vec3 rd) {
  float sunAmount = max(dot(rd, uSunDir), 0.0);
  vec3 sunFogColor = mix(uFogColor, uSunColor, pow(sunAmount, uSunPower));

  if (uMode == 0) {
    float fogAmount = 1.0 - exp(-t * uFogDensity);
    return mix(col, uFogColor, fogAmount);
  }
  if (uMode == 1) {
    float fogAmount = 1.0 - exp(-t * uFogDensity);
    return mix(col, sunFogColor, fogAmount);
  }
  if (uMode == 2) {
    vec3 extColor = exp(-t * uBetaExt);
    vec3 insColor = exp(-t * uBetaIns);
    return col * extColor + uFogColor * (1.0 - insColor);
  }
  // analytic integral of density a * exp(-b * y) along the view ray
  float rdY = (rd.y >= 0.0 ? 1.0 : -1.0) * max(abs(rd.y), 1e-4);
  float fogAmount = (uHeightFogA / uHeightFogB) * exp(-ro.y * uHeightFogB) *
    (1.0 - exp(-t * rdY * uHeightFogB)) / rdY;
  return mix(col, sunFogColor, clamp(fogAmount, 0.0, 1.0));
}

void main() {
  vec3 baseColor = texture2D(uColorMap, vUv).rgb;
  float ao = texture2D(uAoMap, vUv).r;
  vec3 tangentNormal = normalize(texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0);
  // plane lies flat (rotated -90deg on x): tangent space maps to world as (x, z, -y)
  vec3 worldNormal = normalize(vec3(tangentNormal.x, tangentNormal.z, -tangentNormal.y));

  float diffuse = max(dot(worldNormal, uSunDir), 0.0);
  vec3 col = baseColor * ao * (0.35 + 0.75 * diffuse * uSunColor);

  vec3 rd = normalize(vWorldPos - cameraPosition);
  float t = distance(vWorldPos, cameraPosition);
  col = applyFog(col, t, cameraPosition, rd);

  gl_FragColor = vec4(col, 1.0);
}

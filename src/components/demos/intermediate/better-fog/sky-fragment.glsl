uniform int uMode;
uniform vec3 uFogColor;
uniform vec3 uSunColor;
uniform float uSunPower;
uniform float uHeightFogA;
uniform float uHeightFogB;
uniform vec3 uSunDir;

varying vec3 vWorldPos;

void main() {
  vec3 rd = normalize(vWorldPos - cameraPosition);
  float sunAmount = max(dot(rd, uSunDir), 0.0);
  vec3 sunFogColor = mix(uFogColor, uSunColor, pow(sunAmount, uSunPower));

  // an infinitely distant "pixel" is fully fogged in modes 0-2
  if (uMode == 0 || uMode == 2) {
    gl_FragColor = vec4(uFogColor, 1.0);
    return;
  }
  if (uMode == 1) {
    gl_FragColor = vec4(sunFogColor, 1.0);
    return;
  }

  // height fog integrated to infinity: thick at the horizon, thin at the zenith
  vec3 skyColor = mix(vec3(0.30, 0.45, 0.70), uSunColor, pow(sunAmount, uSunPower));
  float rdY = max(rd.y, 1e-4);
  float fogAmount =
    (uHeightFogA / uHeightFogB) * exp(-cameraPosition.y * uHeightFogB) / rdY;
  gl_FragColor = vec4(mix(skyColor, sunFogColor, clamp(fogAmount, 0.0, 1.0)), 1.0);
}

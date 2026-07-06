uniform vec3 uTroughColor;
uniform vec3 uCrestColor;
uniform vec3 uSkyColor;
uniform vec3 uSunDirection;
uniform float uSpecularPower;
uniform float uFresnelPower;
uniform float uMaxElevation;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vElevation;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);

  float height = smoothstep(-uMaxElevation, uMaxElevation, vElevation);
  vec3 color = mix(uTroughColor, uCrestColor, height);

  float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), uFresnelPower);
  color = mix(color, uSkyColor, fresnel);

  vec3 sunDir = normalize(uSunDirection);
  vec3 halfway = normalize(sunDir + viewDir);
  float specular = pow(max(dot(normal, halfway), 0.0), uSpecularPower);
  color += specular;

  gl_FragColor = vec4(color, 1.0);
}

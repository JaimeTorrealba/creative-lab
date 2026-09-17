uniform vec3 uTroughColor;
uniform vec3 uCrestColor;
uniform vec3 uSkyColor;
uniform vec3 uSunDirection;
uniform float uSpecularPower;
uniform float uFresnelPower;
uniform float uMaxElevation;
uniform vec3 uAbsorption;
uniform float uTurbidity;
uniform float uFloorY;

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

  // Beer-Lambert along the view ray down to the receiver. The floor is opaque and drawn first,
  // so whatever survives the column is what shows through the surface.
  float travel = max(vWorldPosition.y - uFloorY, 0.0) / max(viewDir.y, 0.15);
  vec3 transmittance = exp(-uAbsorption * uTurbidity * travel);
  float alpha = 1.0 - dot(transmittance, vec3(0.3333));

  // grazing angles reflect rather than transmit, and the highlight is added rather than mixed,
  // so it has to raise alpha too or a clear shallow pool multiplies it away
  alpha = clamp(mix(alpha, 1.0, fresnel) + specular, 0.0, 1.0);

  gl_FragColor = vec4(color, alpha);
}

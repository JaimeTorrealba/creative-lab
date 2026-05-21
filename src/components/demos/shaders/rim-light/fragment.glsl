uniform vec3 rimColor;
uniform float rimPower;
uniform float rimIntensity;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Calculate rim light using Fresnel effect
  float rim = 1.0 - max(0.0, dot(normal, viewDir));
  rim = pow(rim, rimPower) * rimIntensity;

  // Base color with rim light
  vec3 finalColor = vec3(0.1, 0.1, 0.15) + rimColor * rim;

  gl_FragColor = vec4(finalColor, 1.0);
}
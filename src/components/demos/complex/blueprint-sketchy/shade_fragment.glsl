uniform vec3 uBaseColor;
uniform vec3 uLightDirection;
uniform float uBands;
uniform float uGraphite;

varying vec3 vViewNormal;

// The shade map of GPU Gems 2, 15.3: surface colour rendered to its own texture so
// the sketchy pass can slide it around independently of the ink. The chapter asks
// for "striking colour patches", so the lambert term is quantised into a handful of
// flat bands instead of being left smooth.
void main() {
  vec3 normal = normalize(vViewNormal);
  if (!gl_FrontFacing) normal = -normal;

  // The light lives in view space, so the patches stay put while the model turns.
  float lambert = max(dot(normal, normalize(uLightDirection)), 0.0);
  float banded = clamp(floor(lambert * uBands) / max(uBands - 1.0, 1.0), 0.0, 1.0);

  vec3 patches = uBaseColor * mix(0.42, 1.0, banded);
  vec3 graphite = vec3(mix(0.34, 0.9, banded));

  gl_FragColor = vec4(mix(patches, graphite, uGraphite), 1.0);
}

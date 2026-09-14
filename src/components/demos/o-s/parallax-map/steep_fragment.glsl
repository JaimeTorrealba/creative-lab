uniform sampler2D uDiffuseMap;
uniform sampler2D uNormalMap;
uniform sampler2D uHeightMap;
uniform float uHeightScale;
uniform vec3 uViewPos;

varying vec2 vUv;
varying vec3 vViewDir;
varying vec3 vTanLightVec;

// Steep parallax mapping (layered height traversal) kept minimal.
vec2 parallaxSteep(vec2 uv, vec3 viewDir) {
  // viewDir is tangent space, so its xy is a uv offset and its z is N dot V.
  vec3 V = normalize(viewDir);
  float ndotv = max(V.z, 0.0);
  float numLayers = mix(8.0, 32.0, 1.0 - ndotv); // more layers at grazing angles

  float layerDepth = 1.0 / numLayers;
  float currentLayerDepth = 0.0;
  vec2 P = V.xy * uHeightScale;          // total parallax shift
  vec2 deltaUV = P / numLayers;          // per-layer UV shift

  vec2  currentUV = uv;
  float currentHeight = texture2D(uHeightMap, currentUV).r;
  float prevHeight = currentHeight;
  vec2  prevUV = currentUV;

  // Advance until we pass the height
  while(currentLayerDepth < currentHeight && currentLayerDepth < 1.0) {
    prevUV = currentUV;
    prevHeight = currentHeight;
    currentUV -= deltaUV;
    currentHeight = texture2D(uHeightMap, currentUV).r;
    currentLayerDepth += layerDepth;
  }

  // Simple linear refinement between last two steps
  float afterDepth = currentHeight - currentLayerDepth;      // signed distances
  float beforeDepth = prevHeight - (currentLayerDepth - layerDepth);
  float weight = beforeDepth / (beforeDepth - afterDepth + 1e-5);
  currentUV = mix(currentUV, prevUV, clamp(weight, 0.0, 1.0));

  return currentUV;
}

void main() {
  vec3 viewDir = normalize(vViewDir);
  vec2 uvParallax = parallaxSteep(vUv, viewDir);

    // sample textures
    vec3 albedo = texture2D(uDiffuseMap, uvParallax).rgb;
  vec3 normalTex = texture2D(uNormalMap, uvParallax).rgb * 2.0 - 1.0; // [0,1] -> [-1,1]
  normalTex = normalize(normalTex);

  // Tangent-space diffuse against the scene light
  float diffuse = max(dot(normalTex, normalize(vTanLightVec)), 0.0);
  vec3 color = albedo * (0.2 + 0.8 * diffuse); // add a tiny ambient so it isn't all black

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
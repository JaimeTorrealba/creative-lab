uniform sampler2D uDiffuseMap;
uniform sampler2D uNormalMap;
uniform sampler2D uHeightMap;
uniform float uHeightScale;
uniform vec3 uViewPos;

varying vec2 vUv;
varying vec3 vViewDir;
varying vec3 vNormal;
  // varying tangent/bitangent ...

  // functions to compute parallax offset:
vec2 parallaxOffset(vec2 uv, vec3 viewDir) {
    float height = texture2D(uHeightMap, uv).r;
    // adjust height by scale & view angle
    float offset = (height * uHeightScale) * (1.0 - dot(normalize(vNormal), viewDir));
    // or more complicated: steep parallax or occlusion with layers
    return uv - viewDir.xy * offset;
}

void main() {
    vec3 viewDir = normalize(vViewDir);
    vec2 uvParallax = parallaxOffset(vUv, viewDir);

    // sample textures
    vec3 albedo = texture2D(uDiffuseMap, uvParallax).rgb;
  vec3 normalTex = texture2D(uNormalMap, uvParallax).rgb * 2.0 - 1.0; // [0,1] -> [-1,1]
  normalTex = normalize(normalTex);

  // Simplest possible diffuse using interpolated normal as a crude "light" reference
  float diffuse = max(dot(normalTex, normalize(vNormal)), 0.0);
  vec3 color = albedo * (0.2 + 0.8 * diffuse); // add a tiny ambient so it isn't all black

  gl_FragColor = vec4(color, 1.0);
}
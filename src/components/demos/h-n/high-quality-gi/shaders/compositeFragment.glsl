// Final image (38.5.3): direct light from the shadow map plus the indirect light gathered through
// the ray bundles. Until enough bundles have landed after a reset, the first-pass solution fills
// in so orbiting the camera does not drop to a black, half-converged frame. The tone-mapped result
// is blended into the antialiasing history; the sRGB encode happens when it is presented.
uniform sampler2D uPositions;
uniform sampler2D uNormals;
uniform sampler2D uAlbedo;
uniform sampler2D uFirstPass;
uniform sampler2D uGather;
uniform sampler2D uDebugLayer;
uniform vec2 uResolution;
uniform float uGatherMix;
uniform float uExposure;
uniform int uView;
uniform sampler2D uPreviousColor;
uniform float uColorWeight;

varying vec2 vUv;

vec3 toneMapAces(vec3 color) {
  return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);
}

vec3 showLayer() {
  float side = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * (uResolution - side)) / side;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec3(0.0);
  vec4 layer = texture2D(uDebugLayer, uv);
  return layer.a == 0.0 ? vec3(0.02, 0.0, 0.03) : layer.rgb * 3.0;
}

vec3 shadeSurface(vec4 position, vec4 normal) {
  vec3 albedo = texture2D(uAlbedo, vUv).rgb;
  if (normal.w > 0.5) return uLightColor * uLightPower * 0.5;

  vec3 direct = getDirectIrradiance(position.xyz, normal.xyz);
  vec3 firstPass = texture2D(uFirstPass, vUv).rgb;
  vec3 gathered = resolveIrradiance(texture2D(uGather, vUv));
  vec3 indirect = mix(firstPass, gathered, uGatherMix);

  if (uView == 1) indirect = firstPass;
  if (uView == 2) indirect = vec3(0.0);
  if (uView == 3) direct = vec3(0.0);
  if (uView == 4) return gathered;

  return albedo / 3.14159265 * (direct + indirect);
}

void main() {
  vec3 color = vec3(0.0);

  if (uView == 5) {
    color = showLayer();
  } else {
    vec4 position = texture2D(uPositions, vUv);
    if (position.w > 0.5) color = shadeSurface(position, texture2D(uNormals, vUv));
  }

  vec3 mapped = toneMapAces(color * uExposure);
  vec3 previous = texture2D(uPreviousColor, vUv).rgb;
  gl_FragColor = vec4(mix(previous, mapped, uColorWeight), 1.0);
}

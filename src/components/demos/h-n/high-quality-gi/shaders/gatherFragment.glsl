// Steps 5 of 38.4 for one point set (camera pixels or mesh vertices): project every point into the
// current bundle and keep the layer if it lies in front of the point along the ray. Layers arrive
// near-to-far from the bundle camera, i.e. from the far end of the ray back toward the point, so
// the last layer that still passes the test is the nearest hit.
uniform sampler2D uPositions;
uniform sampler2D uNormals;
uniform sampler2D uLayer;
uniform mat4 uBundleViewProjection;
uniform vec3 uCameraPosition;
uniform vec3 uRayDirection;
uniform float uLayerSize;
uniform float uTexelWorld;
uniform float uNormalBias;
uniform float uSlopeBias;

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  vec4 position = texelFetch(uPositions, texel, 0);
  if (position.w < 0.5) discard;

  vec3 normal = normalize(texelFetch(uNormals, texel, 0).xyz);
  float cosine = dot(normal, uRayDirection);
  if (cosine <= 0.0) discard;

  vec3 origin = position.xyz + normal * uNormalBias;
  vec4 clip = uBundleViewProjection * vec4(origin, 1.0);
  vec2 uv = clip.xy * 0.5 + 0.5;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) discard;

  vec4 layer = texelFetch(uLayer, ivec2(uv * uLayerSize), 0);
  if (layer.a == 0.0) discard;

  // The layer is a rasterised surface, so the point's own face shows up with a depth error of up
  // to one texel times the slope, exactly like shadow-map acne. The margin grows with that slope.
  float slope = sqrt(max(1.0 - cosine * cosine, 0.0)) / max(cosine, 0.08);
  float depth = dot(uCameraPosition - origin, uRayDirection);
  if (layer.a >= depth - uSlopeBias * uTexelWorld * slope) discard;

  gl_FragColor = vec4(layer.rgb, 1.0);
}

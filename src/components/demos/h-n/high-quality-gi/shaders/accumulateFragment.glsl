// Step 9: fold the nearest hit of this bundle into the running sum. Rays that left the box
// without a hit pick up the environment, which is how the chapter samples image-based light in
// the same pass.
uniform sampler2D uPositions;
uniform sampler2D uNormals;
uniform sampler2D uHits;
uniform vec3 uRayDirection;
uniform vec3 uEnvironment;

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  if (texelFetch(uPositions, texel, 0).w < 0.5) discard;

  float cosine = dot(normalize(texelFetch(uNormals, texel, 0).xyz), uRayDirection);
  if (cosine <= 0.0) discard;

  vec4 hit = texelFetch(uHits, texel, 0);
  vec3 radiance = hit.a > 0.5 ? hit.rgb : uEnvironment;
  gl_FragColor = vec4(radiance * cosine, cosine);
}

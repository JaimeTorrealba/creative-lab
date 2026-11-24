// Pass 1: total outflow of each leaf, and the factor that keeps it within the liquid it holds.
// Output: r = height, g = outflow scale, b = wetness.
uniform sampler2D uState;

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  vec4 state = texelFetch(uState, texel, 0);
  vec3 normal = leafNormal(texel);
  float outflow = 0.0;
  for (int k = 0; k < NEIGHBOUR_COUNT; k++) {
    int neighbour = neighbourIndex(texel, k);
    if (neighbour < 0) continue;
    float neighbourHeight = texelFetch(uState, leafTexel(neighbour), 0).r;
    outflow += transferAmount(state.r, normal, neighbourOffset(k), neighbourHeight);
  }
  float available = max(state.r - uStick, 0.0);
  float scale = outflow > available ? available / outflow : 1.0;
  gl_FragColor = vec4(state.r, scale, state.g, 0.0);
}

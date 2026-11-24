// Pass 2: exchange liquid with the 26 neighbours. Each transfer is computed from the giving
// leaf's side with that leaf's scale, so what one leaf loses another gains (mass is conserved
// apart from sources, drips and absorption). Output: r = height, g = wetness.
#define MAX_SOURCES 8

uniform sampler2D uOutflow;
uniform vec4 uSources[MAX_SOURCES];
uniform int uSourceCount;
uniform float uSourceRadius;
uniform float uDrip;
uniform float uDripThreshold;
uniform float uAbsorb;
uniform float uWetDecay;
uniform float uStepTime;

float sourceAmount(vec3 position) {
  float amount = 0.0;
  for (int i = 0; i < MAX_SOURCES; i++) {
    if (i >= uSourceCount) break;
    float sourceDistance = length(position - uSources[i].xyz);
    amount += uSources[i].w * (1.0 - smoothstep(uSourceRadius * 0.4, uSourceRadius, sourceDistance));
  }
  return amount;
}

float exchange(ivec2 texel, vec4 self, vec3 normal) {
  float given = 0.0;
  float received = 0.0;
  for (int k = 0; k < NEIGHBOUR_COUNT; k++) {
    int neighbour = neighbourIndex(texel, k);
    if (neighbour < 0) continue;
    ivec2 neighbourTexel = leafTexel(neighbour);
    vec4 other = texelFetch(uOutflow, neighbourTexel, 0);
    vec3 offset = neighbourOffset(k);
    given += transferAmount(self.r, normal, offset, other.r);
    received += other.g * transferAmount(other.r, leafNormal(neighbourTexel), -offset, self.r);
  }
  return received - self.g * given;
}

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  vec4 leafPosition = texelFetch(uLeafTable, ivec3(texel, POSITION_LAYER), 0);
  if (leafPosition.w < 0.5) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec4 self = texelFetch(uOutflow, texel, 0);
  vec3 normal = leafNormal(texel);

  float height = self.r + exchange(texel, self, normal) + sourceAmount(leafPosition.xyz);
  float facingDown = max(dot(normal, uGravity), 0.0);
  height -= uDrip * facingDown * max(height - uDripThreshold, 0.0);
  height = max(height - uAbsorb * uStepTime, 0.0);

  float wetness = max(self.b * (1.0 - uWetDecay * uStepTime), smoothstep(0.0, 0.04, height));
  gl_FragColor = vec4(height, wetness, 0.0, 1.0);
}

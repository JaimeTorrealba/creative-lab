// Direct light from the ceiling panel, shared by every pass that needs radiance: the depth layers
// (so a bundle hit knows how bright it is) and the final composite. The panel is a Lambertian
// emitter facing down; its shadow comes from a single wide perspective shadow map.

uniform sampler2D uShadowMap;
uniform mat4 uLightViewProjection;
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightPower;
uniform float uShadowSoftness;
uniform float uShadowBias;
uniform float uShadowNormalOffset;
uniform float uShadowMapSize;
uniform float uShadowTexelAngle;
uniform mat4 uLightInverseViewProjection;

const vec2 POISSON[12] = vec2[](
  vec2(-0.326, -0.406), vec2(-0.840, -0.074), vec2(-0.696, 0.457), vec2(-0.203, 0.621),
  vec2(0.962, -0.195), vec2(0.473, -0.480), vec2(0.519, 0.767), vec2(0.185, -0.893),
  vec2(0.507, 0.064), vec2(0.896, 0.412), vec2(-0.322, -0.933), vec2(-0.792, -0.598)
);

// Receiver-plane depth: where the ray through the centre of a shadow texel meets the plane of the
// shaded surface. The shadow pass rasterised exactly that ray, so on a flat receiver the stored
// distance matches this value to float precision however grazing the light is and however far
// the PCF tap sits from the shaded point. Comparing against the point's own distance instead is
// what striped the tall box: at ~80 degrees one tap off spans several times any constant bias.
float getReceiverDistance(vec2 uv, vec3 planePoint, vec3 normal, float fallback) {
  vec2 texelCenter = (floor(uv * uShadowMapSize) + 0.5) / uShadowMapSize;
  vec4 farPoint = uLightInverseViewProjection * vec4(texelCenter * 2.0 - 1.0, 1.0, 1.0);
  vec3 rayDirection = normalize(farPoint.xyz / farPoint.w - uLightPosition);
  float facing = dot(rayDirection, normal);
  if (facing > -0.02) return fallback;
  return dot(planePoint - uLightPosition, normal) / facing;
}

// The normal offset, measured in shadow texels at the point's distance, covers what the plane
// cannot: curved receivers like the sphere, whose surface leaves the tangent plane within a tap.
float sampleLightVisibility(vec3 worldPosition, vec3 normal) {
  float footprint = length(worldPosition - uLightPosition) * uShadowTexelAngle;
  vec3 receiver = worldPosition + normal * uShadowNormalOffset * footprint;
  float distanceToLight = length(receiver - uLightPosition);

  vec4 clip = uLightViewProjection * vec4(receiver, 1.0);
  if (clip.w <= 0.0) return 0.0;
  vec2 uv = clip.xy / clip.w * 0.5 + 0.5;

  float lit = 0.0;
  for (int i = 0; i < 12; i++) {
    vec2 tapUv = uv + POISSON[i] * uShadowSoftness;
    if (any(lessThan(tapUv, vec2(0.0))) || any(greaterThan(tapUv, vec2(1.0)))) {
      lit += 1.0;
      continue;
    }
    float stored = texture(uShadowMap, tapUv).r;
    float expected = getReceiverDistance(tapUv, receiver, normal, distanceToLight);
    lit += (stored == 0.0 || expected - uShadowBias < stored) ? 1.0 : 0.0;
  }
  return lit / 12.0;
}

vec3 getDirectIrradiance(vec3 worldPosition, vec3 normal) {
  vec3 toLight = uLightPosition - worldPosition;
  float distanceSquared = max(dot(toLight, toLight), 0.01);
  float distanceToLight = sqrt(distanceSquared);
  vec3 lightDirection = toLight / distanceToLight;

  float cosSurface = max(dot(normal, lightDirection), 0.0);
  float cosEmitter = max(lightDirection.y, 0.0);
  if (cosSurface * cosEmitter <= 0.0) return vec3(0.0);

  float visibility = sampleLightVisibility(worldPosition, normal);
  return uLightColor * uLightPower * cosSurface * cosEmitter * visibility / distanceSquared;
}

// Accumulators hold (sum L cos, sum cos) over the bundle directions. With directions spread
// uniformly over the sphere, pi * sum(L cos) / sum(cos) is the cosine-weighted hemisphere
// estimate of irradiance, and dividing by the measured cosine sum instead of N/4 cancels the
// uneven coverage of a short QMC prefix.
vec3 resolveIrradiance(vec4 accumulated) {
  return accumulated.a > 1e-4 ? 3.14159265 * accumulated.rgb / accumulated.a : vec3(0.0);
}

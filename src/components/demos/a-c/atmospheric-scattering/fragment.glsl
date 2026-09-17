// sun plus up to two moons. Every extra light re-runs the inner light march, so this is the
// knob that decides the shader's cost.
#define MAX_LIGHTS 3

uniform vec3 uLightDir[MAX_LIGHTS];
uniform vec3 uLightColor[MAX_LIGHTS];
uniform int uLightCount;
uniform vec3 uRayleighCoeff;
uniform float uMieCoeff;
uniform float uMieG;
uniform float uPlanetRadius;
uniform float uAtmosphereRadius;
uniform float uRayleighScaleHeight;
uniform float uMieScaleHeight;
uniform float uExposure;

varying vec3 vWorldPos;

const int PRIMARY_STEPS = 24;
const int LIGHT_STEPS = 8;
const float PI = 3.141592653589793;

// how hard samples bunch toward the ray's lowest point. 1.0 would be uniform spacing;
// higher pulls the budget into the dense air near the surface
const float CLUSTER = 3.0;

// entry/exit distances for a ray against a sphere centred on the origin.
// assumes rd is normalised, so the quadratic's a term drops out.
// returns x > y when the ray misses entirely.
vec2 raySphere(vec3 ro, vec3 rd, float radius) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - radius * radius;
  float d = b * b - c;
  if (d < 0.0) return vec2(1.0, -1.0);
  d = sqrt(d);
  return vec2(-b - d, -b + d);
}

// single-scattering integral from GPU Gems 2 ch.16: march the view ray through the
// atmosphere shell, and at each sample march a second ray toward each light to gather the
// optical depth that attenuates it before it reaches that point.
vec3 scatter(vec3 ro, vec3 rd) {
  vec2 atmosphere = raySphere(ro, rd, uAtmosphereRadius);
  if (atmosphere.x > atmosphere.y) return vec3(0.0);

  float near = max(atmosphere.x, 0.0);
  float far = atmosphere.y;

  // the planet is opaque, so stop the march where the solid body begins
  vec2 planet = raySphere(ro, rd, uPlanetRadius);
  if (planet.x <= planet.y && planet.x > 0.0) far = min(far, planet.x);
  if (far <= near) return vec3(0.0);

  // both densities fall off exponentially with altitude, so nearly all of the integral
  // lives around the ray's closest approach to the planet. spreading samples uniformly
  // across a limb chord thousands of km long steps clean over the Mie haze, whose scale
  // height is only a couple of km — so warp the samples down toward that point instead.
  float closest = clamp(-dot(ro, rd), near, far);
  float below = closest - near;
  float above = far - closest;

  float g = uMieG;
  float gSq = g * g;

  // the phases depend only on the view ray and a light direction, both fixed for this fragment,
  // so they are hoisted out of the march entirely — what the primary loop pays per extra light
  // is the shadow test and the eight-step light march, not this.
  float phaseR[MAX_LIGHTS];
  float phaseM[MAX_LIGHTS];
  vec3 totalR[MAX_LIGHTS];
  vec3 totalM[MAX_LIGHTS];

  for (int l = 0; l < MAX_LIGHTS; l++) {
    float mu = dot(rd, uLightDir[l]);
    float muSq = mu * mu;
    phaseR[l] = 3.0 / (16.0 * PI) * (1.0 + muSq);
    phaseM[l] = 3.0 / (8.0 * PI) * ((1.0 - gSq) * (muSq + 1.0)) /
      (pow(1.0 + gSq - 2.0 * mu * g, 1.5) * (2.0 + gSq));
    totalR[l] = vec3(0.0);
    totalM[l] = vec3(0.0);
  }

  // the view-ray optical depth is shared by every light, which is the whole reason a second
  // and third source are affordable here
  float viewOdR = 0.0;
  float viewOdM = 0.0;

  for (int i = 0; i < PRIMARY_STEPS; i++) {
    // v sweeps [-1, 1] across the chord; raising it to CLUSTER packs samples near v = 0,
    // and the matching derivative keeps each sample's segment length consistent
    float v = 2.0 * (float(i) + 0.5) / float(PRIMARY_STEPS) - 1.0;
    float av = abs(v);
    float side = v < 0.0 ? below : above;
    float t = closest + sign(v) * pow(av, CLUSTER) * side;
    float segment = CLUSTER * pow(av, CLUSTER - 1.0) * side * 2.0 / float(PRIMARY_STEPS);

    vec3 samplePos = ro + rd * t;
    float height = length(samplePos) - uPlanetRadius;

    float odR = exp(-height / uRayleighScaleHeight) * segment;
    float odM = exp(-height / uMieScaleHeight) * segment;
    viewOdR += odR;
    viewOdM += odM;

    for (int l = 0; l < MAX_LIGHTS; l++) {
      if (l < uLightCount) {
        vec3 lightDir = uLightDir[l];

        // samples behind the planet relative to this light get none of it at all, which is what
        // carves the terminator into the rim — and gives each moon its own
        vec2 shadow = raySphere(samplePos, lightDir, uPlanetRadius);
        if (shadow.x > shadow.y || shadow.y <= 0.0) {
          float lightFar = raySphere(samplePos, lightDir, uAtmosphereRadius).y;
          float lightSegment = lightFar / float(LIGHT_STEPS);
          float lightOdR = 0.0;
          float lightOdM = 0.0;
          float lt = 0.0;

          for (int j = 0; j < LIGHT_STEPS; j++) {
            vec3 lightPos = samplePos + lightDir * (lt + lightSegment * 0.5);
            float lightHeight = length(lightPos) - uPlanetRadius;
            lightOdR += exp(-lightHeight / uRayleighScaleHeight) * lightSegment;
            lightOdM += exp(-lightHeight / uMieScaleHeight) * lightSegment;
            lt += lightSegment;
          }

          // Mie extinction runs slightly higher than its scattering coefficient
          vec3 tau = uRayleighCoeff * (viewOdR + lightOdR) + uMieCoeff * 1.1 * (viewOdM + lightOdM);
          vec3 attenuation = exp(-tau);

          totalR[l] += odR * attenuation;
          totalM[l] += odM * attenuation;
        }
      }
    }
  }

  vec3 color = vec3(0.0);
  for (int l = 0; l < MAX_LIGHTS; l++) {
    if (l < uLightCount) {
      color += uLightColor[l] *
        (phaseR[l] * uRayleighCoeff * totalR[l] + phaseM[l] * uMieCoeff * totalM[l]);
    }
  }

  return color;
}

void main() {
  // the scene is modelled with the planet at unit radius, so scale into the metre-based
  // space the physical coefficients and scale heights are expressed in
  vec3 rd = normalize(vWorldPos - cameraPosition);
  vec3 ro = cameraPosition * uPlanetRadius;

  vec3 color = scatter(ro, rd);
  color = 1.0 - exp(-uExposure * color);

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}

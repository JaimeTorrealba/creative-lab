uniform int uView;
uniform float uBumpStrength;
uniform vec3 uLightDirection;
uniform sampler2D uBakedMap;

varying vec3 vObjectPosition;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

#define VIEW_SHADED 0
#define VIEW_HEIGHT 1
#define VIEW_BAKED 2

// Bump from the screen-space derivatives of the liquid height (Mikkelsen 2010).
vec3 perturbNormal(vec3 position, vec3 normal, float height) {
  vec3 sigmaX = dFdx(position);
  vec3 sigmaY = dFdy(position);
  vec3 r1 = cross(sigmaY, normal);
  vec3 r2 = cross(normal, sigmaX);
  float surfaceDeterminant = dot(sigmaX, r1);
  vec3 gradient = sign(surfaceDeterminant) * (dFdx(height) * r1 + dFdy(height) * r2);
  return normalize(abs(surfaceDeterminant) * normal - gradient);
}

vec3 heatColor(float value) {
  return clamp(vec3(value * 3.0 - 1.5, value * 3.0 - 0.5, value * 3.0 + 0.3) * vec3(1.0, 1.0, 0.8), 0.0, 1.0);
}

vec3 shade(vec3 albedo, vec3 normal, float gloss) {
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  vec3 halfVector = normalize(uLightDirection + viewDirection);
  float diffuse = max(dot(normal, uLightDirection), 0.0);
  float shininess = mix(12.0, 180.0, gloss);
  float specular = pow(max(dot(normal, halfVector), 0.0), shininess) * mix(0.03, 0.9, gloss);
  float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 5.0) * gloss * 0.5;
  float sky = 0.5 + 0.5 * normal.y;
  vec3 ambient = albedo * mix(vec3(0.1, 0.09, 0.1), vec3(0.3, 0.32, 0.38), sky);
  return ambient + albedo * diffuse * 0.9 + specular + fresnel * vec3(0.6, 0.7, 0.8);
}

vec3 shadeLive(SurfaceSample surface) {
  vec3 normal = perturbNormal(vWorldPosition, normalize(vWorldNormal), surface.liquid.x * uBumpStrength);
  float gloss = max(liquidCover(surface), surface.liquid.y * 0.35);
  return shade(surfaceAlbedo(vObjectPosition, surface), normal, gloss);
}

void main() {
  vec3 color;
  if (uView == VIEW_BAKED) {
    color = shade(srgbToLinear(texture2D(uBakedMap, vUv).rgb), normalize(vWorldNormal), 0.15);
  } else {
    SurfaceSample surface = sampleSurface(vObjectPosition);
    color = uView == VIEW_HEIGHT
      ? heatColor(clamp(surface.liquid.x / (uFilmThickness * 4.0), 0.0, 1.0))
      : shadeLive(surface);
  }
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}

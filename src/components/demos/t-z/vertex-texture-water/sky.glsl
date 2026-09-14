// Shared by the water and the dome, so the Fresnel reflection and the horizon fade resolve to
// exactly the background they are drawn against. Every sky uniform is declared here and only
// here — the two consumers include this file, and a second declaration is a compile error.
uniform vec3 uHorizonColor;
uniform vec3 uZenithColor;
uniform vec3 uSunColor;
uniform vec3 uSunDir;
uniform float uSunIntensity;

vec3 skyColor(vec3 dir) {
  vec3 d = normalize(dir);

  float h = smoothstep(-0.05, 0.55, d.y);
  vec3 col = mix(uHorizonColor, uZenithColor, h);

  // a tight lobe for the disc and a wide one for the surrounding haze; the tight one is what
  // the water picks up as glitter once the detail normals start scattering the reflected ray
  float s = max(dot(d, uSunDir), 0.0);
  col += uSunColor * (pow(s, 350.0) * uSunIntensity + pow(s, 6.0) * 0.3);

  return col;
}

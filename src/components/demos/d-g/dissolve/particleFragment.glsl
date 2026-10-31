uniform vec3 uGlowColor;
uniform float uGlowIntensity;

varying float vFade;

void main() {
  float falloff = 1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - 0.5));
  gl_FragColor = vec4(uGlowColor * uGlowIntensity * falloff * vFade, 1.0);
}

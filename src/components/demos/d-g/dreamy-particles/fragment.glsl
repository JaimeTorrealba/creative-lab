uniform sampler2D uVelocityTexture;
uniform vec3 uColor;
uniform float uMinAlpha;
uniform float uMaxAlpha;

varying vec2 vUv;

void main() {
  if (length(gl_PointCoord - 0.5) > 0.5) discard;

  vec3 velocity = texture2D(uVelocityTexture, vUv).xyz * 100.0;
  float alpha = clamp(length(velocity), uMinAlpha, uMaxAlpha);

  gl_FragColor = vec4(uColor, alpha);
}

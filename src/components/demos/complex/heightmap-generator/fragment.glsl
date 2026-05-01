uniform vec3 uLowColor;
uniform vec3 uMidColor;
uniform vec3 uHighColor;

varying float vHeight;

void main() {
  vec3 color = mix(uLowColor, uMidColor, smoothstep(0.0, 0.5, vHeight));
  color = mix(color, uHighColor, smoothstep(0.6, 1.0, vHeight));
  gl_FragColor = vec4(color, 1.0);
}

uniform vec3 uLightPosition;

varying vec3 vWorldPosition;

void main() {
  gl_FragColor = vec4(length(vWorldPosition - uLightPosition), 0.0, 0.0, 1.0);
}

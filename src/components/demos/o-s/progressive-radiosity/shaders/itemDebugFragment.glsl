uniform sampler2D uItemBuffer;

varying vec2 vUv;

vec3 colorFromId(float id) {
  return fract(sin(vec3(id) * vec3(12.9898, 78.233, 37.719)) * 43758.5453) * 0.75 + 0.25;
}

void main() {
  vec2 item = texture2D(uItemBuffer, vUv).rg;
  float shade = 1.0 - clamp(item.g / 4.0, 0.0, 1.0) * 0.6;
  vec3 color = item.r < 0.5 ? vec3(0.03) : colorFromId(item.r) * shade;
  gl_FragColor = vec4(color, 1.0);
}

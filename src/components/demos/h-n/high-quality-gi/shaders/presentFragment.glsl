uniform sampler2D uColor;

varying vec2 vUv;

vec3 linearToSrgb(vec3 color) {
  return mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(vec3(0.0031308), color)
  );
}

void main() {
  gl_FragColor = vec4(linearToSrgb(texture2D(uColor, vUv).rgb), 1.0);
}

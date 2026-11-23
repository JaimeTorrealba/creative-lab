uniform sampler2D uPage;
uniform vec2 uResolution;
uniform vec2 uHandle;
uniform float uHandleRadius;
uniform float uOneBit;
uniform float uTiltSlope;

varying vec2 vUv;

float getLuminance(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

float getRingMask(vec2 pixel) {
  float distanceToRing = abs(distance(pixel, uHandle) - uHandleRadius);
  return 1.0 - step(1.5, distanceToRing);
}

void main() {
  vec2 pixel = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec3 color = texture2D(uPage, vUv).rgb;
  color = mix(color, vec3(step(0.5, getLuminance(color))), uOneBit);

  float lineX = uHandle.x + (pixel.y - uHandle.y) * uTiltSlope;
  float isInverted = step(lineX, pixel.x);
  float flip = abs(isInverted - getRingMask(pixel));
  color = mix(color, 1.0 - color, flip);

  gl_FragColor = vec4(color, 1.0);
}

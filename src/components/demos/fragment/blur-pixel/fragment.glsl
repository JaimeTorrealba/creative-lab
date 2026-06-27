precision highp float;

uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform float uMouseEnter;
uniform vec2 uMouseOverPos;
uniform float uStrength;
uniform float uRadius;

in vec2 vUv;

#include '../../../shaders/SHARED/noise2D.glsl;

void main() {
  vec2 texCoords = vUv;

  float aspectRatio = uResolution.y / uResolution.x;

  float circle = 0.5 - distance(
    vec2(uMouseOverPos.x, (1.0 - uMouseOverPos.y) * aspectRatio),
    vec2(vUv.x, vUv.y * aspectRatio)
  ) * uRadius;

  float noise = snoise(gl_FragCoord.xy);

  texCoords.x += mix(0.0, circle * noise * uStrength, uMouseEnter + 0.1 * 0.1);
  texCoords.y += mix(0.0, circle * noise * uStrength, uMouseEnter + 0.1 * 0.1);

  vec3 texture = vec3(texture(uTexture, texCoords));

  gl_FragColor = vec4(texture, 1.0);
}
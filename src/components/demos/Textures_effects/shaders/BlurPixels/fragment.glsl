precision highp float;

uniform vec2 uResolution; // in pixel
uniform sampler2D uTexture; // texture
uniform float uMouseEnter; // 0 - 1 (enter) / 1 - 0 (leave)
uniform vec2 uMouseOverPos; // 0 (left) 0 (top) / 1 (right) 1 (bottom)

in vec2 vUv; // 0 (left) 0 (bottom) - 1 (right) 1 (top)

#include '../../../../shaders/SHARED/noise2D.glsl;

void main() {
  vec2 texCoords = vUv;

  // aspect ratio needed to create a real circle when quadSize is not 1:1 ratio
  float aspectRatio = uResolution.y / uResolution.x;

  // create a circle following the mouse with size 15
  float circle = 0.5 - distance(
    vec2(uMouseOverPos.x, (1.0 - uMouseOverPos.y) * aspectRatio),
    vec2(vUv.x, vUv.y * aspectRatio)
  ) * 25.0;

  // create noise
  float noise = snoise(gl_FragCoord.xy);

  // modify texture coordinates
  texCoords.x += mix(0.0, circle * noise * 0.01, uMouseEnter + 0.1 * 0.1);
  texCoords.y += mix(0.0, circle * noise * 0.01, uMouseEnter + 0.1 * 0.1);

  // texture
  vec3 texture = vec3(texture(uTexture, texCoords));

  // output
  gl_FragColor = vec4(texture, 1.0);
}
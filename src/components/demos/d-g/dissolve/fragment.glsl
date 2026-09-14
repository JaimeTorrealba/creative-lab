uniform sampler2D uTexture;
uniform float uAlphaThreshold;
uniform float uBorderSize;
uniform float uTextureScale;
varying vec2 vUv;

void main() {
  vec4 textureColor = texture2D(uTexture, vec2(vUv.x * uTextureScale, vUv.y * uTextureScale));
  float alpha = textureColor.r;
  float mask = step(uAlphaThreshold + uBorderSize, textureColor.x);
  if (alpha < uAlphaThreshold) alpha = 0.0;
  else alpha = 1.0;

  gl_FragColor = vec4(mix(vec3(.15, .15, 0.96), vec3(0.75), mask), alpha);
}

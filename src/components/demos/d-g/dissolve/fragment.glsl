uniform sampler2D uTexture;
uniform float uAlphaThreshold;
uniform float uBorderSize;
uniform float uTextureScale;
uniform vec3 uGlowColor;
uniform float uGlowIntensity;
varying vec2 vUv;

void main() {
  vec4 textureColor = texture2D(uTexture, vec2(vUv.x * uTextureScale, vUv.y * uTextureScale));
  float alpha = textureColor.r;
  float mask = step(uAlphaThreshold + uBorderSize, textureColor.x);
  // Discard instead of alpha 0 so dissolved holes don't write depth and hide the sparks behind
  if (alpha < uAlphaThreshold) discard;
  else alpha = 1.0;

  // Pushing the border past 1.0 is what lets the bloom pick it up and leave the body alone
  gl_FragColor = vec4(mix(uGlowColor * uGlowIntensity, vec3(0.75), mask), alpha);
}

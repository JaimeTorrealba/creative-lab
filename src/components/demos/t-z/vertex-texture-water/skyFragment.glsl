#include './sky.glsl';

in vec3 vViewDir;

out vec4 fragColor;

void main() {
  fragColor = vec4(skyColor(vViewDir), 1.0);

  // GLSL3 has no gl_FragColor, so the tonemapping_fragment and colorspace_fragment chunks cannot
  // be included. These are the same two calls they make, and the water shader ends with them too
  // — if only one of the pair had them the horizon join would be a visible brightness step.
  #if defined( TONE_MAPPING )
    fragColor.rgb = toneMapping(fragColor.rgb);
  #endif
  fragColor = linearToOutputTexel(fragColor);
}

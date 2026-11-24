varying vec3 vObjectPosition;

// sRGB bytes of the albedo at this texel; alpha 1 marks covered texels for the push-pull fill.
void main() {
  SurfaceSample surface = sampleSurface(vObjectPosition);
  gl_FragColor = vec4(linearToSrgb(surfaceAlbedo(vObjectPosition, surface)), 1.0);
}

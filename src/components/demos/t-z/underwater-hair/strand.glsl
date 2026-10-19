// Strand reconstruction shared by the camera pass and the opacity-shadow pass. If the two ever
// disagreed, the shadows would describe a different head of hair than the one on screen.
//
// Deliberately takes the sampler and size as parameters and declares no uniforms, attributes or
// varyings: the camera pass compiles in three's GLSL1-compat mode and the shadow pass needs
// GLSL3 for MRT, and those modes disagree about `attribute`/`varying`/`texture2D`. Plain
// `texture()` is valid in both, because three emits `#version 300 es` either way.

vec3 guideSample(sampler2D guides, vec2 guideSize, float guide, float segment) {
  float s = clamp(segment, 0.0, guideSize.x - 1.0);
  vec2 uv = vec2((s + 0.5) / guideSize.x, (guide + 0.5) / guideSize.y);
  return texture(guides, uv).xyz;
}

// Position and tangent come from the same four control points, so the derivative is free.
void sampleStrand(
  sampler2D guides,
  vec2 guideSize,
  float guide,
  float f,
  out vec3 p,
  out vec3 tangent
) {
  float i1 = floor(f);
  float t = f - i1;

  vec3 p0 = guideSample(guides, guideSize, guide, i1 - 1.0);
  vec3 p1 = guideSample(guides, guideSize, guide, i1);
  vec3 p2 = guideSample(guides, guideSize, guide, i1 + 1.0);
  vec3 p3 = guideSample(guides, guideSize, guide, i1 + 2.0);

  vec3 a = 2.0 * p1;
  vec3 b = p2 - p0;
  vec3 c = 2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3;
  vec3 d = -p0 + 3.0 * p1 - 3.0 * p2 + p3;

  p = 0.5 * (a + b * t + c * t * t + d * t * t * t);
  tangent = 0.5 * (b + 2.0 * c * t + 3.0 * d * t * t);
}

// Shared shaping so both passes agree on where a strand actually is.
vec3 strandShape(
  sampler2D guides,
  vec2 guideSize,
  vec3 iGuides,
  vec3 iBary,
  vec3 iCurlA,
  vec3 iCurlB,
  vec3 iRandom,
  float t,
  float clumping,
  float curlAmount,
  float curlFrequency,
  out vec3 tangent
) {
  float f = t * (guideSize.x - 1.0);

  vec3 pA, pB, pC, tA, tB, tC;
  sampleStrand(guides, guideSize, iGuides.x, f, pA, tA);
  sampleStrand(guides, guideSize, iGuides.y, f, pB, tB);
  sampleStrand(guides, guideSize, iGuides.z, f, pC, tC);

  // Y = A * bA + B * bB + C * bC
  vec3 pos = pA * iBary.x + pB * iBary.y + pC * iBary.z;
  tangent = tA * iBary.x + tB * iBary.y + tC * iBary.z;

  // Clumping pulls interpolated strands onto their triangle's first control hair toward the
  // tip, so the hair separates into locks instead of staying a uniform shell.
  pos = mix(pos, pA, clumping * t);

  float wave = t * curlFrequency * 6.2831853 + iRandom.z * 6.2831853;
  float amp = curlAmount * t * t * (0.5 + iRandom.x);
  pos += (iCurlA * cos(wave) + iCurlB * sin(wave)) * amp;

  return pos;
}

float strandWidthAt(float t, float tipTaper, float widthJitter) {
  float taper = 1.0 - tipTaper * t * t;
  float rootPinch = mix(0.35, 1.0, smoothstep(0.0, 0.07, t));
  return taper * rootPinch * (0.55 + widthJitter);
}

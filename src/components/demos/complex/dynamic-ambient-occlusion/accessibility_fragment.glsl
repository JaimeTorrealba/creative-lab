uniform sampler2D uPos;
uniform sampler2D uNrm;
uniform sampler2D uParentPos;
uniform sampler2D uParentNrm;
uniform sampler2D uParentAccess;
uniform sampler2D uPrevAccess;
uniform sampler2D uFirstAccess;
uniform int uElementSide;
uniform int uParentSide;
uniform int uClusterCount;
uniform int uHierarchy;
uniform int uUsePrev;
uniform int uMixFirst;
uniform float uBlend;
uniform float uKappa;

out vec4 fragColor;

// Equation 14-1. The first factor is the solid angle an oriented disk of this area subtends at this
// distance; the emitter cosine turns it away when it faces elsewhere, and the receiver cosine is the
// one the chapter multiplies by four before saturating, so a disk just above the horizon already
// occludes fully. Returned as xyz = the direction weighted by the shadow, w = the shadow itself.
vec4 shadowOf(vec3 receiverPos, vec3 receiverNrm, vec3 emitterPos, vec3 emitterNrm, float area, float access) {
  vec3 v = emitterPos - receiverPos;
  float d2 = max(dot(v, v), 1e-8);
  vec3 dir = v * inversesqrt(d2);

  float emitterCos = max(0.0, dot(emitterNrm, -dir));
  float receiverCos = clamp(4.0 * dot(receiverNrm, dir), 0.0, 1.0);
  float solidAngle = 1.0 - inversesqrt(area / d2 + 1.0);

  float shadow = solidAngle * emitterCos * receiverCos * access;
  return vec4(dir * shadow, shadow);
}

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  int receiver = texel.y * uElementSide + texel.x;

  vec4 receiverPos = texelFetch(uPos, texel, 0);
  vec4 receiverNrm = texelFetch(uNrm, texel, 0);

  // Padding slots belong to no object and are never rendered. A real vertex with zero area is not
  // padding, though, so the test is the object id rather than the area: it still receives shadow.
  if (receiverNrm.w < 0.0) {
    fragColor = vec4(1.0, vec3(0.0, 1.0, 0.0));
    return;
  }

  vec4 total = vec4(0.0);
  int home = receiver / CLUSTER_SIZE;

  for (int c = 0; c < uClusterCount; c++) {
    ivec2 parentTexel = ivec2(c % uParentSide, c / uParentSide);
    vec4 parentPos = texelFetch(uParentPos, parentTexel, 0);
    vec4 parentNrm = texelFetch(uParentNrm, parentTexel, 0);

    // 14.3.3: once the receiver is further off than kappa parent radii, one disk stands in for the
    // whole cluster. The cluster holding the receiver always descends, or it would shadow itself
    // with its own average.
    bool useParent =
      uHierarchy == 1 &&
      c != home &&
      distance(receiverPos.xyz, parentPos.xyz) > uKappa * parentNrm.w;

    if (useParent) {
      float access = uUsePrev == 1 ? texelFetch(uParentAccess, parentTexel, 0).r : 1.0;
      total += shadowOf(
        receiverPos.xyz,
        receiverNrm.xyz,
        parentPos.xyz,
        parentNrm.xyz,
        parentPos.w,
        access
      );
      continue;
    }

    int first = c * CLUSTER_SIZE;

    for (int i = 0; i < CLUSTER_SIZE; i++) {
      int emitter = first + i;
      if (emitter == receiver) continue;

      ivec2 emitterTexel = ivec2(emitter % uElementSide, emitter / uElementSide);
      vec4 emitterPos = texelFetch(uPos, emitterTexel, 0);
      vec4 emitterNrm = texelFetch(uNrm, emitterTexel, 0);
      float access = uUsePrev == 1 ? texelFetch(uPrevAccess, emitterTexel, 0).r : 1.0;

      total += shadowOf(
        receiverPos.xyz,
        receiverNrm.xyz,
        emitterPos.xyz,
        emitterNrm.xyz,
        emitterPos.w,
        access
      );
    }
  }

  float accessibility = clamp(1.0 - total.w, 0.0, 1.0);

  if (uMixFirst == 1) {
    // 14.3.1: a single pass double-shadows and comes out too dark, and the corrected pass comes out
    // too light wherever three surfaces meet, so the chapter averages the two.
    accessibility = mix(texelFetch(uFirstAccess, texel, 0).r, accessibility, uBlend);
  }

  // The bent normal is the element normal with every occluded direction pulled out of it.
  vec3 bent = receiverNrm.xyz - total.xyz;
  if (dot(bent, bent) < 1e-8) bent = receiverNrm.xyz;

  fragColor = vec4(accessibility, normalize(bent));
}

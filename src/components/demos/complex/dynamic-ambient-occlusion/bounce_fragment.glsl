uniform sampler2D uPos;
uniform sampler2D uNrm;
uniform sampler2D uParentPos;
uniform sampler2D uParentNrm;
uniform sampler2D uParentAccess;
uniform sampler2D uAccess;
uniform sampler2D uIndirect;
uniform vec3 uAlbedo[MAX_OBJECTS];
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform int uElementSide;
uniform int uParentSide;
uniform int uClusterCount;
uniform int uHierarchy;
uniform int uUseIndirect;
uniform float uKappa;

out vec4 fragColor;

// Equation 14-2, the disk-to-disk form factor. Same geometry as the shadow term, but this one keeps
// the emitter area in the numerator so it carries power rather than coverage.
float formFactor(vec3 receiverPos, vec3 receiverNrm, vec3 emitterPos, vec3 emitterNrm, float area) {
  vec3 v = emitterPos - receiverPos;
  float d2 = max(dot(v, v), 1e-8);
  vec3 dir = v * inversesqrt(d2);

  return area * max(0.0, dot(emitterNrm, -dir)) * max(0.0, dot(receiverNrm, dir)) / (d2 + area);
}

vec3 radianceOf(ivec2 emitterTexel, vec4 emitterNrm, float access) {
  vec3 albedo = uAlbedo[int(emitterNrm.w + 0.5)];
  vec3 emitted = albedo * uLightColor * max(0.0, dot(emitterNrm.xyz, uLightDirection)) * access;

  // A second bounce is the result of the first one, re-emitted through the same albedo.
  if (uUseIndirect == 1) {
    emitted += albedo * texelFetch(uIndirect, emitterTexel, 0).rgb;
  }

  return emitted;
}

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  int receiver = texel.y * uElementSide + texel.x;

  vec4 receiverPos = texelFetch(uPos, texel, 0);
  vec4 receiverNrm = texelFetch(uNrm, texel, 0);

  if (receiverNrm.w < 0.0) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec3 indirect = vec3(0.0);
  int home = receiver / CLUSTER_SIZE;

  for (int c = 0; c < uClusterCount; c++) {
    ivec2 parentTexel = ivec2(c % uParentSide, c / uParentSide);
    vec4 parentPos = texelFetch(uParentPos, parentTexel, 0);
    vec4 parentNrm = texelFetch(uParentNrm, parentTexel, 0);

    bool useParent =
      uHierarchy == 1 &&
      c != home &&
      distance(receiverPos.xyz, parentPos.xyz) > uKappa * parentNrm.w;

    if (useParent) {
      // The reduce pass already averaged the radiance of this cluster into gba.
      vec3 radiance = texelFetch(uParentAccess, parentTexel, 0).gba;
      indirect +=
        radiance *
        formFactor(
          receiverPos.xyz,
          receiverNrm.xyz,
          parentPos.xyz,
          parentNrm.xyz,
          parentPos.w
        );
      continue;
    }

    int first = c * CLUSTER_SIZE;

    for (int i = 0; i < CLUSTER_SIZE; i++) {
      int emitter = first + i;
      if (emitter == receiver) continue;

      ivec2 emitterTexel = ivec2(emitter % uElementSide, emitter / uElementSide);
      vec4 emitterPos = texelFetch(uPos, emitterTexel, 0);
      if (emitterPos.w <= 0.0) continue;

      vec4 emitterNrm = texelFetch(uNrm, emitterTexel, 0);
      float access = texelFetch(uAccess, emitterTexel, 0).r;

      indirect +=
        radianceOf(emitterTexel, emitterNrm, access) *
        formFactor(
          receiverPos.xyz,
          receiverNrm.xyz,
          emitterPos.xyz,
          emitterNrm.xyz,
          emitterPos.w
        );
    }
  }

  fragColor = vec4(indirect, 1.0);
}

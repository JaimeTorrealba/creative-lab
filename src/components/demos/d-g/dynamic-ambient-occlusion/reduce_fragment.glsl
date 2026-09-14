uniform sampler2D uPos;
uniform sampler2D uNrm;
uniform sampler2D uAccess;
uniform sampler2D uIndirect;
uniform vec3 uAlbedo[MAX_OBJECTS];
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform int uElementSide;
uniform int uParentSide;
uniform int uClusterCount;
uniform int uUseIndirect;

out vec4 fragColor;

// Whatever a parent disk stands in for, it has to stand in for on both sides of the solve: as an
// occluder it needs the accessibility of its children, and as an emitter it needs their radiance.
// Both are area-weighted means, so a parent emits exactly the power its children do.
void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  int cluster = texel.y * uParentSide + texel.x;

  if (cluster >= uClusterCount) {
    fragColor = vec4(1.0, 0.0, 0.0, 0.0);
    return;
  }

  float area = 0.0;
  float access = 0.0;
  vec3 radiance = vec3(0.0);
  int first = cluster * CLUSTER_SIZE;

  for (int i = 0; i < CLUSTER_SIZE; i++) {
    int element = first + i;
    ivec2 elementTexel = ivec2(element % uElementSide, element / uElementSide);

    vec4 elementPos = texelFetch(uPos, elementTexel, 0);
    if (elementPos.w <= 0.0) continue;

    vec4 elementNrm = texelFetch(uNrm, elementTexel, 0);
    float elementAccess = texelFetch(uAccess, elementTexel, 0).r;
    vec3 albedo = uAlbedo[int(elementNrm.w + 0.5)];

    vec3 emitted =
      albedo * uLightColor * max(0.0, dot(elementNrm.xyz, uLightDirection)) * elementAccess;

    if (uUseIndirect == 1) {
      emitted += albedo * texelFetch(uIndirect, elementTexel, 0).rgb;
    }

    area += elementPos.w;
    access += elementAccess * elementPos.w;
    radiance += emitted * elementPos.w;
  }

  if (area <= 0.0) {
    fragColor = vec4(1.0, 0.0, 0.0, 0.0);
    return;
  }

  fragColor = vec4(access / area, radiance / area);
}

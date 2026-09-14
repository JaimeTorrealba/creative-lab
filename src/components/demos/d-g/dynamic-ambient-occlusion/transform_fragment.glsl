uniform sampler2D uBasePos;
uniform sampler2D uBaseNrm;
uniform sampler2D uParentBasePos;
uniform sampler2D uParentBaseNrm;
uniform mat4 uMatrices[MAX_OBJECTS];
uniform int uElementSide;
uniform int uParentSide;
uniform int uClusterCount;
uniform int uMode;
uniform int uOutput;

out vec4 fragColor;

// Elements live in object space and every object moves as a rigid body, so a disk only ever needs its
// matrix applied. Area survives rotation and translation untouched, which is why nothing here has to
// go back to the CPU between frames.
void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);

  if (uMode == 0) {
    vec4 basePos = texelFetch(uBasePos, texel, 0);
    vec4 baseNrm = texelFetch(uBaseNrm, texel, 0);

    // A negative object id marks a padding slot, which belongs to no object and has no matrix.
    if (baseNrm.w < 0.0) {
      fragColor = vec4(0.0, 0.0, 0.0, uOutput == 0 ? 0.0 : -1.0);
      return;
    }

    mat4 model = uMatrices[int(baseNrm.w + 0.5)];

    if (uOutput == 0) {
      fragColor = vec4((model * vec4(basePos.xyz, 1.0)).xyz, basePos.w);
    } else {
      fragColor = vec4(normalize(mat3(model) * baseNrm.xyz), baseNrm.w);
    }
    return;
  }

  int cluster = texel.y * uParentSide + texel.x;

  if (cluster >= uClusterCount) {
    fragColor = vec4(0.0);
    return;
  }

  vec4 basePos = texelFetch(uParentBasePos, texel, 0);
  vec4 baseNrm = texelFetch(uParentBaseNrm, texel, 0);

  // Clusters are contiguous runs that never straddle two objects, so a parent takes its object id
  // from its first child. That leaves the fourth parent channel free for the cluster radius.
  int first = cluster * CLUSTER_SIZE;
  ivec2 childTexel = ivec2(first % uElementSide, first / uElementSide);
  mat4 model = uMatrices[int(texelFetch(uBaseNrm, childTexel, 0).w + 0.5)];

  if (uOutput == 0) {
    fragColor = vec4((model * vec4(basePos.xyz, 1.0)).xyz, basePos.w);
  } else {
    fragColor = vec4(normalize(mat3(model) * baseNrm.xyz), baseNrm.w);
  }
}

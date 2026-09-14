in vec3 vNormal;
in vec3 vBentNormal;
in vec3 vIndirect;
in float vAccess;

uniform vec3 uAlbedo;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uSkyColor;
uniform vec3 uGroundColor;
uniform float uAmbient;
uniform float uAOStrength;
uniform float uIndirectStrength;
uniform int uDebug;

out vec4 fragColor;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 bent = normalize(vBentNormal);

  float ao = clamp(mix(1.0, vAccess, uAOStrength), 0.0, 1.0);
  vec3 indirect = vIndirect * uIndirectStrength;

  if (uDebug == 1) {
    fragColor = vec4(vec3(ao), 1.0);
    return;
  }

  if (uDebug == 2) {
    fragColor = vec4(bent * 0.5 + 0.5, 1.0);
    return;
  }

  if (uDebug == 3) {
    fragColor = vec4(pow(max(indirect, 0.0), vec3(1.0 / 2.2)), 1.0);
    return;
  }

  // 14.4: the environment is always sampled along the bent normal, so a surface deep in a crevice
  // looks up the sky in the one direction still open to it rather than straight out of the wall.
  vec3 sky = mix(uGroundColor, uSkyColor, bent.y * 0.5 + 0.5);

  vec3 direct = uLightColor * max(0.0, dot(normal, uLightDirection));
  vec3 color = uAlbedo * (direct + sky * uAmbient * ao + indirect);

  fragColor = vec4(pow(max(color, 0.0), vec3(1.0 / 2.2)), 1.0);
}

// Light-space pass for the opacity shadow map. GLSL3 because the fragment stage needs MRT.
uniform sampler2D uGuides;
uniform vec2 uGuideSize;
uniform float uWidth;
uniform float uTipTaper;
uniform float uCurlAmount;
uniform float uCurlFrequency;
uniform float uClumping;
uniform vec3 uLightDir;

in float aT;
in float aSide;
in vec3 iGuides;
in vec3 iBary;
in vec3 iRandom;
in vec3 iCurlA;
in vec3 iCurlB;

out float vDepth01;

#include "./strand.glsl"

void main() {
  float t = aT;
  vec3 tangent;
  vec3 pos = strandShape(
    uGuides, uGuideSize, iGuides, iBary, iCurlA, iCurlB, iRandom,
    t, uClumping, uCurlAmount, uCurlFrequency, tangent
  );

  vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  vec3 Tw = normalize(mat3(modelMatrix) * normalize(tangent));

  // Expand the ribbon against the light's view, not the camera's, so the density this pass
  // accumulates matches the silhouette the light actually sees.
  vec3 sideRaw = cross(Tw, uLightDir);
  float sideLen = length(sideRaw);
  vec3 side = sideLen > 1e-3 ? sideRaw / sideLen : normalize(cross(uLightDir, iCurlA));
  worldPos += side * aSide * uWidth * strandWidthAt(t, uTipTaper, iRandom.x);

  gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);

  // Orthographic light camera, so NDC z is linear in depth and both passes can agree on the
  // slice coordinate without passing near/far around.
  vDepth01 = clamp(gl_Position.z / gl_Position.w * 0.5 + 0.5, 0.0, 1.0);
}

// Interpolation + tessellation, GPU Gems 2 ch. 23 §23.2.
// The solver only ever touches the control hairs; every rendered strand is reconstructed here
// from three of them, then smoothed with a Catmull-Rom spline (the paper uses Bezier, going
// from 7 to 36 vertices — same idea, one interpolation scheme over).
//
// The reconstruction itself lives in strand.glsl, shared with the opacity-shadow pass.

uniform sampler2D uGuides;
uniform vec2 uGuideSize;
uniform float uWidth;
uniform float uTipTaper;
uniform float uCurlAmount;
uniform float uCurlFrequency;
uniform float uClumping;

attribute float aT;
attribute float aSide;
attribute vec3 iGuides;
attribute vec3 iBary;
attribute vec3 iRandom;
attribute vec3 iCurlA;
attribute vec3 iCurlB;

varying float vT;
varying float vSide;
varying vec3 vTangent;
varying vec3 vSideVec;
varying vec3 vFaceNormal;
varying vec3 vWorldPos;
varying vec3 vRandom;

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
  vec3 V = normalize(cameraPosition - worldPos);

  // cross(T, V) collapses for strands pointing at the camera, leaving the ribbon orientation
  // numerically random and flickering frame to frame. iCurlA is unit, strand-constant and
  // CPU-baked, so it is a stable fallback.
  vec3 sideRaw = cross(Tw, V);
  float sideLen = length(sideRaw);
  vec3 side = sideLen > 1e-3 ? sideRaw / sideLen : normalize(cross(V, iCurlA));

  // aSide is 0 for the line primitive, which makes this a no-op and lets one shader serve both.
  worldPos += side * aSide * uWidth * strandWidthAt(t, uTipTaper, iRandom.x);

  vT = t;
  vSide = aSide;
  vTangent = Tw;
  vSideVec = side;
  vFaceNormal = normalize(cross(side, Tw));
  vWorldPos = worldPos;
  vRandom = iRandom;

  gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
}

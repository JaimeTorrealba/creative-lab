varying vec3 vViewDir;
varying vec2 vUv;

uniform float uInteriorRowCount;
uniform float uInteriorColCount;
uniform float uInteriorDepth;
uniform float uShadowIntensity;

uniform vec3 uBackWallColor;
uniform sampler2D uBackWallTexture;
uniform int uBackWallHasTexture;
uniform int uBackWallTextureEnabled;

uniform vec3 uLeftWallColor;
uniform sampler2D uLeftWallTexture;
uniform int uLeftWallHasTexture;
uniform int uLeftWallTextureEnabled;

uniform vec3 uRightWallColor;
uniform sampler2D uRightWallTexture;
uniform int uRightWallHasTexture;
uniform int uRightWallTextureEnabled;

uniform vec3 uCeilWallColor;
uniform sampler2D uCeilWallTexture;
uniform int uCeilWallHasTexture;
uniform int uCeilWallTextureEnabled;

uniform vec3 uFloorWallColor;
uniform sampler2D uFloorWallTexture;
uniform int uFloorWallHasTexture;
uniform int uFloorWallTextureEnabled;

uniform sampler2D uFrontWallTexture;
uniform int uFrontWallHasTexture;
uniform int uFrontWallTextureEnabled;

void main() {
  vec3 dir = normalize(vViewDir);

  vec2 numRooms = vec2(uInteriorRowCount, uInteriorColCount);
  vec2 roomUv = fract(vUv * numRooms);

  vec3 fpos = vec3(roomUv, uInteriorDepth);
  vec3 roomMin = vec3(0.0, 0.0, 0.0);
  vec3 roomMax = vec3(1.0, 1.0, uInteriorDepth);

  vec3 tMin = (roomMin - fpos) / dir;
  vec3 tMax = (roomMax - fpos) / dir;
  vec3 tFar = max(tMin, tMax);

  float distanceToWall = min(min(tFar.x, tFar.y), tFar.z);
  vec3 roomHitPos = fpos + dir * distanceToWall;

  float eps = 0.0001;
  vec4 finalColor = vec4(0.0, 0.0, 0.0, 1.0);

  if (abs(roomHitPos.x - 0.0) < eps) {
    if (uLeftWallHasTexture == 0 || uLeftWallTextureEnabled == 0) {
      finalColor.rgb = uLeftWallColor;
    } else {
      vec2 uvCoords = vec2(roomHitPos.z / uInteriorDepth, roomHitPos.y);
      finalColor.rgb = texture2D(uLeftWallTexture, uvCoords).rgb;
    }
  } else if (abs(roomHitPos.x - 1.0) < eps) {
    if (uRightWallHasTexture == 0 || uRightWallTextureEnabled == 0) {
      finalColor.rgb = uRightWallColor;
    } else {
      vec2 uvCoords = vec2(roomHitPos.z / uInteriorDepth, roomHitPos.y);
      finalColor.rgb = texture2D(uRightWallTexture, uvCoords).rgb;
    }
  } else if (abs(roomHitPos.y - 0.0) < eps) {
    if (uFloorWallHasTexture == 0 || uFloorWallTextureEnabled == 0) {
      finalColor.rgb = uFloorWallColor;
    } else {
      vec2 uvCoords = vec2(roomHitPos.x, roomHitPos.z / uInteriorDepth);
      finalColor.rgb = texture2D(uFloorWallTexture, uvCoords).rgb;
    }
  } else if (abs(roomHitPos.y - 1.0) < eps) {
    if (uCeilWallHasTexture == 0 || uCeilWallTextureEnabled == 0) {
      finalColor.rgb = uCeilWallColor;
    } else {
      vec2 uvCoords = vec2(roomHitPos.x, roomHitPos.z / uInteriorDepth);
      finalColor.rgb = texture2D(uCeilWallTexture, uvCoords).rgb;
    }
  } else if (abs(roomHitPos.z - 0.0) < eps) {
    if (uBackWallHasTexture == 0 || uBackWallTextureEnabled == 0) {
      finalColor.rgb = uBackWallColor;
    } else {
      vec2 uvCoords = vec2(roomHitPos.x, roomHitPos.y);
      finalColor.rgb = texture2D(uBackWallTexture, uvCoords).rgb;
    }
  } else {
    discard;
    return;
  }

  if (!(uFrontWallHasTexture == 0 || uFrontWallTextureEnabled == 0)) {
    vec4 frontColor = texture2D(uFrontWallTexture, vUv);
    if (frontColor.a > 0.1) {
      finalColor.rgb = frontColor.rgb;
    }
  }

  float shadow = mix(uShadowIntensity, 1.0, roomHitPos.z / uInteriorDepth);
  finalColor.rgb *= shadow;

  gl_FragColor = finalColor;
}

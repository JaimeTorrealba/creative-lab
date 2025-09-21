precision mediump float;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;
uniform vec2 uHover;
uniform vec2 uResolution;

#define PI 3.1415926535897932384626433832795
#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST 0.001

float GetDistance(vec3 p) {
  vec4 s = vec4(0.0, 1.0, 6.0, 1);
  float sphereDist = length(p - s.xyz) - s.w;
  float planeDist = p.y;
  return min(sphereDist, planeDist);
}

vec3 GetNormal(vec3 surfacePos) {
  float d = GetDistance(surfacePos);
  vec2 e = vec2(0.01, 0.0);
  vec3 normal = d - vec3(
    GetDistance(surfacePos - e.xyy),
    GetDistance(surfacePos - e.yxy),
    GetDistance(surfacePos - e.yyx)
  );
  return normalize(normal);
}



float RayMarching(vec3 ro, vec3 rd) {
  float directionOrigin = 0.0;
  for(int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * directionOrigin;
    float distance = GetDistance(p);
    directionOrigin += distance;
    if(directionOrigin > MAX_DIST || distance < SURF_DIST)
      break;

  }
  return directionOrigin;
}

float GetLight(vec3 surfacePos) {
  vec3 lightPos = vec3(0.0, 5.0, 6.0);
  lightPos.xz += vec2(cos(uTime), sin(uTime)) * 2.0;
  vec3 lightDir = normalize(lightPos - surfacePos);
  vec3 normal = GetNormal(surfacePos);
  float diffuse = clamp(dot(normal, lightDir), 0., 1.);

  float d = RayMarching(surfacePos+normal * SURF_DIST * 2., lightDir);
  if(d < length(lightPos - surfacePos))
    diffuse *= 0.1;

  return diffuse;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

  vec3 col = vec3(0.0);

  vec3 rayOrigin = vec3(0.0, 1.0, 0.0);
  vec3 rayDirection = normalize(vec3(uv, 1.0));
  float d = RayMarching(rayOrigin, rayDirection);
  vec3 surfacePos = rayOrigin + rayDirection * d;
  d /= 6.0;
  float diffuse = GetLight(surfacePos);
  col = vec3(diffuse);

  gl_FragColor = vec4(col, 1.0);
}
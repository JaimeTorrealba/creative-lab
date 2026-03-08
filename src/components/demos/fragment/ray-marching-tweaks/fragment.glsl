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

mat2 rotate2d(float _angle){
  float s = sin(_angle);
  float c = cos(_angle);
    return mat2(c, -s, s, c);
}

float dBox (vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0));
}
float sdTorus( vec3 p, vec2 t ){
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float GetDistance(vec3 p) {
  float dist = 1e10;

  //
  vec4 spherePos = vec4(-2.0, 2.0, 6.0, 1);
  float sphereDist = length(p - spherePos.xyz) - spherePos.w;

  //torus
  float scaleTorus = 0.9;
  vec3 torusPos = p - vec3(2.0, 1.0, 5.0);
  torusPos.yz *= rotate2d(PI * 0.5);
  torusPos.xz *= scaleTorus * rotate2d(PI * 0.5);
  float torusDist = sdTorus(torusPos, vec2(0.4, 0.1))/ scaleTorus ;


  vec3 boxPos = p - vec3(0.0, 1.0, 6.0);
  float scale = mix(1.0, 3., smoothstep(-1.0, 1.0, boxPos.y));
  boxPos.xz *= scale;
  boxPos.xz *= rotate2d(boxPos.y * sin(uTime));
  float boxDist = dBox(boxPos, vec3(0.75)) / scale;

  float planeDist = p.y;

  float shapes = min(sphereDist, boxDist);
  dist = min( shapes, planeDist);
  dist = min( dist, torusDist);

  return dist;
}

vec3 GetNormal(vec3 surfacePos) {
  float d = GetDistance(surfacePos);
  vec2 e = vec2(0.01, 0.0);
  vec3 normal = d - vec3(GetDistance(surfacePos - e.xyy), GetDistance(surfacePos - e.yxy), GetDistance(surfacePos - e.yyx));
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
  vec3 lightPos = vec3(0.0, 5.0, 3.0);
  vec3 lightDir = normalize(lightPos - surfacePos);
  vec3 normal = GetNormal(surfacePos);
  float diffuse = clamp(dot(normal, lightDir), 0., 1.);

  float d = RayMarching(surfacePos + normal * SURF_DIST * 2., lightDir);
  if(d < length(lightPos - surfacePos))
    diffuse *= 1.0; // shadow

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
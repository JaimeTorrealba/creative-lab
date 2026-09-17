precision highp float;

uniform float uTime;
uniform vec2 uHover;
uniform vec2 uResolution;

uniform float uGlobalScale;
uniform vec3 uGlobalRot;
uniform vec3 uPivot;

uniform float uSphereRadius;
uniform float uBoxSize;
uniform float uTwist;
uniform float uTaper;
uniform float uTorusRadius;
uniform float uTorusTube;

uniform float uShowPlane;
uniform vec3 uLightPos;
uniform float uLightFollow;
uniform float uShadowStrength;
uniform float uAmbient;
uniform int uDebugMode;

#define PI 3.1415926535897932384626433832795
#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST 0.001

mat2 rotate2d(float _angle) {
  float s = sin(_angle);
  float c = cos(_angle);
  return mat2(c, -s, s, c);
}

mat3 rotate3d(vec3 a) {
  vec2 x = vec2(sin(a.x), cos(a.x));
  vec2 y = vec2(sin(a.y), cos(a.y));
  vec2 z = vec2(sin(a.z), cos(a.z));

  mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, x.y, x.x, 0.0, -x.x, x.y);
  mat3 ry = mat3(y.y, 0.0, -y.x, 0.0, 1.0, 0.0, y.x, 0.0, y.y);
  mat3 rz = mat3(z.y, z.x, 0.0, -z.x, z.y, 0.0, 0.0, 0.0, 1.0);

  return rx * ry * rz;
}

// the interior term matters here: without it the box reads as zero everywhere inside, and the
// global scale divides a distance that was never a bound in the first place
float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

// the three shapes in pivot-local space, so one transform in GetDistance moves them together
float sceneShapes(vec3 p) {
  float sphereDist = length(p - vec3(-2.0, 1.0, 0.0)) - uSphereRadius;

  float torusScale = 0.9;
  vec3 torusPos = p - vec3(2.0, 0.0, -1.0);
  torusPos.yz *= rotate2d(PI * 0.5);
  torusPos.xz *= rotate2d(PI * 0.5);
  // divide the point by the scale, multiply the distance back by it — the other way round is a
  // bound on nothing and the sphere trace steps straight through the surface
  float torusDist = sdTorus(torusPos / torusScale, vec2(uTorusRadius, uTorusTube)) * torusScale;

  vec3 boxPos = p;
  float taper = mix(1.0, uTaper, smoothstep(-1.0, 1.0, boxPos.y));
  boxPos.xz *= taper;
  boxPos.xz *= rotate2d(boxPos.y * uTwist * sin(uTime));
  float boxDist = sdBox(boxPos, vec3(uBoxSize)) / taper;

  return min(min(sphereDist, boxDist), torusDist);
}

float GetDistance(vec3 p) {
  // the ground stays out of the transform: rolling it with the objects reads as a camera bug
  float planeDist = uShowPlane > 0.5 ? p.y : MAX_DIST;

  vec3 q = rotate3d(-uGlobalRot) * (p - uPivot) / uGlobalScale;
  float shapes = sceneShapes(q) * uGlobalScale;

  return min(shapes, planeDist);
}

vec3 GetNormal(vec3 surfacePos) {
  float d = GetDistance(surfacePos);
  vec2 e = vec2(0.01, 0.0);
  vec3 normal = d - vec3(GetDistance(surfacePos - e.xyy), GetDistance(surfacePos - e.yxy), GetDistance(surfacePos - e.yyx));
  return normalize(normal);
}

float RayMarching(vec3 ro, vec3 rd, out int steps) {
  float directionOrigin = 0.0;
  steps = 0;

  for(int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * directionOrigin;
    float distance = GetDistance(p);
    directionOrigin += distance;
    steps = i + 1;
    if(directionOrigin > MAX_DIST || distance < SURF_DIST)
      break;

  }
  return directionOrigin;
}

// the camera sits at (0, 1, 0) looking down +z with uv = (fragCoord - 0.5 * res) / res.y, so a
// ray reaches the plane z = depth at (uv.x * depth, 1 + uv.y * depth, depth)
vec3 cursorAt(float depth) {
  vec2 m = (uHover - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  return vec3(m * depth, depth) + vec3(0.0, 1.0, 0.0);
}

vec3 lightPosition() {
  if(uLightFollow < 0.5)
    return uLightPos;
  return cursorAt(uLightPos.z) + vec3(0.0, 2.0, 0.0);
}

float GetLight(vec3 surfacePos) {
  vec3 lightPos = lightPosition();
  vec3 lightDir = normalize(lightPos - surfacePos);
  vec3 normal = GetNormal(surfacePos);
  float diffuse = clamp(dot(normal, lightDir), 0., 1.);

  int steps;
  float d = RayMarching(surfacePos + normal * SURF_DIST * 2., lightDir, steps);
  if(d < length(lightPos - surfacePos))
    diffuse *= uShadowStrength;

  return diffuse;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

  vec3 rayOrigin = vec3(0.0, 1.0, 0.0);
  vec3 rayDirection = normalize(vec3(uv, 1.0));

  int steps;
  float d = RayMarching(rayOrigin, rayDirection, steps);
  vec3 surfacePos = rayOrigin + rayDirection * d;

  vec3 col;
  if(uDebugMode == 1) {
    col = GetNormal(surfacePos) * 0.5 + 0.5;
  } else if(uDebugMode == 2) {
    col = vec3(d * 0.05);
  } else if(uDebugMode == 3) {
    // shrinking the scene makes this brighter: the distance divide costs the trace its stride
    col = vec3(float(steps) / float(MAX_STEPS));
  } else {
    col = vec3(GetLight(surfacePos) + uAmbient);
  }

  gl_FragColor = vec4(col, 1.0);
}

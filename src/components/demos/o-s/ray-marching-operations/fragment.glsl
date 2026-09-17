precision highp float;

uniform float uTime;
uniform vec2 uHover;
uniform vec2 uResolution;

uniform int uOperation;
uniform float uSmoothK;
uniform float uSphereRadius;
uniform float uSphereDepth;
uniform float uBoxSize;
uniform float uBoxSpin;
uniform vec3 uLightPos;
uniform float uShadowStrength;
uniform float uAmbient;
uniform int uDebugMode;

#define PI 3.1415926535897932384626433832795
#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST 0.001

mat2 rotate2d(float _angle){
  float s = sin(_angle);
  float c = cos(_angle);
    return mat2(c, -s, s, c);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
  return mix(b, a, h) - k*h*(1.0-h);
}

// the same blend run on the complements, which is what turns a hard max into a rounded one
float smax(float a, float b, float k) {
  return -smin(-a, -b, k);
}

float sdBox (vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// a is the sphere, b is the box. min is union and max is intersection; subtraction is max
// against a negated field, max(a, -b), which carves b out of a.
float applyOperation(float a, float b) {
  if(uOperation == 1)
    return smin(a, b, uSmoothK);
  if(uOperation == 2)
    return max(a, b);
  if(uOperation == 3)
    return smax(a, b, uSmoothK);
  if(uOperation == 4)
    return max(a, -b);
  if(uOperation == 5)
    return smax(a, -b, uSmoothK);
  if(uOperation == 6)
    return max(b, -a);
  if(uOperation == 7)
    return smax(b, -a, uSmoothK);
  return min(a, b);
}

// the camera sits at (0, 1, 0) looking down +z with uv = (fragCoord - 0.5 * res) / res.y, so a
// ray reaches the plane z = depth at (uv.x * depth, 1 + uv.y * depth, depth). Reconstructing it
// here rather than on the CPU keeps the sphere under the cursor across a resize.
vec3 cursorAt(float depth) {
  vec2 m = (uHover - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  return vec3(m * depth, depth) + vec3(0.0, 1.0, 0.0);
}

float GetDistance(vec3 p) {
  vec3 spherePos = cursorAt(uSphereDepth);
  float sphereDist = length(p - spherePos) - uSphereRadius;

  vec3 boxPos = p - vec3(0.0, 1.0, 6.0);
  boxPos.xy *= rotate2d(uTime * uBoxSpin);
  float boxDist = sdBox(boxPos, vec3(uBoxSize));

  float planeDist = p.y;

  return min(applyOperation(sphereDist, boxDist), planeDist);
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

float GetLight(vec3 surfacePos) {
  vec3 lightDir = normalize(uLightPos - surfacePos);
  vec3 normal = GetNormal(surfacePos);
  float diffuse = clamp(dot(normal, lightDir), 0., 1.);

  int steps;
  float d = RayMarching(surfacePos + normal * SURF_DIST * 2., lightDir, steps);
  if(d < length(uLightPos - surfacePos))
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
    // the smooth operators cost stride near the blend, which is where this lights up
    col = vec3(float(steps) / float(MAX_STEPS));
  } else {
    col = vec3(GetLight(surfacePos) + uAmbient);
  }

  gl_FragColor = vec4(col, 1.0);
}

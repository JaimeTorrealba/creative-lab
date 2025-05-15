uniform vec4 uGrassParams;
uniform float uTime;

varying vec3 vColour;
varying vec4 vGrassData;

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

float saturate(float x) {
  return clamp(x, 0.0, 1.0);
}

uvec2 murmurHash21(uint src) {
  const uint M = 0x5bd1e995u;
  uvec2 h = uvec2(1190494759u, 2147483647u);
  src *= M;
  src ^= src>>24u;
  src *= M;
  h *= M;
  h ^= src;
  h ^= h>>13u;
  h *= M;
  h ^= h>>15u;
  return h;
}

// 2 outputs, 1 input
vec2 hash21(float src) {
  uvec2 h = murmurHash21(floatBitsToUint(src));
  return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

vec2 quickHash(float p) {
  vec2 r = vec2(dot(vec2(p), vec2(17.43267, 23.8934543)), dot(vec2(p), vec2(13.98342, 37.2435232)));
  return fract(sin(r) * 1743.54892229);
}

vec3 hash(vec3 p) // replace this by something better
{
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));

  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise( in vec3 p )
{
  vec3 i = floor( p );
  vec3 f = fract( p );
	
	vec3 u = f*f*(3.0-2.0*f);

  return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                        dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                   mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                        dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
              mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                        dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                   mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                        dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}

float easeOut(float x, float t) {
  return 1.0 - pow(1.0 - x, t);
}

mat3 rotateY(float theta) {
  float c = cos(theta);
  float s = sin(theta);
  return mat3(vec3(c, 0, s), vec3(0, 1, 0), vec3(-s, 0, c));
}

// bezier curve
vec3 bezier(vec3 P0, vec3 P1, vec3 P2, vec3 P3, float t) {
  return (1.0 - t) * (1.0 - t) * (1.0 - t) * P0 +
    3.0 * (1.0 - t) * (1.0 - t) * t * P1 +
    3.0 * (1.0 - t) * t * t * P2 +
    t * t * t * P3;
}

const vec3 BASE_COLOUR = vec3(0.4, 0.22, 0.05);
const vec3 TIP_COLOUR = vec3(0.7, 0.42, 0.3);

void main() {
  int GRASS_SEGMENTS = int(uGrassParams.x);
  int GRASS_VERTICES = (GRASS_SEGMENTS + 1) * 2;
  float GRASS_PATCH_SIZE = uGrassParams.y;
  float GRASS_WIDTH = uGrassParams.z;
  float GRASS_HEIGHT = uGrassParams.w;

  // figure grass offset
  vec2 hasedInstanceID = hash21(float(gl_InstanceID)) * 2.0 - 1.0;
  vec3 grassOffset = vec3(hasedInstanceID.x, 0.0, hasedInstanceID.y) * GRASS_PATCH_SIZE;

  vec3 grassBladeWorldPos = (modelMatrix * vec4(grassOffset, 1.0)).xyz;
  vec3 hashVal = hash(grassBladeWorldPos);

    // Grass rotation
  const float PI = 3.14159;
  float angle = remap(hashVal.x, -1.0, 1.0, -PI, PI);

  // Figure out vertex id, > GRASS_VERTICES is other side
  int vertFB_ID = gl_VertexID % (GRASS_VERTICES * 2);
  int vertID = vertFB_ID % GRASS_VERTICES;

  // 0 = left, 1 = right
  int xTest = vertID & 0x1;
  int zTest = (vertFB_ID >= GRASS_VERTICES) ? 1 : -1;
  float xSide = float(xTest);
  float zSide = float(zTest);
  float heightPercent = float(vertID - xTest) / (float(GRASS_SEGMENTS) * 2.0);

  float width = GRASS_WIDTH * easeOut(1.0 - heightPercent, 0.5); // MAYBE DELETE THE EASEOUT
  float height = GRASS_HEIGHT;

  // Calculate the vertex position
  float x = (xSide - 0.5) * width;
  float y = heightPercent * height;
  float z = 0.0;

    // Grass lean factor
  float stiffness = 1.0;
  float windStrength = noise(vec3(grassBladeWorldPos.xz * 0.05, 0.0) + uTime);
  float windAngle = 0.0;
  vec3 windAxis = vec3(cos(windAngle), 0.0, sin(windAngle));
  float windLeanAngle = windStrength * 1.5 * heightPercent * stiffness;

    float randomLeanAnimation = noise(
      vec3(grassBladeWorldPos.xz, uTime * 4.0)) * (windStrength * 0.5 + 0.125);

    // Add the bezier curve for bend
  float leanFactor = remap(hashVal.y, -1.0, 1.0, -0.5, 0.5) + randomLeanAnimation;

  vec3 p1 = vec3(0.0);
  vec3 p2 = vec3(0.0, 0.33, 0.0);
  vec3 p3 = vec3(0.0, 0.66, 0.0);
  vec3 p4 = vec3(0.0, cos(leanFactor), sin(leanFactor));
  vec3 curve = bezier(p1, p2, p3, p4, heightPercent);

  y = curve.y * height;
  z = curve.z * height;

    // Generate grass matrix
  mat3 grassMat = rotateY(angle);

  vec3 grassLocalPosition = grassMat * vec3(x, y, z) + grassOffset;


    vec3 c1 = mix(BASE_COLOUR, TIP_COLOUR, heightPercent);
  vec3 c2 = mix(vec3(0.6, 0.6, 0.4), vec3(0.88, 0.87, 0.52), heightPercent);
  float noiseValue = noise(grassBladeWorldPos * 0.1);
  vColour = mix(c1, c2, smoothstep(-1.0, 1.0, noiseValue));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(grassLocalPosition, 1.0);

  vGrassData = vec4(x, heightPercent, xSide, 1.0);
}
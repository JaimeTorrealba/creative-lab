#include "./gerstner.glsl"

uniform vec3 uSunDirection;
uniform float uEta;
uniform float uFloorY;
uniform vec3 uFloorColor;
uniform vec3 uCausticColor;
uniform float uCausticGain;
uniform float uSunDisk;
uniform float uFill;
uniform float uSoftness;
uniform float uDebug;

varying vec3 vWorldPosition;

const vec3 UP = vec3(0.0, 1.0, 0.0);

// the water plane is the XY plane turned -90 degrees about X, so its local (x, y) is world
// (x, -z) and its local +z is world up
vec3 toWaterLocal(vec3 world) {
  return vec3(world.x, -world.z, world.y);
}

vec3 fromWaterLocal(vec3 local) {
  return vec3(local.x, local.z, -local.y);
}

// ch.2 run from the receiver: walk back up the light path from this point on the floor, refract
// out through the surface, and ask how near the escaping ray passes the sun. Nothing is splatted
// and nothing accumulates, so there is no buffer to drop samples out of — every fragment answers
// for itself, which is what makes it hold still.
float causticAt(vec2 floorXZ, vec3 sunDir, vec3 gather) {
  float travel = -uFloorY / max(gather.y, 1e-3);
  vec2 surfaceXZ = floorXZ + gather.xz * travel;

  // the chapter treats the surface as a height field, so the crossing is read straight off the
  // wave parameter. Gerstner also shifts horizontally, which this ignores — visible only as a
  // slight lag of the pattern behind the steepest crests.
  vec3 tangent;
  vec3 binormal;
  gerstnerSum(toWaterLocal(vec3(surfaceXZ.x, 0.0, surfaceXZ.y)), tangent, binormal);
  vec3 normal = fromWaterLocal(normalize(cross(tangent, binormal)));

  // leaving water for air, so the normal has to face the ray coming up at it
  vec3 exitDir = refract(gather, -normal, uEta);
  // past the critical angle nothing escapes along this path at all
  if (dot(exitDir, exitDir) < 1e-6) return 0.0;

  // the sun is a disk rather than a point, so this is a Gaussian in angle with uSunDisk as its
  // tightness. Flat water sends every ray straight back at the sun and reads a uniform 1, which
  // is the correct baseline; the network is where the waves steer rays off it.
  float align = max(dot(normalize(exitDir), sunDir), 0.0);
  return exp(-(1.0 - align) * uSunDisk);
}

void main() {
  vec3 sunDir = normalize(uSunDirection);
  // the sun's heading once it is inside the water; reversed, it is the way back out to the sun
  vec3 gather = -refract(-sunDir, UP, 1.0 / uEta);

  vec2 p = vWorldPosition.xz;

  // four taps on a rotated square. The exit direction swings fast across a crest, so a single
  // sample per pixel aliases into crawling speckle no matter how the pattern is generated.
  float s = uSoftness;
  float caustic = causticAt(p + vec2(s, s), sunDir, gather);
  caustic += causticAt(p + vec2(-s, s), sunDir, gather);
  caustic += causticAt(p + vec2(s, -s), sunDir, gather);
  caustic += causticAt(p + vec2(-s, -s), sunDir, gather);
  caustic *= 0.25;

  if (uDebug > 0.5) {
    gl_FragColor = vec4(vec3(caustic), 1.0);
    return;
  }

  vec2 cell = abs(fract(p * 0.5 + 0.5) - 0.5) * 2.0;
  float line = 1.0 - smoothstep(0.0, 0.08, min(cell.x, cell.y));
  vec3 base = mix(uFloorColor, uFloorColor * 0.72, line);

  // the gather is normalised to 1 at flat water, so it cannot manufacture the above-ambient peaks
  // a splatting solver gets for free — gain past 1 is what sells the bright bands
  vec3 light = vec3(uFill) + uCausticColor * caustic * uCausticGain;

  gl_FragColor = vec4(base * light, 1.0);
}

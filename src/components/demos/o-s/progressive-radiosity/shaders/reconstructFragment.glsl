// Reconstruction: every receiver texel gathers from the batch of shooters. Visibility is the
// item-buffer test (the receiver's own polygon id must be what the shooter sees there), the
// form factor is the disc approximation cos_i cos_j / (pi r^2 + A_j).
#define PI 3.141592653589793

uniform sampler2D uRadiosity;
uniform sampler2D uResidual;
uniform sampler2D uShooterEnergy;
uniform sampler2D uShooters;
uniform sampler2D uItemBuffer;
uniform int uShooterCount;
uniform int uBlock;
uniform float uItemResolution;
uniform float uPixelAngle;
uniform float uDepthTolerance;
uniform float uShotFade;
uniform bool uSoftVisibility;

in vec3 vWorldPosition;
in vec3 vNormal;
in vec3 vAlbedo;
flat in float vPolygonId;

layout(location = 0) out vec4 outRadiosity;
layout(location = 1) out vec4 outResidual;

// Ids alone darken corners: the pixel next to the receiver may hold the adjoining wall. The
// optional tolerance also accepts any surface no closer than the receiver's own depth slope.
bool isTapVisible(ivec2 pixel, float range, float tolerance) {
  vec2 item = texelFetch(uItemBuffer, pixel, 0).rg;
  if (item.r < 0.5) return true;
  if (abs(item.r - vPolygonId - 1.0) < 0.5) return true;
  return uDepthTolerance > 0.0 && range <= item.g + tolerance;
}

float sampleVisibility(vec2 pixel, ivec2 tileOrigin, float range, float tolerance) {
  ivec2 center = ivec2(floor(pixel));
  if (!uSoftVisibility) return isTapVisible(center, range, tolerance) ? 1.0 : 0.0;
  ivec2 tileMax = tileOrigin + ivec2(int(uItemResolution) - 1);
  float visible = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      ivec2 tap = clamp(center + ivec2(x, y), tileOrigin, tileMax);
      visible += isTapVisible(tap, range, tolerance) ? 1.0 : 0.0;
    }
  }
  return visible / 9.0;
}

float depthTolerance(float range, float cosReceiver) {
  float sinReceiver = sqrt(max(1.0 - cosReceiver * cosReceiver, 0.0));
  float slope = sinReceiver / max(cosReceiver, 0.25);
  return uDepthTolerance * range * uPixelAngle * slope + 0.004;
}

vec3 gatherFromShooter(int index, ivec2 cell, vec3 receiverNormal, inout bool isShooter) {
  vec4 positionArea = texelFetch(uShooters, ivec2(index, 0), 0);
  vec3 shooterNormal = texelFetch(uShooters, ivec2(index, 1), 0).xyz;
  vec3 tangent = texelFetch(uShooters, ivec2(index, 2), 0).xyz;
  vec4 cellTile = texelFetch(uShooters, ivec2(index, 3), 0);
  ivec2 shooterCell = ivec2(cellTile.xy);
  if (shooterCell == cell) isShooter = true;

  vec3 offset = vWorldPosition - positionArea.xyz;
  float rangeSq = max(dot(offset, offset), 1e-8);
  float range = sqrt(rangeSq);
  vec3 direction = offset / range;
  float cosShooter = dot(shooterNormal, direction);
  float cosReceiver = -dot(receiverNormal, direction);
  if (cosShooter <= 0.0 || cosReceiver <= 0.0) return vec3(0.0);

  vec3 bitangent = cross(shooterNormal, tangent);
  vec3 local = vec3(dot(tangent, offset), dot(bitangent, offset), dot(shooterNormal, offset));
  vec2 disc = local.xy / (range + local.z);
  vec2 pixel = cellTile.zw + (disc * 0.5 + 0.5) * uItemResolution;
  float tolerance = depthTolerance(range, cosReceiver);
  float visibility = sampleVisibility(pixel, ivec2(cellTile.zw), range, tolerance);

  float area = positionArea.w;
  float formFactor = cosShooter * cosReceiver / (PI * rangeSq + area);
  vec3 energy = texelFetch(uShooterEnergy, shooterCell, 0).rgb;
  return energy * area * formFactor * visibility;
}

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  ivec2 cell = texel / uBlock;
  vec3 radiosity = texelFetch(uRadiosity, texel, 0).rgb;
  vec4 residual = texelFetch(uResidual, texel, 0);
  vec3 receiverNormal = normalize(vNormal);

  bool isShooter = false;
  vec3 gathered = vec3(0.0);
  for (int i = 0; i < MAX_SHOOTERS; i++) {
    if (i >= uShooterCount) break;
    gathered += gatherFromShooter(i, cell, receiverNormal, isShooter);
  }

  vec3 received = vAlbedo * gathered;
  vec3 unshot = isShooter ? vec3(0.0) : residual.rgb;
  float shotMark = isShooter ? 1.0 : residual.a * uShotFade;
  outRadiosity = vec4(radiosity + received, 1.0);
  outResidual = vec4(unshot + received, shotMark);
}

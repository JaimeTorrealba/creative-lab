// Hemispherical projection around the shooter's normal, in one pass. With w = |p| + p.z the
// divide gives p.xy / (|p| + p.z), and points behind the shooter get w <= 0 so the clipper
// removes them instead of letting them blow up.
uniform vec3 uShooterPosition;
uniform vec3 uShooterTangent;
uniform vec3 uShooterBitangent;
uniform vec3 uShooterNormal;
uniform float uFar;

in float polygonId;

out vec3 vLocal;
flat out float vPolygonId;

void main() {
  vec3 offset = position - uShooterPosition;
  vec3 local = vec3(
    dot(uShooterTangent, offset),
    dot(uShooterBitangent, offset),
    dot(uShooterNormal, offset)
  );
  float range = length(local);
  float w = range + local.z;
  vLocal = local;
  vPolygonId = polygonId;
  gl_Position = vec4(local.xy, (range / uFar * 2.0 - 1.0) * w, w);
}

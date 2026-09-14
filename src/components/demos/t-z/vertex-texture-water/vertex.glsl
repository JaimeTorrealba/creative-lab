uniform sampler2D uSwell;
// xy = wrapped uv offset, z = 1 / period in metres, w = amplitude in metres
uniform vec4 uOctave[4];
uniform float uAmplitude;
uniform float uSharpen;
uniform float uTexels;
uniform vec2 uFadeDisp;

in float aRingIndex;

out vec3 vLocalPos;
out vec3 vGeoNormal;
out float vDist;
out float vHeight;
out float vRing;

// Hardware bilinear filtering is only C0: its derivative jumps at every texel edge, which reads as
// travelling creases once the grid starts sliding underneath a world-anchored field. Smoothstepping
// the sub-texel coordinate makes the reconstruction C1. The outer fract() is not optional — the
// incoming uv reaches a few hundred, and floor() on that has no sub-texel bits left to keep.
vec4 smoothFetch(sampler2D map, vec2 uv) {
  vec2 t = fract(uv) * uTexels - 0.5;
  vec2 f = fract(t);
  t = (floor(t) + f * f * (3.0 - 2.0 * f) + 0.5) / uTexels;
  return texture(map, t);
}

void main() {
  // metres from the eye: the mesh origin is snapped under the camera every frame, so the grid is
  // already eye-local and world position never has to appear in the shader at all. The octave
  // offsets carry the world anchoring instead, wrapped into [0,1) on the CPU in float64 — a
  // float32 world coordinate at 8 km is quantised to about a millimetre, which would erase the
  // fine octaves entirely.
  vec2 p = position.xz;
  vDist = length(p);
  vRing = aRingIndex;

  float fade = 1.0 - smoothstep(uFadeDisp.x, uFadeDisp.y, vDist);

  float y = 0.0;
  vec2 slope = vec2(0.0);

  // 18.3: of the four superposed maps only the two largest scales displace. Ring spacing is
  // already 1-2 m ten metres out, so by Nyquist a shorter wavelength would crawl and pop as the
  // grid slides underneath it — the finer two are left to the fragment shader as normals.
  for (int i = 0; i < 2; i++) {
    vec4 o = uOctave[i];
    vec4 s = smoothFetch(uSwell, p * o.z + o.xy);
    float a = o.w * uAmplitude * fade;
    y += a * (s.b * 2.0 - 1.0);
    // the map stores d(h01)/du, so the chain rule needs the remap factor and du/dX = 1 / period
    slope += a * 2.0 * s.rg * o.z;
  }

  vHeight = y;
  vGeoNormal = normalize(vec3(-slope.x, 1.0, -slope.y));

  // An extension rather than ch.18: pulling the surface back along its own slope peaks the crests
  // and flattens the troughs. A Gerstner sum gets this from the wave direction, which a scalar
  // height field does not have.
  p -= slope * uSharpen * fade;

  vec3 displaced = vec3(p.x, y, p.y);
  vLocalPos = displaced;

  // modelViewMatrix rather than viewMatrix * modelMatrix: three composes that product on the CPU
  // in float64 and uploads the result, where multiplying the two float32 matrices here would
  // jitter the outer rings once the mesh translation reaches kilometres.
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}

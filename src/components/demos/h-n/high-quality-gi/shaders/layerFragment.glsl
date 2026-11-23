// One depth layer of a global ray bundle (38.3, steps 5-7). The orthographic camera looks along
// -uRayDirection, so every texel is one parallel ray and the layers are the surfaces it crosses in
// order. Peeling is done by hand: anything not strictly behind the previous layer is dropped, and
// the hardware depth test keeps the nearest of what is left.
uniform sampler2D uPreviousLayer;
uniform vec3 uCameraPosition;
uniform vec3 uRayDirection;
uniform float uPeel;
uniform float uPeelEpsilon;
uniform float uUseFirstPass;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vAlbedo;
varying vec3 vFirstPass;

void main() {
  float depth = dot(uCameraPosition - vWorldPosition, uRayDirection);

  if (uPeel > 0.5) {
    float previous = texelFetch(uPreviousLayer, ivec2(gl_FragCoord.xy), 0).a;
    if (previous == 0.0 || depth <= previous + uPeelEpsilon) discard;
  }

  vec3 normal = normalize(vNormal);
  vec3 radiance = vec3(0.0);

  // A ray travelling along uRayDirection only picks up light from a face that looks back at it.
  // Hitting the back of a face still blocks the ray, it just carries nothing.
  if (dot(normal, uRayDirection) < 0.0) {
    vec3 irradiance = getDirectIrradiance(vWorldPosition, normal) + vFirstPass * uUseFirstPass;
    radiance = vAlbedo / 3.14159265 * irradiance;
  }

  gl_FragColor = vec4(radiance, depth);
}

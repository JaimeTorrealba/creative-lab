in vec2 aPatch;
in vec2 aUV;
in float aLevel;

uniform sampler2D uControl;
uniform sampler2D uSurface;
uniform vec2 uGrid;
uniform float uDisplacementScale;

out vec3 vWorldPos;
out vec3 vNormal;
out vec3 vDu;
out vec3 vDv;
out vec2 vUv;
out float vLevel;
out float vHeight;

vec3 controlPoint(int i, int j) {
  ivec2 g = ivec2(uGrid);
  return texelFetch(uControl, ivec2((i % g.x + g.x) % g.x, (j % g.y + g.y) % g.y), 0).xyz;
}

vec4 bspline(float t) {
  float t2 = t * t;
  float t3 = t2 * t;
  return vec4(
    1.0 - 3.0 * t + 3.0 * t2 - t3,
    4.0 - 6.0 * t2 + 3.0 * t3,
    1.0 + 3.0 * t + 3.0 * t2 - 3.0 * t3,
    t3
  ) / 6.0;
}

vec4 bsplineDeriv(float t) {
  float t2 = t * t;
  return vec4(
    -1.0 + 2.0 * t - t2,
    -4.0 * t + 3.0 * t2,
    1.0 + 2.0 * t - 3.0 * t2,
    t2
  ) / 2.0;
}

void main() {
  int pi = int(aPatch.x);
  int pj = int(aPatch.y);

  vec4 bu = bspline(aUV.x);
  vec4 bv = bspline(aUV.y);
  vec4 du = bsplineDeriv(aUV.x);
  vec4 dv = bsplineDeriv(aUV.y);

  // Catmull-Clark's limit surface over a regular quad grid is exactly a bicubic B-spline, so the
  // 4x4 control block around this cell can be evaluated directly instead of subdivided. The
  // accumulation order matters: two patches meeting at a seam run this same sequence over the same
  // rows, which is what makes their shared boundary bit-identical rather than merely close.
  vec3 pos = vec3(0.0);
  vec3 tanU = vec3(0.0);
  vec3 tanV = vec3(0.0);

  for (int b = 0; b < 4; b++) {
    vec3 row = vec3(0.0);
    vec3 rowDu = vec3(0.0);
    for (int a = 0; a < 4; a++) {
      vec3 c = controlPoint(pi - 1 + a, pj - 1 + b);
      row += c * bu[a];
      rowDu += c * du[a];
    }
    pos += row * bv[b];
    tanU += rowDu * bv[b];
    tanV += row * dv[b];
  }

  vUv = (aPatch + aUV) / uGrid;
  vLevel = aLevel;

  // Rescaled from patch-local parameters to texture uv so the fragment shader can add the
  // displacement gradient to them without a second chain rule.
  vec3 dPdU = tanU * uGrid.x;
  vec3 dPdV = tanV * uGrid.y;
  // The torus is parameterised left-handed in (u, v), so this order gives the outward normal.
  vec3 n = normalize(cross(dPdV, dPdU));

  float h = texture(uSurface, vUv).b;
  vHeight = h;
  vec3 displaced = pos + n * ((h - 0.5) * uDisplacementScale);

  vec4 world = modelMatrix * vec4(displaced, 1.0);
  vWorldPos = world.xyz;
  vNormal = mat3(modelMatrix) * n;
  vDu = mat3(modelMatrix) * dPdU;
  vDv = mat3(modelMatrix) * dPdV;

  gl_Position = projectionMatrix * viewMatrix * world;
}

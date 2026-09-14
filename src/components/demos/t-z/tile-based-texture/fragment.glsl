precision highp float;
// The edge hash needs the full 32 bits; mediump int would only guarantee 16 of them.
precision highp int;

uniform sampler2D uTilesColor;
uniform sampler2D uTilesNormal;
uniform sampler2D uIndex;
uniform float uAtlasTiles;
uniform float uOutputTiles;
uniform float uEdgeColors;
uniform float uSeed;
uniform float uUvScale;
uniform float uNormalStrength;
uniform vec3 uLightDir;
uniform int uMode;
uniform int uShowBorders;
uniform int uTintTiles;

in vec2 vUv;
out vec4 fragColor;

// Listing 12-1, unchanged.
float tileIndex1D(float e1, float e2) {
  if (e1 < e2) return 2.0 * e1 + e2 * e2;
  if (e1 == e2) return e1 > 0.0 ? (e1 + 1.0) * (e1 + 1.0) - 2.0 : 0.0;
  if (e2 > 0.0) return e1 * e1 + 2.0 * e2 - 1.0;
  return (e1 + 1.0) * (e1 + 1.0) - 1.0;
}

vec2 tileIndex2D(vec4 e) {
  return vec2(tileIndex1D(e.w, e.y), tileIndex1D(e.x, e.z));
}

uint hashUint(uint x) {
  x ^= x >> 16u;
  x *= 0x7feb352du;
  x ^= x >> 15u;
  x *= 0x846ca68bu;
  x ^= x >> 16u;
  return x;
}

// family 0 = the vertical edges, keyed by column; family 1 = the horizontal ones, keyed by row.
float hashEdge(vec2 at, uint family) {
  ivec2 c = ivec2(floor(at)) + 4096;
  uint h = hashUint((uint(c.x) * 0x9e3779b9u) ^ (uint(c.y) * 0x85ebca6bu) ^
                    (family * 0xc2b2ae35u) ^ uint(uSeed));
  return float(h % uint(uEdgeColors));
}

// The whole trick of the on-the-fly variant. Each edge is keyed by its own position rather than
// by the cell that owns it, so two neighbouring cells land on the same colour for the edge they
// share without ever consulting each other: cell (i+1, j)'s west is literally the same call as
// cell (i, j)'s east. That is a valid Wang tiling of unbounded extent for zero storage.
vec4 edgeColorsAt(vec2 cell) {
  return vec4(
    hashEdge(cell, 1u),                   // south - horizontal edge at row cell.y
    hashEdge(cell + vec2(1.0, 0.0), 0u),  // east  - vertical edge at column cell.x + 1
    hashEdge(cell + vec2(0.0, 1.0), 1u),  // north - horizontal edge at row cell.y + 1
    hashEdge(cell, 0u)                    // west  - vertical edge at column cell.x
  );
}

void main() {
  vec2 uv = vUv * uUvScale;
  vec2 mappingAddress = uv * uOutputTiles;
  vec2 cell = floor(mappingAddress);
  vec2 f = fract(mappingAddress);

  // Listing 12-2. The derivatives have to be measured at the input-tile scale and handed to the
  // fetch explicitly: the atlas coordinate jumps a whole tile at every cell border, so left to
  // pick its own mip the hardware would drop to the coarsest level along every seam. Taken out
  // here rather than inside the branch, which is divergent.
  vec2 tileScaledTex = uv * (uOutputTiles / uAtlasTiles);
  vec2 ddxTile = dFdx(tileScaledTex);
  vec2 ddyTile = dFdy(tileScaledTex);

  // Mode 0 stays on tile (0, 0), whose four edges are all colour 0 and which therefore tiles
  // seamlessly against itself. A perfectly valid texture, and periodic as anything.
  vec2 whichTile = vec2(0.0);
  if (uMode == 1) {
    // texRECT(indexTexture, mod(mappingAddress, mappingScale)) in the chapter. Normalised
    // coordinates with NearestFilter and RepeatWrapping do the same job without samplerRECT.
    whichTile = floor(texture(uIndex, (cell + 0.5) / uOutputTiles).rg * 255.0 + 0.5);
  } else if (uMode == 2) {
    whichTile = tileIndex2D(edgeColorsAt(cell));
  }

  // Section 12.5 is deliberately not implemented here: the mip chain is the one the driver
  // generates, and downsampling mixes each tile's interior into its border, so the coarse levels
  // stop being legal Wang tiles and seams can surface at extreme distance. The chapter's fix is
  // to average every same-coloured edge across all tiles at each level.
  vec2 atlasUv = (whichTile + f) / uAtlasTiles;
  vec3 albedo = textureGrad(uTilesColor, atlasUv, ddxTile, ddyTile).rgb;
  vec3 packed = textureGrad(uTilesNormal, atlasUv, ddxTile, ddyTile).rgb;

  vec3 normal = packed * 2.0 - 1.0;
  normal.xy *= uNormalStrength;
  normal = normalize(normal);

  // uLightDir already arrives in the plane's tangent frame, so there is no basis to build here.
  float diffuse = max(dot(normal, normalize(uLightDir)), 0.0);
  vec3 color = albedo * (0.35 + 0.9 * diffuse);

  if (uTintTiles == 1) {
    uint h = hashUint((uint(whichTile.x) * 73856093u) ^ (uint(whichTile.y) * 19349663u));
    vec3 tint = vec3(float(h & 255u), float((h >> 8u) & 255u), float((h >> 16u) & 255u)) / 255.0;
    color = mix(color, tint, 0.45);
  }

  if (uShowBorders == 1) {
    vec2 edge = min(f, 1.0 - f);
    vec2 w = max(fwidth(mappingAddress) * 1.5, 1e-5);
    float line = 1.0 - min(smoothstep(0.0, w.x, edge.x), smoothstep(0.0, w.y, edge.y));
    color = mix(color, vec3(1.0, 0.35, 0.1), line * 0.85);
  }

  fragColor = vec4(color, 1.0);
  #if defined( TONE_MAPPING )
    fragColor.rgb = toneMapping(fragColor.rgb);
  #endif
  fragColor = linearToOutputTexel(fragColor);
}

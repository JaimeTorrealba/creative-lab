import { createNoise2D } from 'simplex-noise'
import alea from 'alea'
import { BufferGeometry, BufferAttribute, PlaneGeometry, Vector3 } from 'three'

export const TERRAIN_SIZE = 40
const CELL_SIZE = 2.5
const HALF = TERRAIN_SIZE / 2

const heightNoise = createNoise2D(alea('virtual-botany-terrain'))
const tintNoise = createNoise2D(alea('virtual-botany-tint'))

export const LIGHT_POSITION = [12, 18, 8]
const lightDir = new Vector3(...LIGHT_POSITION).normalize()

// visible rocks double as analytic occluders for the shadow feelers
export const ROCKS = [
  { x: -6, z: -4, radius: 1.8 },
  { x: 7, z: 3, radius: 2.4 },
  { x: -2, z: 9, radius: 1.4 }
]

// atlas quadrants (2x2), inset to avoid mip bleeding between variations
const GRASS_REGIONS = [
  { u0: 0.01, v0: 0.51, u1: 0.49, v1: 0.99, weight: 0.85 },
  { u0: 0.51, v0: 0.51, u1: 0.99, v1: 0.99, weight: 0.15 }
]
const BUSH_REGIONS = [
  { u0: 0.01, v0: 0.01, u1: 0.49, v1: 0.49, weight: 0.6 },
  { u0: 0.51, v0: 0.01, u1: 0.99, v1: 0.49, weight: 0.4 }
]

export function terrainHeight(x, z) {
  return 1.1 * heightNoise(x * 0.06, z * 0.06) + 0.35 * heightNoise(x * 0.2 + 50, z * 0.2 + 50)
}

export function terrainNormal(x, z) {
  const eps = 0.15
  const nx = terrainHeight(x - eps, z) - terrainHeight(x + eps, z)
  const nz = terrainHeight(x, z - eps) - terrainHeight(x, z + eps)
  const normal = new Vector3(nx, 2 * eps, nz)
  return normal.normalize()
}

export function buildTerrainGeometry(segments = 128) {
  const geometry = new PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, segments, segments)
  geometry.rotateX(-Math.PI / 2)
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i)))
  }
  geometry.computeVertexNormals()
  return geometry
}

function raySphereHit(origin, dir, center, radius) {
  const ox = origin.x - center.x
  const oy = origin.y - center.y
  const oz = origin.z - center.z
  const b = ox * dir.x + oy * dir.y + oz * dir.z
  const c = ox * ox + oy * oy + oz * oz - radius * radius
  const disc = b * b - c
  if (disc < 0) return false
  return -b + Math.sqrt(disc) > 0
}

function shadowOcclusion(x, y, z, rand) {
  const rays = 5
  let hits = 0
  const origin = new Vector3()
  for (let i = 0; i < rays; i++) {
    origin.set(x + (rand() - 0.5) * 0.5, y + 0.15, z + (rand() - 0.5) * 0.5)
    for (const rock of ROCKS) {
      const center = new Vector3(rock.x, terrainHeight(rock.x, rock.z) + rock.radius * 0.2, rock.z)
      if (raySphereHit(origin, lightDir, center, rock.radius * 0.85)) {
        hits++
        break
      }
    }
  }
  return hits / rays
}

function pickRegion(regions, rand) {
  const r = rand()
  let acc = 0
  for (const region of regions) {
    acc += region.weight
    if (r <= acc) return region
  }
  return regions[regions.length - 1]
}

function insideRock(x, z) {
  return ROCKS.some((rock) => {
    const dx = x - rock.x
    const dz = z - rock.z
    return dx * dx + dz * dz < rock.radius * rock.radius * 0.81
  })
}

const HEALTHY_TINT = [1.0, 1.0, 1.0]
const DRY_TINT = [1.05, 0.9, 0.55]

function buildLayerGeometry(options) {
  const {
    seed,
    regions,
    density,
    baseWidth,
    baseHeight,
    minNormalY,
    stiffnessMin,
    stiffnessMax
  } = options
  const rand = alea(seed)

  const positions = []
  const corners = []
  const uvs = []
  const normals = []
  const tints = []
  const data = []
  const indices = []

  const cells = Math.round(TERRAIN_SIZE / CELL_SIZE)
  const plantsPerCell = Math.max(1, Math.round(density * CELL_SIZE * CELL_SIZE))

  for (let cx = 0; cx < cells; cx++) {
    for (let cz = 0; cz < cells; cz++) {
      for (let p = 0; p < plantsPerCell; p++) {
        const x = -HALF + cx * CELL_SIZE + rand() * CELL_SIZE
        const z = -HALF + cz * CELL_SIZE + rand() * CELL_SIZE
        const normal = terrainNormal(x, z)
        if (normal.y < minNormalY) continue
        if (insideRock(x, z)) continue

        const y = terrainHeight(x, z)

        const t = tintNoise(x * 0.08, z * 0.08) * 0.5 + 0.5
        const brightness = 0.9 + rand() * 0.2
        const shade = 1 - shadowOcclusion(x, y, z, rand) * 0.55
        const tint = [
          (HEALTHY_TINT[0] + (DRY_TINT[0] - HEALTHY_TINT[0]) * t) * brightness * shade,
          (HEALTHY_TINT[1] + (DRY_TINT[1] - HEALTHY_TINT[1]) * t) * brightness * shade,
          (HEALTHY_TINT[2] + (DRY_TINT[2] - HEALTHY_TINT[2]) * t) * brightness * shade
        ]

        const region = pickRegion(regions, rand)
        const flip = rand() > 0.5
        const u0 = flip ? region.u1 : region.u0
        const u1 = flip ? region.u0 : region.u1

        const width = baseWidth * (0.8 + rand() * 0.4)
        const height = baseHeight * (0.8 + rand() * 0.4)
        const stiffness = stiffnessMin + rand() * (stiffnessMax - stiffnessMin)
        const phase = rand() * Math.PI * 2

        const base = positions.length / 3
        for (const [cu, cv] of [
          [-0.5, 0],
          [0.5, 0],
          [-0.5, 1],
          [0.5, 1]
        ]) {
          positions.push(x, y, z)
          corners.push(cu, cv)
          uvs.push(cu < 0 ? u0 : u1, cv === 0 ? region.v0 : region.v1)
          normals.push(normal.x, normal.y, normal.z)
          tints.push(...tint)
          data.push(width, height, stiffness, phase)
        }
        indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3)
      }
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('aCorner', new BufferAttribute(new Float32Array(corners), 2))
  geometry.setAttribute('aUv', new BufferAttribute(new Float32Array(uvs), 2))
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3))
  geometry.setAttribute('aTint', new BufferAttribute(new Float32Array(tints), 3))
  geometry.setAttribute('aData', new BufferAttribute(new Float32Array(data), 4))
  geometry.setIndex(new BufferAttribute(new Uint32Array(indices), 1))
  geometry.computeBoundingSphere()
  return geometry
}

export function buildGrassGeometry(density = 6) {
  return buildLayerGeometry({
    seed: 'virtual-botany-grass',
    regions: GRASS_REGIONS,
    density,
    baseWidth: 0.9,
    baseHeight: 0.8,
    minNormalY: 0.7,
    stiffnessMin: 0.15,
    stiffnessMax: 1
  })
}

export function buildClutterGeometry(density = 0.4) {
  return buildLayerGeometry({
    seed: 'virtual-botany-clutter',
    regions: BUSH_REGIONS,
    density,
    baseWidth: 2,
    baseHeight: 1.8,
    minNormalY: 0.8,
    stiffnessMin: 0.05,
    stiffnessMax: 0.2
  })
}

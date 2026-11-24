import { BufferAttribute, BufferGeometry, Color } from 'three'

// The hemispherical projection bends straight edges into curves while the rasteriser keeps
// them straight, so the item-buffer copy of the scene is finely tessellated.
const ITEM_SEGMENT_LENGTH = 0.08
const CORNERS = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1]
]

const writePoint = (array, offset, polygon, s, t) => {
  const { origin, u, v } = polygon
  array[offset] = origin.x + u.x * s + v.x * t
  array[offset + 1] = origin.y + u.y * s + v.y * t
  array[offset + 2] = origin.z + u.z * s + v.z * t
}

const writeGridIndices = (indices, cursor, base, columns, rows) => {
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const a = base + row * (columns + 1) + column
      const b = a + columns + 1
      indices.set([a, a + 1, b + 1, a, b + 1, b], cursor)
      cursor += 6
    }
  }
  return cursor
}

export const createItemGeometry = (polygons) => {
  const grids = polygons.map((polygon) => ({
    columns: Math.max(1, Math.ceil(polygon.width / ITEM_SEGMENT_LENGTH)),
    rows: Math.max(1, Math.ceil(polygon.height / ITEM_SEGMENT_LENGTH))
  }))
  const vertexCount = grids.reduce((sum, { columns, rows }) => sum + (columns + 1) * (rows + 1), 0)
  const indexCount = grids.reduce((sum, { columns, rows }) => sum + columns * rows * 6, 0)
  const positions = new Float32Array(vertexCount * 3)
  const ids = new Float32Array(vertexCount)
  const indices = new Uint32Array(indexCount)

  let base = 0
  let cursor = 0
  grids.forEach(({ columns, rows }, index) => {
    const count = (columns + 1) * (rows + 1)
    ids.fill(polygons[index].id, base, base + count)
    cursor = writeGridIndices(indices, cursor, base, columns, rows)
    base += count
  })

  const geometry = new BufferGeometry()
  const positionAttribute = new BufferAttribute(positions, 3)
  geometry.setAttribute('position', positionAttribute)
  geometry.setAttribute('polygonId', new BufferAttribute(ids, 1))
  geometry.setIndex(new BufferAttribute(indices, 1))

  const updatePlacement = () => {
    let offset = 0
    grids.forEach(({ columns, rows }, index) => {
      for (let row = 0; row <= rows; row++) {
        for (let column = 0; column <= columns; column++) {
          writePoint(positions, offset, polygons[index], column / columns, row / rows)
          offset += 3
        }
      }
    })
    positionAttribute.needsUpdate = true
  }

  return { geometry, updatePlacement }
}

const createAttribute = (geometry, name, count, size) => {
  const attribute = new BufferAttribute(new Float32Array(count * size), size)
  geometry.setAttribute(name, attribute)
  return attribute
}

const writeAtlasAttributes = (geometry, polygons, layout) => {
  const count = polygons.length * 4
  const atlas = createAttribute(geometry, 'atlasCoord', count, 2)
  const surfaceUv = createAttribute(geometry, 'surfaceUv', count, 2)
  const tileRect = createAttribute(geometry, 'tileRect', count, 4)
  const ids = createAttribute(geometry, 'polygonId', count, 1)
  polygons.forEach((polygon, index) => {
    const tile = layout.tiles[index]
    CORNERS.forEach(([s, t], corner) => {
      const vertex = index * 4 + corner
      const x = ((tile.x + s * tile.width) / layout.width) * 2 - 1
      const y = ((tile.y + t * tile.height) / layout.height) * 2 - 1
      atlas.setXY(vertex, x, y)
      surfaceUv.setXY(vertex, s, t)
      tileRect.setXYZW(vertex, tile.x, tile.y, tile.width, tile.height)
      ids.setX(vertex, polygon.id)
    })
  })
}

// One quad per polygon, used twice: drawn in atlas space it visits every receiver texel exactly
// once (the reconstruction pass); drawn in world space it displays the solution.
export const createSurfaceGeometry = (polygons, layout) => {
  const count = polygons.length * 4
  const geometry = new BufferGeometry()
  const position = createAttribute(geometry, 'position', count, 3)
  const normal = createAttribute(geometry, 'normal', count, 3)
  const albedo = createAttribute(geometry, 'albedo', count, 3)
  const emission = createAttribute(geometry, 'emission', count, 3)
  writeAtlasAttributes(geometry, polygons, layout)

  const indices = polygons.flatMap((_, index) => [0, 1, 2, 0, 2, 3].map((i) => index * 4 + i))
  geometry.setIndex(indices)

  const updatePlacement = () => {
    polygons.forEach((polygon, index) => {
      CORNERS.forEach(([s, t], corner) => {
        const vertex = index * 4 + corner
        writePoint(position.array, vertex * 3, polygon, s, t)
        normal.setXYZ(vertex, polygon.normal.x, polygon.normal.y, polygon.normal.z)
      })
    })
    position.needsUpdate = true
    normal.needsUpdate = true
  }

  const color = new Color()
  const updateMaterials = (palette, lightEmission) => {
    polygons.forEach((polygon, index) => {
      color.set(palette[polygon.colorKey])
      const glow = polygon.emissive ? lightEmission : { r: 0, g: 0, b: 0 }
      for (let corner = 0; corner < 4; corner++) {
        albedo.setXYZ(index * 4 + corner, color.r, color.g, color.b)
        emission.setXYZ(index * 4 + corner, glow.r, glow.g, glow.b)
      }
    })
    albedo.needsUpdate = true
    emission.needsUpdate = true
  }

  return { geometry, updatePlacement, updateMaterials }
}

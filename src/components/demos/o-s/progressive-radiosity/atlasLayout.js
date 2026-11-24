const MIN_ATLAS_WIDTH = 32
const MAX_ATLAS_WIDTH = 8192

const roundUp = (value, step) => Math.ceil(value / step) * step

// Each polygon owns a radiosity and a residual texture. Here they are tiles of one atlas,
// so a single draw updates every receiver. Tiles are a multiple of the shooter block so that a
// shooting element never straddles two polygons.
const sizeTile = (polygon, density, block) => ({
  width: roundUp(Math.max(polygon.width * density, 1), block),
  height: roundUp(Math.max(polygon.height * density, 1), block)
})

const packShelves = (tiles, order, atlasWidth) => {
  const placed = new Array(tiles.length)
  let x = 0
  let y = 0
  let shelfHeight = 0
  for (const index of order) {
    const tile = tiles[index]
    if (tile.width > atlasWidth) return null
    if (x + tile.width > atlasWidth) {
      x = 0
      y += shelfHeight
      shelfHeight = 0
    }
    placed[index] = { x, y, width: tile.width, height: tile.height }
    x += tile.width
    shelfHeight = Math.max(shelfHeight, tile.height)
  }
  return { placed, height: y + shelfHeight }
}

const toLayout = (packing, width, block) => {
  const height = roundUp(Math.max(packing.height, block), block)
  const texelCount = packing.placed.reduce((sum, tile) => sum + tile.width * tile.height, 0)
  return {
    width,
    height,
    block,
    gridWidth: width / block,
    gridHeight: height / block,
    tiles: packing.placed,
    texelCount
  }
}

export const createAtlasLayout = (polygons, density, block) => {
  const tiles = polygons.map((polygon) => sizeTile(polygon, density, block))
  const order = tiles.map((_, index) => index).sort((a, b) => tiles[b].height - tiles[a].height)

  for (let width = MIN_ATLAS_WIDTH; width <= MAX_ATLAS_WIDTH; width *= 2) {
    const packing = packShelves(tiles, order, width)
    if (packing && packing.height <= width) return toLayout(packing, width, block)
  }
  throw new Error('ProgressiveRadiosity: element density too high for one atlas')
}

// Shooting elements (substructuring): blocks of block × block texels. A shot uses the
// block's mean residual, which is the matching level of the residual mipmap.
export const createShooterCells = (polygons, layout) => {
  const { block, tiles, gridWidth } = layout
  const count = tiles.reduce((sum, tile) => sum + (tile.width / block) * (tile.height / block), 0)
  const cells = {
    count,
    gridIndex: new Int32Array(count),
    gridX: new Int32Array(count),
    gridY: new Int32Array(count),
    polygon: new Int32Array(count),
    s: new Float32Array(count),
    t: new Float32Array(count),
    area: new Float32Array(count),
    totalArea: 0
  }

  let cell = 0
  polygons.forEach((polygon, index) => {
    const tile = tiles[index]
    const columns = tile.width / block
    const rows = tile.height / block
    const area = (polygon.width * polygon.height) / (columns * rows)
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const gridX = tile.x / block + column
        const gridY = tile.y / block + row
        cells.gridIndex[cell] = gridY * gridWidth + gridX
        cells.gridX[cell] = gridX
        cells.gridY[cell] = gridY
        cells.polygon[cell] = index
        cells.s[cell] = (column + 0.5) / columns
        cells.t[cell] = (row + 0.5) / rows
        cells.area[cell] = area
        cells.totalArea += area
        cell++
      }
    }
  })
  return cells
}

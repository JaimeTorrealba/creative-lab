export const inBounds = (x, y, z, size) => {
  return x >= 0 && x < size.width && y >= 0 && y < size.height && z >= 0 && z < size.width
}
export const getBlock = (x, y, z, { data, size }) => {
  if (!inBounds(x, y, z, size)) return null
  return data.value[x][y][z]
}
export const setBlockId = (x, y, z, id, { data, size }) => {
  if (inBounds(x, y, z, size)) {
    data.value[x][y][z].id = id
  }
}
export const setBlockInstanceId = (x, y, z, instanceId, { data, size }) => {
  if (!inBounds(x, y, z, size)) return null
  data.value[x][y][z].instanceId = instanceId
}

export const isBlockObscured = (x, y, z, { data, size }) => {
  const up = getBlock(x, y + 1, z, { data, size })?.id ?? blocks.empty.id
  const down = getBlock(x, y - 1, z, { data, size })?.id ?? blocks.empty.id
  const left = getBlock(x + 1, y, z, { data, size })?.id ?? blocks.empty.id
  const right = getBlock(x - 1, y, z, { data, size })?.id ?? blocks.empty.id
  const forward = getBlock(x, y, z + 1, { data, size })?.id ?? blocks.empty.id
  const back = getBlock(x, y, z - 1, { data, size })?.id ?? blocks.empty.id

  // If any of the block's sides is exposed, it is not obscured
  if (
    up === blocks.empty.id ||
    down === blocks.empty.id ||
    left === blocks.empty.id ||
    right === blocks.empty.id ||
    forward === blocks.empty.id ||
    back === blocks.empty.id
  ) {
    return false
  } else {
    return true
  }
}

export const blocks = {
  empty: {
    id: 0,
    name: 'empty'
  },
  grass: {
    id: 1,
    name: 'grass',
    color: '#559020'
  },
  dirt: {
    id: 2,
    name: 'dirt',
    color: '#5b3c1d'
  }
}

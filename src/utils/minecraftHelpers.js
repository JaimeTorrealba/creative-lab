export const inBounds = (x, y, z, size) => {
  return x >= 0 && x < size.width && y >= 0 && y < size.height && z >= 0 && z < size.width
}
export const getBlock = (x, y, z, {data, size}) => {
  if (!inBounds(x, y, z, size)) return null
  return data.value[x][y][z]
}
export const setBlockId = (x, y, z, id, {data, size}) => {
  if (inBounds(x, y, z, size)) {
    data.value[x][y][z].id = id
  }
}
export const setBlockInstanceId = (x, y, z, instanceId, {data, size}) => {
  if (!inBounds(x, y, z, size)) return null
  data.value[x][y][z].instanceId = instanceId
}

import { Vector3 } from 'three'

export const SURFACE_COLORS = {
  white: '#bdb8ae',
  left: '#a8231a',
  right: '#2f7a26',
  light: '#d8d4cc'
}

const UP = new Vector3(0, 1, 0)
const LIGHT_HEIGHT = 1.995
const TALL_BOX = { size: [0.6, 1.2, 0.6], x: -0.42, z: -0.35, rotation: 0.32 }
const SHORT_BOX_SIZE = [0.6, 0.6, 0.6]
const STATIC_PLACEMENT = { x: 0, y: 0, z: 0, rotation: 0 }

// Every element of the scene is a planar rectangle: a corner plus two edge vectors, with
// cross(u, v) pointing to the side that receives and shoots light.
const createPolygon = ({ name, colorKey, group = 'static', emissive = false }, frame) => {
  const [origin, u, v] = frame.map((values) => new Vector3(...values))
  return {
    id: 0,
    name,
    colorKey,
    group,
    emissive,
    local: { origin, u, v },
    width: u.length(),
    height: v.length(),
    origin: new Vector3(),
    u: new Vector3(),
    v: new Vector3(),
    normal: new Vector3(),
    tangent: new Vector3(),
    bitangent: new Vector3()
  }
}

const WALL_FRAMES = {
  floor: ['white', [-1, 0, 1], [2, 0, 0], [0, 0, -2]],
  ceiling: ['white', [-1, 2, -1], [2, 0, 0], [0, 0, 2]],
  back: ['white', [-1, 0, -1], [2, 0, 0], [0, 2, 0]],
  left: ['left', [-1, 0, 1], [0, 0, -2], [0, 2, 0]],
  right: ['right', [1, 0, -1], [0, 0, 2], [0, 2, 0]]
}

const createWalls = () =>
  Object.entries(WALL_FRAMES).map(([name, [colorKey, ...frame]]) =>
    createPolygon({ name, colorKey }, frame)
  )

// Five faces; the bottom one rests on the floor and never sees or receives anything.
const createBoxFaces = (group, [width, height, depth]) => {
  const a = width / 2
  const c = depth / 2
  const faces = {
    px: [[a, 0, c], [0, 0, -2 * c], [0, height, 0]],
    nx: [[-a, 0, -c], [0, 0, 2 * c], [0, height, 0]],
    pz: [[-a, 0, c], [2 * a, 0, 0], [0, height, 0]],
    nz: [[a, 0, -c], [-2 * a, 0, 0], [0, height, 0]],
    top: [[-a, height, c], [2 * a, 0, 0], [0, 0, -2 * c]]
  }
  return Object.entries(faces).map(([side, frame]) =>
    createPolygon({ name: `${group}-${side}`, colorKey: 'white', group }, frame)
  )
}

const createLight = () =>
  createPolygon({ name: 'light', colorKey: 'light', group: 'light', emissive: true }, [
    [-0.3, 0, -0.25],
    [0.6, 0, 0],
    [0, 0, 0.5]
  ])

const offset = new Vector3()

const placePolygon = (polygon, { x, y = 0, z, rotation = 0 }) => {
  const { local } = polygon
  offset.set(x, y, z)
  polygon.origin.copy(local.origin).applyAxisAngle(UP, rotation).add(offset)
  polygon.u.copy(local.u).applyAxisAngle(UP, rotation)
  polygon.v.copy(local.v).applyAxisAngle(UP, rotation)
  polygon.normal.crossVectors(polygon.u, polygon.v).normalize()
  polygon.tangent.copy(polygon.u).normalize()
  polygon.bitangent.crossVectors(polygon.normal, polygon.tangent)
}

export const createRadiosityScene = () => {
  const polygons = [
    ...createWalls(),
    ...createBoxFaces('tallBox', TALL_BOX.size),
    ...createBoxFaces('shortBox', SHORT_BOX_SIZE),
    createLight()
  ]
  polygons.forEach((polygon, index) => (polygon.id = index))

  const placements = {
    static: STATIC_PLACEMENT,
    tallBox: TALL_BOX,
    shortBox: { x: 0, z: 0, rotation: 0 },
    light: { x: 0, y: LIGHT_HEIGHT, z: 0 }
  }

  const setPlacements = ({ light, shortBox }) => {
    Object.assign(placements.light, light)
    Object.assign(placements.shortBox, shortBox)
    polygons.forEach((polygon) => placePolygon(polygon, placements[polygon.group]))
  }

  return { polygons, setPlacements }
}

import {
  BoxGeometry,
  BufferAttribute,
  Color,
  Mesh,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  Vector3
} from 'three'
import { createPointSet } from './pointSet'

export const BOX_CENTER = new Vector3(0, 1, 0)
export const BOX_RADIUS = 1.75
export const LIGHT_HEIGHT = 1.96
const WALL_SEGMENTS = 32
const SPHERE_RADIUS = 0.25

export const SURFACE_COLORS = {
  white: '#bdb8ae',
  left: '#a8231a',
  right: '#2f7a26',
  sphere: '#d6a24a'
}

const createWall = (rotate, offset) => {
  const geometry = new PlaneGeometry(2, 2, WALL_SEGMENTS, WALL_SEGMENTS)
  rotate(geometry)
  return geometry.translate(offset[0], offset[1], offset[2])
}

const TALL_BOX = { size: [0.6, 1.2, 0.6], rotation: 0.32, center: [-0.45, 0.6, -0.4] }

const createTallBox = () =>
  new BoxGeometry(...TALL_BOX.size, 4, 8, 4)
    .rotateY(TALL_BOX.rotation)
    .translate(...TALL_BOX.center)

// Floor vertices buried under the tall box would gather the open room straight through its
// (culled) inner faces and glow along the base. Flagging them as empty leaves them dark, which is
// what interpolates into the contact shadow of the first pass.
const isInsideTallBox = (point) => {
  const [cx, cy, cz] = TALL_BOX.center
  const [sx, sy, sz] = TALL_BOX.size.map((size) => size / 2 - 0.002)
  const cos = Math.cos(TALL_BOX.rotation)
  const sin = Math.sin(TALL_BOX.rotation)
  const dx = point.x - cx
  const dz = point.z - cz
  const localX = cos * dx - sin * dz
  const localZ = sin * dx + cos * dz
  return Math.abs(localX) < sx && Math.abs(point.y - cy) < sy && Math.abs(localZ) < sz
}

// A thin closed slab rather than a plane: layers keep only faces that look back at the ray, so
// the panel needs a top face of its own to block rays coming up from the ceiling around it.
const createLightPanel = () => new BoxGeometry(0.5, 0.01, 0.4)

const wall = (name, color, rotate, offset) => ({
  name,
  color,
  build: () => createWall(rotate, offset)
})

const SURFACES = [
  wall('floor', 'white', (g) => g.rotateX(-Math.PI / 2), [0, 0, 0]),
  wall('ceiling', 'white', (g) => g.rotateX(Math.PI / 2), [0, 2, 0]),
  wall('back', 'white', () => {}, [0, 1, -1]),
  wall('left', 'left', (g) => g.rotateY(Math.PI / 2), [-1, 1, 0]),
  wall('right', 'right', (g) => g.rotateY(-Math.PI / 2), [1, 1, 0]),
  { name: 'tallBox', color: 'white', build: createTallBox },
  {
    name: 'sphere',
    color: 'sphere',
    dynamic: true,
    build: () => new SphereGeometry(SPHERE_RADIUS, 40, 28)
  },
  { name: 'light', color: 'white', dynamic: true, emissive: true, build: createLightPanel }
]

const fillAlbedo = (geometry, hex) => {
  const color = new Color(hex)
  const albedo = geometry.getAttribute('albedo')
  for (let i = 0; i < albedo.count; i++) albedo.setXYZ(i, color.r, color.g, color.b)
  albedo.needsUpdate = true
}

const addSurfaceAttributes = (geometry, surface) => {
  const count = geometry.getAttribute('position').count
  geometry.setAttribute('albedo', new BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute(
    'emission',
    new BufferAttribute(new Float32Array(count).fill(surface.emissive ? 1 : 0), 1)
  )
  fillAlbedo(geometry, SURFACE_COLORS[surface.color])
}

const createSurfaceMesh = (surface) => {
  const geometry = surface.build()
  addSurfaceAttributes(geometry, surface)
  const mesh = new Mesh(geometry)
  mesh.name = surface.name
  mesh.frustumCulled = false
  mesh.userData = { colorKey: surface.color, dynamic: Boolean(surface.dynamic) }
  return mesh
}

export const createCornellScene = () => {
  const scene = new Scene()
  const meshes = SURFACES.map(createSurfaceMesh)
  meshes.forEach((mesh) => scene.add(mesh))

  const byName = Object.fromEntries(meshes.map((mesh) => [mesh.name, mesh]))
  const sphere = byName.sphere
  const lightPanel = byName.light
  const lightPosition = new Vector3(0, LIGHT_HEIGHT, 0)

  const points = createPointSet(meshes, isInsideTallBox)

  const setSurfaceColor = (colorKey, hex) => {
    SURFACE_COLORS[colorKey] = hex
    meshes
      .filter((mesh) => mesh.userData.colorKey === colorKey)
      .forEach((mesh) => fillAlbedo(mesh.geometry, hex))
  }

  const placeSphere = (time) => {
    const angle = time * 0.9
    const hop = Math.abs(Math.sin(time * 2.1))
    sphere.position.set(
      0.4 + Math.cos(angle) * 0.22,
      SPHERE_RADIUS + hop * 0.45,
      0.3 + Math.sin(angle) * 0.22
    )
  }

  const placeLight = (time, sway) => {
    const x = sway ? Math.sin(time * 0.5) * 0.4 : 0
    lightPanel.position.set(x, 1.985, 0)
    lightPosition.set(x, LIGHT_HEIGHT, 0)
  }

  const updateDynamicPoints = () => {
    sphere.updateMatrixWorld()
    lightPanel.updateMatrixWorld()
    points.refreshDynamic()
  }

  const dispose = () => {
    meshes.forEach((mesh) => mesh.geometry.dispose())
    points.dispose()
  }

  return {
    scene,
    meshes,
    points,
    lightPanel,
    lightPosition,
    setSurfaceColor,
    placeSphere,
    placeLight,
    updateDynamicPoints,
    dispose
  }
}

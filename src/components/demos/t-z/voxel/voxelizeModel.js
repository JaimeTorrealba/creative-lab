import { Box3, Color, DoubleSide, Mesh, Raycaster, Vector3 } from 'three'

const RAY_DIRECTION = new Vector3(0, 0, 1)
const rayCaster = new Raycaster()

export const fitModelToSize = (scene, modelSize) => {
  const boundingBox = new Box3().setFromObject(scene)
  const scaleFactor = modelSize / boundingBox.getSize(new Vector3()).length()
  scene.scale.multiplyScalar(scaleFactor)
  scene.position.copy(boundingBox.getCenter(new Vector3()).multiplyScalar(-scaleFactor))
  scene.updateMatrixWorld(true)
}

const getMeshMaterials = (mesh) => [mesh.material].flat()

const getVoxelColor = (mesh) => {
  const { h, s, l } = getMeshMaterials(mesh)[0].color.getHSL({ h: 0, s: 0, l: 0 })
  return new Color().setHSL(h, s * 0.8, l * 0.8 + 0.2)
}

// Parity test needs both entry and exit hits, so every face must be raycastable
const collectVoxelSources = (scene) => {
  const sources = []
  scene.traverse((child) => {
    if (!(child instanceof Mesh)) return
    getMeshMaterials(child).forEach((material) => (material.side = DoubleSide))
    sources.push({ mesh: child, color: getVoxelColor(child) })
  })
  return sources
}

const isInsideMesh = (position, mesh) => {
  rayCaster.set(position, RAY_DIRECTION)
  return rayCaster.intersectObject(mesh, false).length % 2 === 1
}

export const voxelizeModel = (scene, gridSize) => {
  const sources = collectVoxelSources(scene)
  const boundingBox = new Box3().setFromObject(scene)
  boundingBox.min.y += 0.5 * gridSize
  const { min, max } = boundingBox
  const voxels = []

  for (let x = min.x; x < max.x; x += gridSize) {
    for (let y = min.y; y < max.y; y += gridSize) {
      for (let z = min.z; z < max.z; z += gridSize) {
        const position = new Vector3(x, y, z)
        const source = sources.find(({ mesh }) => isInsideMesh(position, mesh))
        if (source) voxels.push({ position, color: source.color })
      }
    }
  }
  return voxels
}

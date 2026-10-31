import {
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshLambertMaterial,
  TorusGeometry,
  TorusKnotGeometry
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { fitModelToSize } from './voxelizeModel'

// Raycasting cost grows with triangle count, so primitives stay low-poly
export const VOXEL_MODELS = [
  { name: 'Fantasy house', url: '/models/Fantasy House.glb' },
  { name: 'House', url: '/models/House.glb' },
  { name: 'Map marker', url: '/models/Map_Marker.glb' },
  {
    name: 'Torus knot',
    createGeometry: () => new TorusKnotGeometry(1, 0.35, 96, 12),
    color: '#ff6b9a'
  },
  { name: 'Torus', createGeometry: () => new TorusGeometry(1, 0.4, 32, 64), color: '#ffd54f' },
  { name: 'Gem', createGeometry: () => new IcosahedronGeometry(1, 0), color: '#4fc3f7' }
]

const gltfLoader = new GLTFLoader()

const createPrimitiveScene = ({ createGeometry, color }) => {
  const scene = new Group()
  scene.add(new Mesh(createGeometry(), new MeshLambertMaterial({ color })))
  return scene
}

const loadModelScene = async (model) => {
  if (!model.url) return createPrimitiveScene(model)
  const { scene } = await gltfLoader.loadAsync(model.url)
  return scene
}

const loadVoxelModel = async (model, modelSize) => {
  const scene = await loadModelScene(model)
  fitModelToSize(scene, modelSize)
  return { name: model.name, scene }
}

export const loadVoxelModels = (modelSize) =>
  Promise.all(VOXEL_MODELS.map((model) => loadVoxelModel(model, modelSize)))

export const disposeVoxelModels = (models) => {
  models.forEach(({ scene }) =>
    scene.traverse((child) => {
      child.geometry?.dispose()
      ;[child.material].flat().forEach((material) => material?.dispose())
    })
  )
}

import {
  AnimationMixer,
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const GRID_SPACING = 2.6
const HALF_SPACING = GRID_SPACING / 2

// 2x2 on the floor: the short primitives up front so they don't hide the taller models
export const SUBJECT_LAYOUT = [
  { key: 'avatar', position: [-HALF_SPACING, 0, -HALF_SPACING] },
  { key: 'ant', position: [HALF_SPACING, 0, -HALF_SPACING], rotationY: -Math.PI / 4 },
  { key: 'box', position: [-HALF_SPACING, 0, HALF_SPACING], rotationY: Math.PI / 6 },
  { key: 'sphere', position: [HALF_SPACING, 0, HALF_SPACING] }
]

const createCharcoalMaterial = () =>
  new MeshStandardMaterial({ color: '#2b231e', roughness: 0.85, metalness: 0.05 })

const BOX_SIZE = 1.1
const BOX_SEGMENTS = 10
const SPHERE_RADIUS = 0.65

const createBoxSubject = () => {
  const segments = [BOX_SEGMENTS, BOX_SEGMENTS, BOX_SEGMENTS]
  const geometry = new BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE, ...segments)
  const mesh = new Mesh(geometry, createCharcoalMaterial())
  mesh.position.y = BOX_SIZE / 2
  return { model: mesh, mixer: null }
}

const createSphereSubject = () => {
  const mesh = new Mesh(new SphereGeometry(SPHERE_RADIUS, 48, 32), createCharcoalMaterial())
  mesh.position.y = SPHERE_RADIUS
  return { model: mesh, mixer: null }
}

// Scales the model so its largest side matches targetSize and stands it on y = 0
const fitModelToFloor = (model, targetSize) => {
  model.updateMatrixWorld(true)
  const bounds = new Box3().setFromObject(model)
  const size = bounds.getSize(new Vector3())
  const scale = targetSize / Math.max(size.x, size.y, size.z)
  const center = bounds.getCenter(new Vector3())

  model.scale.multiplyScalar(scale)
  model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
}

const createLoopingMixer = (model, animations) => {
  if (!animations.length) return null
  const mixer = new AnimationMixer(model)
  mixer.clipAction(animations[0]).play()
  return mixer
}

const gltfLoader = new GLTFLoader()

const createModelSubjectLoader = (path, targetSize) => async () => {
  const gltf = await gltfLoader.loadAsync(path)
  const model = gltf.scene
  fitModelToFloor(model, targetSize)
  return { model, mixer: createLoopingMixer(model, gltf.animations) }
}

const SUBJECT_BUILDERS = {
  box: createBoxSubject,
  sphere: createSphereSubject,
  avatar: createModelSubjectLoader('/models/jaimeAvatar.glb', 1.7),
  ant: createModelSubjectLoader('/models/ant.glb', 1.6)
}

const placeSubject = async ({ key, position, rotationY = 0 }) => {
  const { model, mixer } = await SUBJECT_BUILDERS[key]()
  const root = new Group()
  root.add(model)
  root.position.set(...position)
  root.rotation.y = rotationY
  return { key, root, mixer }
}

export const createSubjects = () => Promise.all(SUBJECT_LAYOUT.map(placeSubject))

const disposeMaterial = (material) => {
  const materials = Array.isArray(material) ? material : [material]
  materials.forEach((entry) => entry.dispose())
}

export const disposeSubject = ({ root, mixer }) => {
  mixer?.stopAllAction()
  root.traverse((child) => {
    if (!child.isMesh) return
    child.geometry.dispose()
    disposeMaterial(child.material)
  })
  root.removeFromParent()
}

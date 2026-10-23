import {
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshPhysicalNodeMaterial,
  MeshStandardNodeMaterial,
  Path,
  RingGeometry,
  Shape,
  TorusGeometry
} from 'three/webgpu'
import { float, mix } from 'three/tsl'

// 1 unit = 50 mm, so the 120 mm Red Book disc is 1.2 units across its radius
export const DISC = {
  holeRadius: 0.15,
  stackingRingRadius: 0.34,
  metalStart: 0.4,
  dataStart: 0.46,
  metalEnd: 1.18,
  outerRadius: 1.2,
  thickness: 0.024,
  bevel: 0.004
}

const createBodyGeometry = () => {
  const shape = new Shape().absarc(0, 0, DISC.outerRadius - DISC.bevel, 0, Math.PI * 2)
  shape.holes.push(new Path().absarc(0, 0, DISC.holeRadius + DISC.bevel, 0, Math.PI * 2, true))
  const geometry = new ExtrudeGeometry(shape, {
    depth: DISC.thickness - DISC.bevel * 2,
    bevelThickness: DISC.bevel,
    bevelSize: DISC.bevel,
    bevelSegments: 4,
    curveSegments: 192
  })
  geometry.translate(0, 0, -(DISC.thickness / 2 - DISC.bevel))
  return geometry
}

const createPolycarbonateMaterial = () =>
  new MeshPhysicalNodeMaterial({
    color: '#ffffff',
    metalness: 0,
    roughness: 0.03,
    transmission: 1,
    thickness: DISC.thickness,
    ior: 1.58
  })

const createMetalMaterial = (uniforms, diffractionNode, dataMaskNode) => {
  const material = new MeshStandardNodeMaterial({ metalness: 1 })
  material.colorNode = uniforms.tint
  material.roughnessNode = mix(float(0.07), float(0.15), dataMaskNode)
  material.emissiveNode = diffractionNode
  return material
}

const createLabelMaterial = (labelTexture) =>
  new MeshStandardNodeMaterial({ map: labelTexture, roughness: 0.55, metalness: 0 })

const createDiscMeshes = ({ uniforms, diffractionNode, dataMaskNode, labelTexture }) => {
  const body = new Mesh(createBodyGeometry(), createPolycarbonateMaterial())

  const stackingRing = new Mesh(
    new TorusGeometry(DISC.stackingRingRadius, 0.005, 12, 160),
    body.material
  )
  stackingRing.position.z = DISC.thickness / 2

  // The reflective layer sits under the label, seen through 1.2 mm of polycarbonate
  const metal = new Mesh(
    new RingGeometry(DISC.metalStart, DISC.metalEnd, 256, 1),
    createMetalMaterial(uniforms, diffractionNode, dataMaskNode)
  )
  metal.position.z = -DISC.thickness / 2 + 0.003

  const label = new Mesh(
    new RingGeometry(DISC.metalStart, DISC.metalEnd, 256, 1),
    createLabelMaterial(labelTexture)
  )
  label.rotation.y = Math.PI
  label.position.z = -DISC.thickness / 2 - 0.0005

  return [body, stackingRing, metal, label]
}

export const createDisc = (options) => {
  const spin = new Group()
  const meshes = createDiscMeshes(options)
  spin.add(...meshes)
  const disposeDisc = () =>
    meshes.forEach((mesh) => {
      mesh.geometry.dispose()
      mesh.material.dispose()
    })
  return { spin, disposeDisc }
}

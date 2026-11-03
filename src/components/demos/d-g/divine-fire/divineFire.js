import { AdditiveBlending, DoubleSide, Mesh, ShaderMaterial, SkinnedMesh, Uniform } from 'three'
import { gsap } from 'gsap'
import { createWeldedOverlayGeometry } from './overlayGeometry'
import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'

const OVERLAY_RENDER_ORDER = 1

const createFireMaterial = (sharedUniforms, intensityUniform) =>
  new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { ...sharedUniforms, uIntensity: intensityUniform },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide
  })

const createOverlayMesh = (sourceMesh, material) => {
  const geometry = createWeldedOverlayGeometry(sourceMesh.geometry)
  if (!sourceMesh.isSkinnedMesh) return new Mesh(geometry, material)

  const overlay = new SkinnedMesh(geometry, material)
  overlay.bind(sourceMesh.skeleton, sourceMesh.bindMatrix)
  return overlay
}

// Parented to the source with an identity transform, so it shares its matrixWorld (and with
// it the skinning bind space) and follows every move without extra syncing.
const attachOverlay = (sourceMesh, material) => {
  const overlay = createOverlayMesh(sourceMesh, material)
  overlay.userData.isFireOverlay = true
  overlay.frustumCulled = false
  overlay.renderOrder = OVERLAY_RENDER_ORDER
  sourceMesh.add(overlay)
  return overlay
}

const collectSourceMeshes = (root) => {
  const meshes = []
  root.traverse((child) => {
    if (child.isMesh && !child.userData.isFireOverlay) meshes.push(child)
  })
  return meshes
}

const detachOverlay = (overlay) => {
  overlay.removeFromParent()
  overlay.geometry.dispose()
}

export const applyDivineFire = (root, sharedUniforms) => {
  const intensity = new Uniform(0)
  const material = createFireMaterial(sharedUniforms, intensity)
  const overlays = collectSourceMeshes(root).map((mesh) => attachOverlay(mesh, material))

  const dispose = () => {
    gsap.killTweensOf(intensity)
    overlays.forEach(detachOverlay)
    material.dispose()
  }

  return { root, intensity, material, overlays, dispose }
}

export const igniteFire = (fire, duration) => {
  gsap.killTweensOf(fire.intensity)
  return gsap.to(fire.intensity, { value: 1, duration, ease: 'power2.out' })
}

export const extinguishFire = (fire, duration) => {
  gsap.killTweensOf(fire.intensity)
  return gsap.to(fire.intensity, { value: 0, duration, ease: 'power2.in' })
}

export const setFireWireframe = (fire, wireframe) => {
  fire.material.wireframe = wireframe
}

const setMaterialVisibility = (material, visible) => {
  const materials = Array.isArray(material) ? material : [material]
  materials.forEach((entry) => (entry.visible = visible))
}

// Hiding the source mesh itself would hide its overlay child too, so only its material goes
export const setSourceVisibility = (fire, visible) => {
  collectSourceMeshes(fire.root).forEach((mesh) => setMaterialVisibility(mesh.material, visible))
}

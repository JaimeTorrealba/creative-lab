import { Raycaster, Vector2 } from 'three'

const PRIMARY_BUTTON = 0

// Left-drag on the mesh strokes, anywhere else orbits. The capture listener runs before
// OrbitControls' own pointerdown on the same canvas, so stopping it there keeps the camera still.
export const createSurfacePointer = ({ domElement, getCamera, getMesh, onHover, onStroke, onStrokeEnd }) => {
  const raycaster = new Raycaster()
  const ndc = new Vector2()
  let strokeActive = false

  const pickSurface = (event) => {
    const camera = getCamera()
    const mesh = getMesh()
    if (!camera || !mesh) return null
    const rect = domElement.getBoundingClientRect()
    ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
    raycaster.setFromCamera(ndc, camera)
    const [hit] = raycaster.intersectObject(mesh, false)
    if (!hit) return null
    return { point: hit.point, localPoint: mesh.worldToLocal(hit.point.clone()), hit }
  }

  const handlePointerDown = (event) => {
    if (event.button !== PRIMARY_BUTTON) return
    const surfaceHit = pickSurface(event)
    if (!surfaceHit) return
    event.stopImmediatePropagation()
    strokeActive = true
    domElement.setPointerCapture(event.pointerId)
    onStroke(surfaceHit, true)
  }

  const handlePointerMove = (event) => {
    const surfaceHit = pickSurface(event)
    onHover(surfaceHit)
    if (strokeActive && surfaceHit) onStroke(surfaceHit, false)
  }

  const handlePointerUp = (event) => {
    if (!strokeActive) return
    strokeActive = false
    if (domElement.hasPointerCapture(event.pointerId)) domElement.releasePointerCapture(event.pointerId)
    onStrokeEnd?.()
  }

  const handlePointerLeave = () => onHover(null)

  domElement.addEventListener('pointerdown', handlePointerDown, { capture: true })
  domElement.addEventListener('pointermove', handlePointerMove)
  domElement.addEventListener('pointerup', handlePointerUp)
  domElement.addEventListener('pointercancel', handlePointerUp)
  domElement.addEventListener('pointerleave', handlePointerLeave)

  const dispose = () => {
    domElement.removeEventListener('pointerdown', handlePointerDown, { capture: true })
    domElement.removeEventListener('pointermove', handlePointerMove)
    domElement.removeEventListener('pointerup', handlePointerUp)
    domElement.removeEventListener('pointercancel', handlePointerUp)
    domElement.removeEventListener('pointerleave', handlePointerLeave)
  }

  return { dispose, isStrokeActive: () => strokeActive }
}

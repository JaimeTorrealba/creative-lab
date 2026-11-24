import { MathUtils, Quaternion, Vector3 } from 'three'
import { hexToSrgbBytes } from './paintLayer'
import { MAX_SOURCES } from './liquidSimulation'
import { TOOL } from './texturesPane'

const DAB_SPACING = 0.3

// Left-drag strokes: the brush lays dabs spaced along the drag so fast strokes stay continuous;
// the pour tool keeps a source under the pointer while the button is held.
export const createDonutTools = ({ params, surface }) => {
  const lastDab = new Vector3()
  const dabPoint = new Vector3()
  let pourPoint = null

  const brushSettings = () => ({
    radius: params.brushRadius,
    opacity: params.brushOpacity,
    hardness: params.brushHardness,
    color: hexToSrgbBytes(params.brushColor),
    erase: params.erase
  })

  const brushStroke = (localPoint, isStart) => {
    const brush = brushSettings()
    if (isStart) {
      surface.paintDab(localPoint, brush)
      lastDab.copy(localPoint)
      return
    }
    const spacing = brush.radius * DAB_SPACING
    const distance = lastDab.distanceTo(localPoint)
    for (let travelled = spacing; travelled <= distance; travelled += spacing) {
      surface.paintDab(dabPoint.lerpVectors(lastDab, localPoint, travelled / distance), brush)
    }
    if (distance >= spacing) lastDab.lerp(localPoint, (Math.floor(distance / spacing) * spacing) / distance)
  }

  const handleStroke = ({ localPoint }, isStart) => {
    if (params.tool === TOOL.BRUSH) brushStroke(localPoint, isStart)
    else pourPoint = localPoint
  }

  const endStroke = () => {
    pourPoint = null
  }

  const cursorRadius = () => (params.tool === TOOL.BRUSH ? params.brushRadius : params.pourRadius)

  return { handleStroke, endStroke, cursorRadius, getPourPoint: () => pourPoint }
}

// Tilt/tumble the donut and express world-down gravity in its object space, where the leaf
// positions and normals live.
export const createDonutOrientation = (donut) => {
  const gravity = new Vector3(0, -1, 0)
  const up = new Vector3(0, 1, 0)
  const inverseRotation = new Quaternion()
  let tumbleAngle = 0

  const update = (params, delta) => {
    if (params.tumble) tumbleAngle += delta * params.tumbleSpeed
    donut.rotation.set(
      -Math.PI / 2 + MathUtils.degToRad(params.tiltX) + tumbleAngle,
      0,
      MathUtils.degToRad(params.tiltZ)
    )
    donut.updateMatrixWorld()
    donut.getWorldQuaternion(inverseRotation).invert()
    gravity.set(0, -1, 0).applyQuaternion(inverseRotation)
    up.copy(gravity).negate()
  }

  return { gravity, up, update }
}

// Liquid sources for this frame: the pour under the pointer plus any rain drops due.
export const createLiquidSources = ({ params, surface, tools, up }) => {
  let pendingDrops = 0

  return (delta) => {
    const sources = []
    const pourPoint = tools.getPourPoint()
    if (pourPoint) sources.push([pourPoint.x, pourPoint.y, pourPoint.z, params.pourRate * delta])
    if (!params.rain) return sources
    pendingDrops += params.rainRate * delta
    while (pendingDrops >= 1 && sources.length < MAX_SOURCES) {
      pendingDrops -= 1
      const drop = surface.pickRainPoint(up)
      if (drop) sources.push([...drop, params.rainAmount])
    }
    pendingDrops = Math.min(pendingDrops, 1)
    return sources
  }
}

const VUP = [0, 1, 0]
// Radians of turn per pixel of mouse movement at a 60° vfov; scaled with vfov so a narrow,
// zoomed-in view (the book's 20°) doesn't swing wildly.
const LOOK_SENSITIVITY = 0.003
const MAX_PITCH = (89 * Math.PI) / 180
const MAX_FRAME_SECONDS = 0.1

// Each key adds +1/-1 to one movement axis. Q/E move along world up.
const KEY_AXES = {
  KeyW: ['forward', 1],
  KeyS: ['forward', -1],
  KeyD: ['right', 1],
  KeyA: ['right', -1],
  KeyQ: ['up', 1],
  KeyE: ['up', -1]
}

const normalizeVector = (v) => {
  const length = Math.hypot(...v)
  return length > 0 ? v.map((component) => component / length) : v
}

const getForwardByAngles = (yaw, pitch) => [
  Math.cos(pitch) * Math.sin(yaw),
  Math.sin(pitch),
  -Math.cos(pitch) * Math.cos(yaw)
]

const getAxesByKeys = (pressedKeys) => {
  const axes = { forward: 0, right: 0, up: 0 }
  pressedKeys.forEach((code) => {
    const [axis, sign] = KEY_AXES[code]
    axes[axis] += sign
  })
  return axes
}

// WASD walk on the horizontal plane (W/S along the view direction, A/D sideways), Q/E go up
// and down, and with the pointer locked the mouse turns the view.
const getMoveByAxes = (yaw, { forward, right, up }) =>
  normalizeVector([
    forward * Math.sin(yaw) + right * Math.cos(yaw),
    up,
    -forward * Math.cos(yaw) + right * Math.sin(yaw)
  ])

const isTypingTarget = (target) => target?.closest?.('input, textarea, select') != null

// Click `element` to lock the pointer; Esc releases it (browser default).
export const createFlyCamera = ({ element, lookfrom, lookat, onPointerLockChange }) => {
  const position = [...lookfrom]
  const direction = normalizeVector(lookat.map((value, axis) => value - lookfrom[axis]))
  let yaw = Math.atan2(direction[0], -direction[2])
  let pitch = Math.asin(direction[1])
  const pressedKeys = new Set()
  const pendingLook = { x: 0, y: 0 }

  const isPointerLocked = () => document.pointerLockElement === element

  const handleClick = () => {
    if (!isPointerLocked()) element.requestPointerLock()
  }
  const handlePointerLockChange = () => onPointerLockChange?.(isPointerLocked())
  const handleMouseMove = (event) => {
    if (!isPointerLocked()) return
    pendingLook.x += event.movementX
    pendingLook.y += event.movementY
  }
  const handleKeyDown = (event) => {
    if (!(event.code in KEY_AXES) || isTypingTarget(event.target)) return
    pressedKeys.add(event.code)
  }
  const handleKeyUp = (event) => pressedKeys.delete(event.code)
  const handleBlur = () => pressedKeys.clear()

  element.addEventListener('click', handleClick)
  document.addEventListener('pointerlockchange', handlePointerLockChange)
  document.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  window.addEventListener('blur', handleBlur)

  const applyLook = (vfov) => {
    if (!pendingLook.x && !pendingLook.y) return false
    const sensitivity = (LOOK_SENSITIVITY * vfov) / 60
    yaw += pendingLook.x * sensitivity
    pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch - pendingLook.y * sensitivity))
    pendingLook.x = 0
    pendingLook.y = 0
    return true
  }

  const applyMove = (deltaSeconds, move_speed) => {
    const move = getMoveByAxes(yaw, getAxesByKeys(pressedKeys))
    if (!move.some(Boolean)) return false
    const distance = move_speed * Math.min(deltaSeconds, MAX_FRAME_SECONDS)
    move.forEach((component, axis) => (position[axis] += component * distance))
    return true
  }

  // Returns true when the view changed this frame.
  const update = (deltaSeconds, { move_speed, vfov }) => {
    const hasLooked = applyLook(vfov)
    const hasMoved = applyMove(deltaSeconds, move_speed)
    return hasLooked || hasMoved
  }

  // The book's camera only uses lookat for the view direction, so one unit ahead is enough.
  const getView = () => {
    const forward = getForwardByAngles(yaw, pitch)
    return {
      lookfrom: [...position],
      lookat: position.map((value, axis) => value + forward[axis]),
      vup: VUP
    }
  }

  const dispose = () => {
    if (isPointerLocked()) document.exitPointerLock()
    element.removeEventListener('click', handleClick)
    document.removeEventListener('pointerlockchange', handlePointerLockChange)
    document.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('blur', handleBlur)
  }

  return { update, getView, dispose }
}

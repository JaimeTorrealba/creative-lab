export const onMove = (moveMethods, forward, sideward) => {
  if (forward > 0.15 && forward < 0.25) {
    moveMethods.applyCreep()
  } else if (forward > 0.9) {
    moveMethods.applyRun()
  } else if (forward > 0.3 && forward < 0.9) {
    moveMethods.stopCreep()
    moveMethods.stopRun()
    moveMethods.moveForward()
  } else if (forward < -0.15) {
    moveMethods.moveBackward()
  }
  if (sideward > 0.3) {
    moveMethods.moveRightward()
  } else if (sideward < -0.3) {
    moveMethods.moveLeftward()
  }
}

export const endTouch = (moveMethods, domElement, origin) => {
  if ('ontouchstart' in window) {
    document.ontouchmove = null
    document.ontouchend = null
  } else {
    document.onmousemove = null
    document.onmouseup = null
  }
  domElement.style.top = `${origin.top}px`
  domElement.style.left = `${origin.left}px`

  moveMethods.stopCreep()
  moveMethods.stopRun()
  moveMethods.stopForward()
  moveMethods.stopSideward()
}

export const getMousePosition = (evt) => {
  let clientX = evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX
  let clientY = evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY
  return { x: clientX, y: clientY }
}

export const startTouch = (moveMethods, evt, offset, domElement, maxRadius, origin) => {
    evt = evt || window.event
    // get the mouse cursor position at startup:
    const _offset = getMousePosition(evt)
    offset.x = _offset.x
    offset.y = _offset.y
    if ('ontouchstart' in window) {
      domElement.ontouchmove = (evt) => move(moveMethods, evt,offset, domElement, maxRadius, origin)
      domElement.ontouchend = () => endTouch(moveMethods, domElement, origin)
    } else {
      domElement.onmousemove = (evt) => move(moveMethods, evt, offset, domElement, maxRadius, origin)
      domElement.onmouseup = () => endTouch(moveMethods, domElement, origin)
    }
  }

export const move = (moveMethods, evt, offset, domElement, maxRadius, origin) => {
  const mouse = getMousePosition(evt)
  // calculate the new cursor position:
  let left = mouse.x - offset.x
  let top = mouse.y - offset.y

  const sqMag = left * left + top * top
  const maxRadiusSquared = maxRadius * maxRadius
  if (sqMag > maxRadiusSquared) {
    //Only use sqrt if essential
    const magnitude = Math.sqrt(sqMag)
    left /= magnitude
    top /= magnitude
    left *= maxRadius
    top *= maxRadius
  }

  // set the element's new position:
  domElement.style.top = `${top + domElement.clientHeight / 2}px`
  domElement.style.left = `${left + domElement.clientWidth / 2}px`

  const forward = -(top - origin.top + domElement.clientHeight / 2) / maxRadius
  const sideward = (left - origin.left + domElement.clientWidth / 2) / maxRadius

  onMove(moveMethods, forward, sideward)
}

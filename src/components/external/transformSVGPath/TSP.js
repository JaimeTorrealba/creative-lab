import * as THREE from 'three'
function transformSVGPath(pathStr) {
  const DIGIT_0 = 48,
    DIGIT_9 = 57,
    COMMA = 44,
    SPACE = 32,
    PERIOD = 46,
    MINUS = 45
  const DEGS_TO_RADS = Math.PI / 180.0

  var path = new THREE.Shape()

  var idx = 1,
    len = pathStr.length,
    activeCmd,
    x = 0,
    y = 0,
    nx = 0,
    ny = 0,
    firstX = null,
    firstY = null,
    x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0,
    rx = 0,
    ry = 0,
    xar = 0,
    laf = 0,
    sf = 0,
    cx,
    cy

  function eatNum() {
    var sidx,
      c,
      isFloat = false,
      s
    // eat delims
    while (idx < len) {
      c = pathStr.charCodeAt(idx)
      if (c !== COMMA && c !== SPACE) break
      idx++
    }
    if (c === MINUS) sidx = idx++
    else sidx = idx
    // eat number
    while (idx < len) {
      c = pathStr.charCodeAt(idx)
      if (DIGIT_0 <= c && c <= DIGIT_9) {
        idx++
        continue
      } else if (c === PERIOD) {
        idx++
        isFloat = true
        continue
      }

      s = pathStr.substring(sidx, idx)
      return isFloat ? parseFloat(s) : parseInt(s)
    }

    s = pathStr.substring(sidx)
    return isFloat ? parseFloat(s) : parseInt(s)
  }

  function nextIsNum() {
    var c
    // do permanently eat any delims...
    while (idx < len) {
      c = pathStr.charCodeAt(idx)
      if (c !== COMMA && c !== SPACE) break
      idx++
    }
    c = pathStr.charCodeAt(idx)
    return c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9)
  }

  function eatAbsoluteArc() {
    rx = eatNum()
    ry = eatNum()
    xar = eatNum() * DEGS_TO_RADS
    laf = eatNum()
    sf = eatNum()
    nx = eatNum()
    ny = eatNum()

    if (activeCmd == 'a') {
      // relative
      nx += x
      ny += y
    }

    console.debug(
      '[SVGPath2ThreeShape.eatAbsoluteArc] Read arc params: rx=' +
        rx +
        ', ry=' +
        ry +
        ', xar=' +
        xar +
        ', laf=' +
        laf +
        ', sf=' +
        sf +
        ', nx=' +
        nx +
        ', ny=' +
        ny
    )
    if (rx !== ry) {
      console.warn('Forcing elliptical arc to be a circular one :(', rx, ry)
    }
    // SVG implementation notes does all the math for us! woo!
    // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
    // step1, using x1 as x1'
    x1 = (Math.cos(xar) * (x - nx)) / 2 + (Math.sin(xar) * (y - ny)) / 2
    y1 = (-Math.sin(xar) * (x - nx)) / 2 + (Math.cos(xar) * (y - ny)) / 2
    // step 2, using x2 as cx'
    console.debug(
      '[SVGPath2ThreeShape.eatAbsoluteArc] TMP x1=' +
        x1 +
        ', y1=' +
        y1 +
        ', (rx*rx * y1*y1 + ry*ry * x1*x1)=' +
        (rx * rx * y1 * y1 + ry * ry * x1 * x1) +
        ', (rx*rx * ry*ry - rx*rx * y1*y1 - ry*ry * x1*x1)=' +
        (rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1)
    )
    var norm = Math.sqrt(
      Math.abs(
        (rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1) /
          (rx * rx * y1 * y1 + ry * ry * x1 * x1)
      )
    )
    if (laf === sf) norm = -norm
    x2 = (norm * rx * y1) / ry
    y2 = (norm * -ry * x1) / rx
    console.debug(
      '[SVGPath2ThreeShape.eatAbsoluteArc] TMP norm=' + norm + ', x2=' + x2 + ', y2=' + y2
    )
    // step 3
    cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2
    cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2
    console.debug('[SVGPath2ThreeShape.eatAbsoluteArc] TMP cx=' + cx + ', cy=' + cy)

    var u = new THREE.Vector2(1, 0),
      v = new THREE.Vector2((x1 - x2) / rx, (y1 - y2) / ry)
    var startAng = Math.acos(u.dot(v) / u.length() / v.length())
    if (u.x * v.y - u.y * v.x < 0) startAng = -startAng

    // we can reuse 'v' from start angle as our 'u' for delta angle
    u.x = (-x1 - x2) / rx
    u.y = (-y1 - y2) / ry

    var deltaAng = Math.acos(v.dot(u) / v.length() / u.length())
    // This normalization ends up making our curves fail to triangulate...
    if (v.x * u.y - v.y * u.x < 0) deltaAng = -deltaAng
    if (!sf && deltaAng > 0) deltaAng -= Math.PI * 2
    if (sf && deltaAng < 0) deltaAng += Math.PI * 2

    console.debug(
      '[SVGPath2ThreeShape.eatAbsoluteArc] Building arc from values: cx=' +
        cx +
        ', cy=' +
        cy +
        ', startAng=' +
        startAng +
        ', deltaAng=' +
        deltaAng +
        ', endAng=' +
        (startAng + deltaAng) +
        ', sweepFlag=' +
        sf
    )
    path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf)
    x = nx
    y = ny
  }

  var canRepeat
  activeCmd = pathStr[0]
  while (idx <= len) {
    canRepeat = true
    switch (activeCmd) {
      // moveto commands, become lineto's if repeated
      case 'M':
        x = eatNum()
        y = eatNum()
        path.moveTo(x, y)
        activeCmd = 'L'
        break
      case 'm':
        x += eatNum()
        y += eatNum()
        path.moveTo(x, y)
        activeCmd = 'l'
        break
      case 'Z':
      case 'z':
        canRepeat = false
        if (x !== firstX || y !== firstY) path.lineTo(firstX, firstY)
        break
      // - lines!
      case 'L':
      case 'H':
      case 'V':
        nx = activeCmd === 'V' ? x : eatNum()
        ny = activeCmd === 'H' ? y : eatNum()
        path.lineTo(nx, ny)
        x = nx
        y = ny
        break
      case 'l':
      case 'h':
      case 'v':
        nx = activeCmd === 'v' ? x : x + eatNum()
        ny = activeCmd === 'h' ? y : y + eatNum()
        path.lineTo(nx, ny)
        x = nx
        y = ny
        break
      // - cubic bezier
      case 'C':
        x1 = eatNum()
        y1 = eatNum()
      case 'S':
        if (activeCmd === 'S') {
          x1 = 2 * x - x2
          y1 = 2 * y - y2
        }
        x2 = eatNum()
        y2 = eatNum()
        nx = eatNum()
        ny = eatNum()
        path.bezierCurveTo(x1, y1, x2, y2, nx, ny)
        x = nx
        y = ny
        break
      case 'c':
        x1 = x + eatNum()
        y1 = y + eatNum()
      case 's':
        if (activeCmd === 's') {
          x1 = 2 * x - x2
          y1 = 2 * y - y2
        }
        x2 = x + eatNum()
        y2 = y + eatNum()
        nx = x + eatNum()
        ny = y + eatNum()
        path.bezierCurveTo(x1, y1, x2, y2, nx, ny)
        x = nx
        y = ny
        break
      // - quadratic bezier
      case 'Q':
        x1 = eatNum()
        y1 = eatNum()
      case 'T':
        if (activeCmd === 'T') {
          x1 = 2 * x - x1
          y1 = 2 * y - y1
        }
        nx = eatNum()
        ny = eatNum()
        path.quadraticCurveTo(x1, y1, nx, ny)
        x = nx
        y = ny
        break
      case 'q':
        x1 = x + eatNum()
        y1 = y + eatNum()
      case 't':
        if (activeCmd === 't') {
          x1 = 2 * x - x1
          y1 = 2 * y - y1
        }
        nx = x + eatNum()
        ny = y + eatNum()
        path.quadraticCurveTo(x1, y1, nx, ny)
        x = nx
        y = ny
        break
      // - elliptical arc
      case 'A':
      // eatAbsoluteArc();
      case 'a':
        eatAbsoluteArc()
        break
      default:
        throw new Error('weird path command: ' + activeCmd)
    }
    if (firstX === null) {
      firstX = x
      firstY = y
    }
    // just reissue the command
    if (canRepeat && nextIsNum()) continue
    activeCmd = pathStr[idx++]
  }

  return path
}
export default transformSVGPath

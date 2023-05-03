/* eslint-disable */
export function spCode() {
  displace(0, 0, 0)
  sphere(0.3)

  displace(mouse.x, mouse.y, 0)
  blend(0.2)
  sphere(0.2)
}

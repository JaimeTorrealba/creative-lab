/* eslint-disable */
export function spCode() {
  metal(0.9)
  shine(0.7)
  displace(0, 0, 0)
  sphere(0.3)

  displace(mouse.x, mouse.y, 0)
  metal(0.9)
  blend(0.2)
  sphere(0.2)
}

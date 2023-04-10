/* eslint-disable */
export function spCode() {
  color(0, 0, 1)
  metal(0.9)
  shine(0.7)
  displace(0, 0, 0)
  sphere(0.5)

  color(0, 0, 1)
  displace(mouse.x, mouse.y, 0)
  metal(0.9)
  blend(0.2)
  sphere(0.3)
}

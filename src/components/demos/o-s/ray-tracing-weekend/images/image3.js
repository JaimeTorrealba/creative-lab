import { headers, main_cc, image_size } from './image2'

const hit_sphere = /* wgsl */ `
fn hit_sphere(center: point3, radius: f32, r: ray) -> bool {
  let oc = center - r.orig;
  let a = dot(r.dir, r.dir);
  let b = -2.0 * dot(r.dir, oc);
  let c = dot(oc, oc) - radius * radius;
  let discriminant = b * b - 4 * a * c;
  return (discriminant >= 0);
}
`

const ray_color = /* wgsl */ `
fn ray_color(r: ray) -> color {
  if (hit_sphere(point3(0, 0, -1), 0.5, r)) {
    return color(1, 0, 0);
  }

  let unit_direction = unit_vector(r.dir);
  let a = 0.5 * (unit_direction.y + 1.0);
  return (1.0 - a) * color(1.0, 1.0, 1.0) + a * color(0.5, 0.7, 1.0);
}
`

export const image3 = {
  ...image_size,
  code: [headers, hit_sphere, ray_color, main_cc].join('\n')
}

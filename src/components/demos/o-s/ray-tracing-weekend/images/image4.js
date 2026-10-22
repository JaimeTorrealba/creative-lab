import { headers, main_cc, image_size } from './image2'

const hit_sphere = /* wgsl */ `
fn hit_sphere(center: point3, radius: f32, r: ray) -> f32 {
  let oc = center - r.orig;
  let a = dot(r.dir, r.dir);
  let b = -2.0 * dot(r.dir, oc);
  let c = dot(oc, oc) - radius * radius;
  let discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return -1.0;
  } else {
    return (-b - sqrt(discriminant)) / (2.0 * a);
  }
}
`

const ray_color = /* wgsl */ `
fn ray_color(r: ray) -> color {
  let t = hit_sphere(point3(0, 0, -1), 0.5, r);
  if (t > 0.0) {
    let N = unit_vector(ray_at(r, t) - vec3f(0, 0, -1));
    return 0.5 * color(N.x + 1, N.y + 1, N.z + 1);
  }

  let unit_direction = unit_vector(r.dir);
  let a = 0.5 * (unit_direction.y + 1.0);
  return (1.0 - a) * color(1.0, 1.0, 1.0) + a * color(0.5, 0.7, 1.0);
}
`

export const image4 = {
  ...image_size,
  code: [headers, hit_sphere, ray_color, main_cc].join('\n')
}

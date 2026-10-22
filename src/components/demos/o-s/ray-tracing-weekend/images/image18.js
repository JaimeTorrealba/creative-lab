import { material_with_dielectric, lambertian, metal_fuzz, dielectric } from '@/utils/rtweekend'
import { camera_ray_color } from '@/utils/rtweekend'
import { image_settings } from './image6'
import { camera_h, main_cc } from './image8'
import { material_headers } from './image13'

// The full glass material set used from here to the end of the book.
export const glass_headers = material_headers([
  material_with_dielectric,
  lambertian,
  metal_fuzz,
  dielectric
])

// Listing [scene-hollow-glass]; Listing [scene-free-view] reuses it with a fuzz of 1.0.
export const build_world_hollow = (right_fuzz) => /* wgsl */ `
@compute @workgroup_size(1)
fn build_world() {
  let material_ground = make_lambertian(color(0.8, 0.8, 0.0));
  let material_center = make_lambertian(color(0.1, 0.2, 0.5));
  let material_left   = make_dielectric(1.50);
  let material_bubble = make_dielectric(1.00 / 1.50);
  let material_right  = make_metal(color(0.8, 0.6, 0.2), ${right_fuzz});

  hittable_list_add(make_sphere(point3( 0.0, -100.5, -1.0), 100.0, material_ground));
  hittable_list_add(make_sphere(point3( 0.0,    0.0, -1.2),   0.5, material_center));
  hittable_list_add(make_sphere(point3(-1.0,    0.0, -1.0),   0.5, material_left));
  hittable_list_add(make_sphere(point3(-1.0,    0.0, -1.0),   0.4, material_bubble));
  hittable_list_add(make_sphere(point3( 1.0,    0.0, -1.0),   0.5, material_right));
}
`

export const image18 = {
  ...image_settings,
  code: [glass_headers, camera_h, camera_ray_color, build_world_hollow('0.0'), main_cc].join('\n')
}

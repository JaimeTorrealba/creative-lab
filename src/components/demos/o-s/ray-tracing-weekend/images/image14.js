import { material, lambertian, metal_fuzz } from '@/utils/rtweekend'
import { camera_ray_color } from '@/utils/rtweekend'
import { image_settings } from './image6'
import { camera_h, main_cc } from './image8'
import { material_headers } from './image13'

// Listing [metal-fuzz-spheres]
const build_world = /* wgsl */ `
@compute @workgroup_size(1)
fn build_world() {
  let material_ground = make_lambertian(color(0.8, 0.8, 0.0));
  let material_center = make_lambertian(color(0.1, 0.2, 0.5));
  let material_left   = make_metal(color(0.8, 0.8, 0.8), 0.3);
  let material_right  = make_metal(color(0.8, 0.6, 0.2), 1.0);

  hittable_list_add(make_sphere(point3( 0.0, -100.5, -1.0), 100.0, material_ground));
  hittable_list_add(make_sphere(point3( 0.0,    0.0, -1.2),   0.5, material_center));
  hittable_list_add(make_sphere(point3(-1.0,    0.0, -1.0),   0.5, material_left));
  hittable_list_add(make_sphere(point3( 1.0,    0.0, -1.0),   0.5, material_right));
}
`

export const image14 = {
  ...image_settings,
  code: [
    material_headers([material, lambertian, metal_fuzz]),
    camera_h,
    camera_ray_color,
    build_world,
    main_cc
  ].join('\n')
}

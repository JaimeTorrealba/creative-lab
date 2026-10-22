import { camera, camera_ray_color } from '@/utils/rtweekend'
import { image_settings } from './image6'
import { glass_headers, build_world_hollow } from './image18'

// Listing [scene-camera-dof]
const main_cc = /* wgsl */ `
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  var cam = make_camera();

  cam.aspect_ratio = 16.0 / 9.0;
  cam.image_width = 400;
  cam.samples_per_pixel = 100;
  cam.max_depth = 50;

  cam.vfov     = 20.0;
  cam.lookfrom = point3(-2, 2, 1);
  cam.lookat   = point3(0, 0, -1);
  cam.vup      = vec3f(0, 1, 0);

  cam.defocus_angle = 10.0;
  cam.focus_dist    = 3.4;

  camera_render(&cam, id);
}
`

// Listing [camera-dof]: camera.h in its final form.
export const camera_h = camera

export const image22 = {
  ...image_settings,
  code: [glass_headers, camera_h, camera_ray_color, build_world_hollow('1.0'), main_cc].join('\n')
}

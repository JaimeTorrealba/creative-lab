import { camera_render_with } from '@/utils/rtweekend'
import { camera_initialize, camera_get_ray } from './image6'

// Image 8 isn't in the gallery: this module only holds the depth-limited camera the book
// introduces there, which Image 9 onwards builds on.

// Listing [ray-color-depth]: the camera gains max_depth.
export const camera_class = /* wgsl */ `
struct camera {
  aspect_ratio: f32,       // Ratio of image width over height
  image_width: i32,        // Rendered image width in pixel count
  samples_per_pixel: i32,  // Count of random samples for each pixel
  max_depth: i32,          // Maximum number of ray bounces into scene

  image_height: i32,         // Rendered image height
  pixel_samples_scale: f32,  // Color scale factor for a sum of pixel samples
  center: point3,            // Camera center
  pixel00_loc: point3,       // Location of pixel 0, 0
  pixel_delta_u: vec3f,      // Offset to pixel to the right
  pixel_delta_v: vec3f,      // Offset to pixel below
}

fn make_camera() -> camera {
  var cam: camera;
  cam.aspect_ratio = 1.0;
  cam.image_width = 100;
  cam.samples_per_pixel = 10;
  cam.max_depth = 10;
  return cam;
}
`

export const camera_render = camera_render_with('camera_ray_color(r, (*cam).max_depth)')

// Listing [main-ray-depth]
export const main_cc = /* wgsl */ `
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  var cam = make_camera();

  cam.aspect_ratio = 16.0 / 9.0;
  cam.image_width = 400;
  cam.samples_per_pixel = 100;
  cam.max_depth = 50;

  camera_render(&cam, id);
}
`

export const camera_h = [camera_class, camera_render, camera_initialize, camera_get_ray].join('\n')

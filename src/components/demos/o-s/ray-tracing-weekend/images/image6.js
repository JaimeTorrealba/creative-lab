import { camera_render_with } from '@/utils/rtweekend'
import { image_size } from './image2'

// Image 6 isn't in the gallery: this module only holds the camera code the book introduces
// there, which Image 7 onwards builds on.

// Listing [camera-spp]: camera.h as of the Antialiasing chapter.
export const camera_class = /* wgsl */ `
struct camera {
  aspect_ratio: f32,       // Ratio of image width over height
  image_width: i32,        // Rendered image width in pixel count
  samples_per_pixel: i32,  // Count of random samples for each pixel

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
  return cam;
}
`

export const camera_initialize = /* wgsl */ `
fn camera_initialize(cam: ptr<function, camera>) {
  (*cam).image_height = i32(f32((*cam).image_width) / (*cam).aspect_ratio);
  if ((*cam).image_height < 1) { (*cam).image_height = 1; }

  (*cam).pixel_samples_scale = 1.0 / f32((*cam).samples_per_pixel);

  (*cam).center = point3(0, 0, 0);

  // Determine viewport dimensions.
  let focal_length = 1.0;
  let viewport_height = 2.0;
  let viewport_width = viewport_height * (f32((*cam).image_width) / f32((*cam).image_height));

  // Calculate the vectors across the horizontal and down the vertical viewport edges.
  let viewport_u = vec3f(viewport_width, 0, 0);
  let viewport_v = vec3f(0, -viewport_height, 0);

  // Calculate the horizontal and vertical delta vectors from pixel to pixel.
  (*cam).pixel_delta_u = viewport_u / f32((*cam).image_width);
  (*cam).pixel_delta_v = viewport_v / f32((*cam).image_height);

  // Calculate the location of the upper left pixel.
  let viewport_upper_left = (*cam).center - vec3f(0, 0, focal_length) - viewport_u / 2 - viewport_v / 2;
  (*cam).pixel00_loc = viewport_upper_left + 0.5 * ((*cam).pixel_delta_u + (*cam).pixel_delta_v);
}
`

export const camera_get_ray = /* wgsl */ `
fn camera_get_ray(cam: ptr<function, camera>, i: i32, j: i32) -> ray {
  // Construct a camera ray originating from the origin and directed at randomly sampled
  // point around the pixel location i, j.

  let offset = camera_sample_square();
  let pixel_sample = (*cam).pixel00_loc
                   + ((f32(i) + offset.x) * (*cam).pixel_delta_u)
                   + ((f32(j) + offset.y) * (*cam).pixel_delta_v);

  let ray_origin = (*cam).center;
  let ray_direction = pixel_sample - ray_origin;

  return ray(ray_origin, ray_direction);
}

fn camera_sample_square() -> vec3f {
  // Returns the vector to a random point in the [-.5,-.5]-[+.5,+.5] unit square.
  return vec3f(random_double() - 0.5, random_double() - 0.5, 0);
}
`

// The world from Listing [main-with-rtweekend-h]; main() keeps only the camera setup.
export const build_world = /* wgsl */ `
@compute @workgroup_size(1)
fn build_world() {
  hittable_list_add(make_sphere(point3(0, 0, -1), 0.5));
  hittable_list_add(make_sphere(point3(0, -100.5, -1), 100.0));
}
`

// Listing [main-spp]
export const main_cc = /* wgsl */ `
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  var cam = make_camera();

  cam.aspect_ratio = 16.0 / 9.0;
  cam.image_width = 400;
  cam.samples_per_pixel = 100;

  camera_render(&cam, id);
}
`

export const camera_h = [
  camera_class,
  camera_render_with('camera_ray_color(r)'),
  camera_initialize,
  camera_get_ray
].join('\n')

export const image_settings = { ...image_size, samples_per_pixel: 100, samples_per_pass: 10 }

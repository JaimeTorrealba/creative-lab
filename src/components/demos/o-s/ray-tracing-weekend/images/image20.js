import { camera_ray_color } from '@/utils/rtweekend'
import { image_settings, camera_get_ray } from './image6'
import { camera_render } from './image8'
import { glass_headers, build_world_hollow } from './image18'

// Listing [camera-orient]
const camera_class = /* wgsl */ `
struct camera {
  aspect_ratio: f32,       // Ratio of image width over height
  image_width: i32,        // Rendered image width in pixel count
  samples_per_pixel: i32,  // Count of random samples for each pixel
  max_depth: i32,          // Maximum number of ray bounces into scene

  vfov: f32,         // Vertical view angle (field of view)
  lookfrom: point3,  // Point camera is looking from
  lookat: point3,    // Point camera is looking at
  vup: vec3f,        // Camera-relative "up" direction

  image_height: i32,         // Rendered image height
  pixel_samples_scale: f32,  // Color scale factor for a sum of pixel samples
  center: point3,            // Camera center
  pixel00_loc: point3,       // Location of pixel 0, 0
  pixel_delta_u: vec3f,      // Offset to pixel to the right
  pixel_delta_v: vec3f,      // Offset to pixel below
  u: vec3f,                  // Camera frame basis vectors
  v: vec3f,
  w: vec3f,
}

fn make_camera() -> camera {
  var cam: camera;
  cam.aspect_ratio = 1.0;
  cam.image_width = 100;
  cam.samples_per_pixel = 10;
  cam.max_depth = 10;
  cam.vfov = 90.0;
  cam.lookfrom = point3(0, 0, 0);
  cam.lookat = point3(0, 0, -1);
  cam.vup = vec3f(0, 1, 0);
  return cam;
}
`

const camera_initialize = /* wgsl */ `
fn camera_initialize(cam: ptr<function, camera>) {
  (*cam).image_height = i32(f32((*cam).image_width) / (*cam).aspect_ratio);
  if ((*cam).image_height < 1) { (*cam).image_height = 1; }

  (*cam).pixel_samples_scale = 1.0 / f32((*cam).samples_per_pixel);

  (*cam).center = (*cam).lookfrom;

  // Determine viewport dimensions.
  let focal_length = length((*cam).lookfrom - (*cam).lookat);
  let theta = degrees_to_radians((*cam).vfov);
  let h = tan(theta / 2);
  let viewport_height = 2 * h * focal_length;
  let viewport_width = viewport_height * (f32((*cam).image_width) / f32((*cam).image_height));

  // Calculate the u,v,w unit basis vectors for the camera coordinate frame.
  (*cam).w = unit_vector((*cam).lookfrom - (*cam).lookat);
  (*cam).u = unit_vector(cross((*cam).vup, (*cam).w));
  (*cam).v = cross((*cam).w, (*cam).u);

  // Calculate the vectors across the horizontal and down the vertical viewport edges.
  let viewport_u = viewport_width * (*cam).u;    // Vector across viewport horizontal edge
  let viewport_v = viewport_height * -(*cam).v;  // Vector down viewport vertical edge

  // Calculate the horizontal and vertical delta vectors from pixel to pixel.
  (*cam).pixel_delta_u = viewport_u / f32((*cam).image_width);
  (*cam).pixel_delta_v = viewport_v / f32((*cam).image_height);

  // Calculate the location of the upper left pixel.
  let viewport_upper_left = (*cam).center - (focal_length * (*cam).w) - viewport_u / 2 - viewport_v / 2;
  (*cam).pixel00_loc = viewport_upper_left + 0.5 * ((*cam).pixel_delta_u + (*cam).pixel_delta_v);
}
`

// Listing [scene-free-view]; Listing [change-field-view] only changes vfov.
export const main_with_vfov = (vfov) => /* wgsl */ `
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  var cam = make_camera();

  cam.aspect_ratio = 16.0 / 9.0;
  cam.image_width = 400;
  cam.samples_per_pixel = 100;
  cam.max_depth = 50;

  cam.vfov     = ${vfov};
  cam.lookfrom = point3(-2, 2, 1);
  cam.lookat   = point3(0, 0, -1);
  cam.vup      = vec3f(0, 1, 0);

  camera_render(&cam, id);
}
`

export const camera_h = [camera_class, camera_render, camera_initialize, camera_get_ray].join('\n')

export const image20 = {
  ...image_settings,
  code: [
    glass_headers,
    camera_h,
    camera_ray_color,
    build_world_hollow('1.0'),
    main_with_vfov('90.0')
  ].join('\n')
}

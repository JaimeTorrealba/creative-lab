import { hittable, sphere, hittable_list } from '@/utils/rtweekend'
import { headers, image_size } from './image2'

export const world_headers = [headers, hittable, sphere, hittable_list].join('\n')

// The book still passes `0, infinity` here; the interval form is its next refactor.
const ray_color = /* wgsl */ `
fn ray_color(r: ray) -> color {
  var rec: hit_record;
  if (hittable_list_hit(r, interval(0, infinity), &rec)) {
    return 0.5 * (rec.normal + color(1, 1, 1));
  }

  let unit_direction = unit_vector(r.dir);
  let a = 0.5 * (unit_direction.y + 1.0);
  return (1.0 - a) * color(1.0, 1.0, 1.0) + a * color(0.5, 0.7, 1.0);
}
`

// Listing [main-with-rtweekend-h], split in two: the World section runs once as
// build_world, the rest runs once per pixel.
const main_cc = /* wgsl */ `
@compute @workgroup_size(1)
fn build_world() {
  // World

  hittable_list_add(make_sphere(point3(0, 0, -1), 0.5));
  hittable_list_add(make_sphere(point3(0, -100.5, -1), 100.0));
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  // Image

  let aspect_ratio = 16.0 / 9.0;
  let image_width = 400;

  // Calculate the image height, and ensure that it's at least 1.
  var image_height = i32(f32(image_width) / aspect_ratio);
  if (image_height < 1) { image_height = 1; }

  // Camera

  let focal_length = 1.0;
  let viewport_height = 2.0;
  let viewport_width = viewport_height * (f32(image_width) / f32(image_height));
  let camera_center = point3(0, 0, 0);

  // Calculate the vectors across the horizontal and down the vertical viewport edges.
  let viewport_u = vec3f(viewport_width, 0, 0);
  let viewport_v = vec3f(0, -viewport_height, 0);

  // Calculate the horizontal and vertical delta vectors from pixel to pixel.
  let pixel_delta_u = viewport_u / f32(image_width);
  let pixel_delta_v = viewport_v / f32(image_height);

  // Calculate the location of the upper left pixel.
  let viewport_upper_left = camera_center - vec3f(0, 0, focal_length) - viewport_u / 2 - viewport_v / 2;
  let pixel00_loc = viewport_upper_left + 0.5 * (pixel_delta_u + pixel_delta_v);

  // Render

  let i = i32(id.x);
  let j = i32(id.y);
  if (i >= image_width || j >= image_height) {
    return;
  }
  pixel_index = u32(j * image_width + i);

  let pixel_center = pixel00_loc + (f32(i) * pixel_delta_u) + (f32(j) * pixel_delta_v);
  let ray_direction = pixel_center - camera_center;
  let r = ray(camera_center, ray_direction);

  let pixel_color = ray_color(r);
  write_color(pixel_color);
}
`

export const image5 = {
  ...image_size,
  code: [world_headers, ray_color, main_cc].join('\n')
}

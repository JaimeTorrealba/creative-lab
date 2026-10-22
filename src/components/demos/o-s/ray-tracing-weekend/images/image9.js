import { world_headers } from './image5'
import { build_world, image_settings } from './image6'
import { camera_h, main_cc } from './image8'

// Listing [reflect-tolerance]: interval(0.001, infinity) ignores hits right at the ray origin.
const camera_ray_color = /* wgsl */ `
fn camera_ray_color(r: ray, depth: i32) -> color {
  var current_ray = r;
  var attenuation = 1.0;

  for (var remaining_depth = depth; remaining_depth > 0; remaining_depth--) {
    var rec: hit_record;

    if (hittable_list_hit(current_ray, interval(0.001, infinity), &rec)) {
      let direction = random_on_hemisphere(rec.normal);
      attenuation *= 0.5;
      current_ray = ray(rec.p, direction);
      continue;
    }

    let unit_direction = unit_vector(current_ray.dir);
    let a = 0.5 * (unit_direction.y + 1.0);
    return attenuation * ((1.0 - a) * color(1.0, 1.0, 1.0) + a * color(0.5, 0.7, 1.0));
  }

  // If we've exceeded the ray bounce limit, no more light is gathered.
  return color(0, 0, 0);
}
`

export const image9 = {
  ...image_settings,
  code: [world_headers, camera_h, camera_ray_color, build_world, main_cc].join('\n')
}

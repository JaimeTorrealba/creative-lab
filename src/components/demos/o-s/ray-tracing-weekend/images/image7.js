import { world_headers } from './image5'
import { camera_h, build_world, main_cc, image_settings } from './image6'

// Not the book's max_depth (that arrives with Image 8): only stops a stuck ray hanging the GPU.
// WGSL forbids recursion, so each `return 0.5 * ray_color(ray(rec.p, direction), world)`
// becomes one more loop iteration that halves the color returned at the end.
// Listing [ray-color-random-unit]
const camera_ray_color = /* wgsl */ `
const RECURSION_GUARD = 64;

fn camera_ray_color(r: ray) -> color {
  var current_ray = r;
  var attenuation = 1.0;

  for (var bounce = 0; bounce < RECURSION_GUARD; bounce++) {
    var rec: hit_record;

    if (hittable_list_hit(current_ray, interval(0, infinity), &rec)) {
      let direction = random_on_hemisphere(rec.normal);
      attenuation *= 0.5;
      current_ray = ray(rec.p, direction);
      continue;
    }

    let unit_direction = unit_vector(current_ray.dir);
    let a = 0.5 * (unit_direction.y + 1.0);
    return attenuation * ((1.0 - a) * color(1.0, 1.0, 1.0) + a * color(0.5, 0.7, 1.0));
  }

  return color(0, 0, 0);
}
`

export const image7 = {
  ...image_settings,
  code: [world_headers, camera_h, camera_ray_color, build_world, main_cc].join('\n')
}

import { computeImageHeight } from '@/utils/renderComputeToImage'
import { camera_ray_color } from '@/utils/rtweekend'
import { glass_headers } from './image18'
import { camera_h } from './image22'

// Listing [scene-final]. build_world runs on a single thread, so the random sequence (and the
// scene) is the same for every pixel and every pass.
const build_world = /* wgsl */ `
@compute @workgroup_size(1)
fn build_world() {
  seed_random(0u);

  let ground_material = make_lambertian(color(0.5, 0.5, 0.5));
  hittable_list_add(make_sphere(point3(0, -1000, 0), 1000.0, ground_material));

  for (var a = -11; a < 11; a++) {
    for (var b = -11; b < 11; b++) {
      let choose_mat = random_double();
      let center = point3(f32(a) + 0.9 * random_double(), 0.2, f32(b) + 0.9 * random_double());

      if (length(center - point3(4, 0.2, 0)) > 0.9) {
        var sphere_material: material;

        if (choose_mat < 0.8) {
          // diffuse
          let albedo = vec3_random() * vec3_random();
          sphere_material = make_lambertian(albedo);
          hittable_list_add(make_sphere(center, 0.2, sphere_material));
        } else if (choose_mat < 0.95) {
          // metal
          let albedo = vec3_random_range(0.5, 1.0);
          let fuzz = random_double_range(0.0, 0.5);
          sphere_material = make_metal(albedo, fuzz);
          hittable_list_add(make_sphere(center, 0.2, sphere_material));
        } else {
          // glass
          sphere_material = make_dielectric(1.5);
          hittable_list_add(make_sphere(center, 0.2, sphere_material));
        }
      }
    }
  }

  let material1 = make_dielectric(1.5);
  hittable_list_add(make_sphere(point3(0, 1, 0), 1.0, material1));

  let material2 = make_lambertian(color(0.4, 0.2, 0.1));
  hittable_list_add(make_sphere(point3(-4, 1, 0), 1.0, material2));

  let material3 = make_metal(color(0.7, 0.6, 0.5), 0.0);
  hittable_list_add(make_sphere(point3(4, 1, 0), 1.0, material3));
}
`

const main_cc = /* wgsl */ `
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  var cam = make_camera();

  cam.aspect_ratio = 16.0 / 9.0;
  cam.image_width = 1200;
  cam.samples_per_pixel = 500;
  cam.max_depth = 50;

  cam.vfov     = 20.0;
  cam.lookfrom = point3(13, 2, 3);
  cam.lookat   = point3(0, 0, 0);
  cam.vup      = vec3f(0, 1, 0);

  cam.defocus_angle = 0.6;
  cam.focus_dist    = 10.0;

  camera_render(&cam, id);
}
`

export const image23 = {
  image_width: 1200,
  image_height: computeImageHeight(1200, 16 / 9),
  samples_per_pixel: 500,
  samples_per_pass: 1,
  code: [glass_headers, camera_h, camera_ray_color, build_world, main_cc].join('\n')
}

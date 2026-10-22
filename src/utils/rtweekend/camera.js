// camera.h

// The book loops over every pixel and sample; here each invocation renders its own pixel, and
// each dispatch adds render_pass.sample_count samples to a running sum (renderComputeToImage),
// so a long render can be split across many short GPU submissions.
export const camera_render_with = (ray_color_call) => /* wgsl */ `
fn camera_render(cam: ptr<function, camera>, id: vec3u) {
  camera_initialize(cam);

  let i = i32(id.x);
  let j = i32(id.y);
  if (i >= (*cam).image_width || j >= (*cam).image_height) {
    return;
  }
  pixel_index = u32(j * (*cam).image_width + i);
  seed_random(pixel_index ^ pcg_hash(render_pass.sample_start + render_pass.seed_offset));

  let sample_end = min(render_pass.sample_start + render_pass.sample_count, u32((*cam).samples_per_pixel));
  var pixel_color = color(0, 0, 0);
  for (var sample = render_pass.sample_start; sample < sample_end; sample++) {
    let r = camera_get_ray(cam, i, j);
    pixel_color += ${ray_color_call};
  }
  // After the last pass sample_end == samples_per_pixel, so this is the book's
  // pixel_samples_scale * pixel_color.
  write_color(accumulate_pixel_color(pixel_color) / f32(sample_end));
}
`

// Listing [camera-dof]: the final camera class.
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

  defocus_angle: f32,  // Variation angle of rays through each pixel
  focus_dist: f32,     // Distance from camera lookfrom point to plane of perfect focus

  image_height: i32,         // Rendered image height
  pixel_samples_scale: f32,  // Color scale factor for a sum of pixel samples
  center: point3,            // Camera center
  pixel00_loc: point3,       // Location of pixel 0, 0
  pixel_delta_u: vec3f,      // Offset to pixel to the right
  pixel_delta_v: vec3f,      // Offset to pixel below
  u: vec3f,                  // Camera frame basis vectors
  v: vec3f,
  w: vec3f,
  defocus_disk_u: vec3f,     // Defocus disk horizontal radius
  defocus_disk_v: vec3f,     // Defocus disk vertical radius
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
  cam.defocus_angle = 0.0;
  cam.focus_dist = 10.0;
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
  let theta = degrees_to_radians((*cam).vfov);
  let h = tan(theta / 2);
  let viewport_height = 2 * h * (*cam).focus_dist;
  let viewport_width = viewport_height * (f32((*cam).image_width) / f32((*cam).image_height));

  // Calculate the u,v,w unit basis vectors for the camera coordinate frame.
  (*cam).w = unit_vector((*cam).lookfrom - (*cam).lookat);
  (*cam).u = unit_vector(cross((*cam).vup, (*cam).w));
  (*cam).v = cross((*cam).w, (*cam).u);

  // Calculate the vectors across the horizontal and down the vertical viewport edges.
  let viewport_u = viewport_width * (*cam).u;    // Vector across viewport horizontal edge
  let viewport_v = viewport_height * -(*cam).v;  // Vector down viewport vertical edge

  // Calculate the horizontal and vertical delta vectors to the next pixel.
  (*cam).pixel_delta_u = viewport_u / f32((*cam).image_width);
  (*cam).pixel_delta_v = viewport_v / f32((*cam).image_height);

  // Calculate the location of the upper left pixel.
  let viewport_upper_left = (*cam).center - ((*cam).focus_dist * (*cam).w) - viewport_u / 2 - viewport_v / 2;
  (*cam).pixel00_loc = viewport_upper_left + 0.5 * ((*cam).pixel_delta_u + (*cam).pixel_delta_v);

  // Calculate the camera defocus disk basis vectors.
  let defocus_radius = (*cam).focus_dist * tan(degrees_to_radians((*cam).defocus_angle / 2));
  (*cam).defocus_disk_u = (*cam).u * defocus_radius;
  (*cam).defocus_disk_v = (*cam).v * defocus_radius;
}
`

const camera_get_ray = /* wgsl */ `
fn camera_get_ray(cam: ptr<function, camera>, i: i32, j: i32) -> ray {
  // Construct a camera ray originating from the defocus disk and directed at a randomly
  // sampled point around the pixel location i, j.

  let offset = camera_sample_square();
  let pixel_sample = (*cam).pixel00_loc
                   + ((f32(i) + offset.x) * (*cam).pixel_delta_u)
                   + ((f32(j) + offset.y) * (*cam).pixel_delta_v);

  var ray_origin = (*cam).center;
  if ((*cam).defocus_angle > 0) {
    ray_origin = camera_defocus_disk_sample(cam);
  }
  let ray_direction = pixel_sample - ray_origin;

  return ray(ray_origin, ray_direction);
}

fn camera_sample_square() -> vec3f {
  // Returns the vector to a random point in the [-.5,-.5]-[+.5,+.5] unit square.
  return vec3f(random_double() - 0.5, random_double() - 0.5, 0);
}

fn camera_defocus_disk_sample(cam: ptr<function, camera>) -> point3 {
  // Returns a random point in the camera defocus disk.
  let p = random_in_unit_disk();
  return (*cam).center + (p[0] * (*cam).defocus_disk_u) + (p[1] * (*cam).defocus_disk_v);
}
`

export const camera = [
  camera_class,
  camera_render_with('camera_ray_color(r, (*cam).max_depth)'),
  camera_initialize,
  camera_get_ray
].join('\n')

// Listing [ray-color-scatter]. WGSL forbids recursion, so each
// `attenuation * ray_color(scattered, depth-1, world)` multiplies into `throughput` and the loop
// carries on with the scattered ray.
export const camera_ray_color = /* wgsl */ `
fn camera_ray_color(r: ray, depth: i32) -> color {
  var current_ray = r;
  var throughput = color(1, 1, 1);

  for (var remaining_depth = depth; remaining_depth > 0; remaining_depth--) {
    var rec: hit_record;

    if (hittable_list_hit(current_ray, interval(0.001, infinity), &rec)) {
      var scattered: ray;
      var attenuation: color;
      if (material_scatter(rec.mat, current_ray, rec, &attenuation, &scattered)) {
        throughput *= attenuation;
        current_ray = scattered;
        continue;
      }
      return color(0, 0, 0);
    }

    let unit_direction = unit_vector(current_ray.dir);
    let a = 0.5 * (unit_direction.y + 1.0);
    return throughput * ((1.0 - a) * color(1.0, 1.0, 1.0) + a * color(0.5, 0.7, 1.0));
  }

  // If we've exceeded the ray bounce limit, no more light is gathered.
  return color(0, 0, 0);
}
`

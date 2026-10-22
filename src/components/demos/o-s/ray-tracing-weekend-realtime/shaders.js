import {
  rtweekend,
  vec3,
  ray,
  interval,
  color_gamma,
  material_with_dielectric,
  lambertian,
  metal_fuzz,
  dielectric,
  hittable_material,
  sphere_material,
  aabb,
  bvh,
  hittable_list_bvh,
  camera,
  camera_ray_color
} from '@/utils/rtweekend'
import { output } from '@/utils/renderComputeToImage'

// Not from the book: the camera values main() sets come from the keyboard, mouse and Tweakpane.
// Byte layout is mirrored by packCameraSettings() in realtimeRenderer.js.
const camera_settings = /* wgsl */ `
struct camera_settings {
  lookfrom: point3,
  vfov: f32,
  lookat: point3,
  defocus_angle: f32,
  vup: vec3f,
  focus_dist: f32,
  image_width: i32,
  image_height: i32,
  samples_per_pixel: i32,
  max_depth: i32,
}
`

// Listing [scene-final]'s camera setup. The world is uploaded from the CPU instead of being
// built here (see world/final_scene.js), because the BVH is built over it on the CPU.
const main_cc = /* wgsl */ `
@group(0) @binding(5) var<uniform> settings: camera_settings;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  var cam = make_camera();

  // aspect_ratio only decides image_height = int(image_width / aspect_ratio); the +0.5 keeps
  // the truncation from landing one row short of the canvas.
  cam.aspect_ratio = f32(settings.image_width) / (f32(settings.image_height) + 0.5);
  cam.image_width = settings.image_width;
  cam.samples_per_pixel = settings.samples_per_pixel;
  cam.max_depth = settings.max_depth;

  cam.vfov     = settings.vfov;
  cam.lookfrom = settings.lookfrom;
  cam.lookat   = settings.lookat;
  cam.vup      = settings.vup;

  cam.defocus_angle = settings.defocus_angle;
  cam.focus_dist    = settings.focus_dist;

  camera_render(&cam, id);
}
`

export const RENDER_SHADER = [
  output,
  rtweekend,
  vec3,
  ray,
  interval,
  color_gamma,
  material_with_dielectric,
  lambertian,
  metal_fuzz,
  dielectric,
  hittable_material,
  sphere_material,
  aabb,
  bvh,
  hittable_list_bvh,
  camera,
  camera_ray_color,
  camera_settings,
  main_cc
].join('\n')

// Draws the packed RGBA bytes write_color() produced; the canvas is the same size as the image.
export const BLIT_SHADER = /* wgsl */ `
alias point3 = vec3f;
${camera_settings}
@group(0) @binding(0) var<storage, read> pixels: array<u32>;
@group(0) @binding(1) var<uniform> settings: camera_settings;

@vertex
fn vertex_main(@builtin(vertex_index) vertex_index: u32) -> @builtin(position) vec4f {
  // One triangle that covers the whole canvas.
  let uv = vec2f(f32((vertex_index << 1u) & 2u), f32(vertex_index & 2u));
  return vec4f(uv * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let pixel = vec2i(position.xy);
  return unpack4x8unorm(pixels[pixel.y * settings.image_width + pixel.x]);
}
`

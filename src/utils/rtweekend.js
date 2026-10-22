// "Ray Tracing in One Weekend" headers, ported to WGSL — one file per book header.
// https://raytracing.github.io/books/RayTracingInOneWeekend.html
// Classes become structs + `<class>_<method>` functions; overloads get a `_range` suffix.

export { rtweekend } from './rtweekend/rtweekend'
export { vec3 } from './rtweekend/vec3'
export { ray } from './rtweekend/ray'
export { interval } from './rtweekend/interval'
export { color, color_gamma } from './rtweekend/color'
export { hittable, hittable_material } from './rtweekend/hittable'
export { sphere, sphere_material } from './rtweekend/sphere'
export { hittable_list, hittable_list_bvh } from './rtweekend/hittable_list'
export { camera, camera_render_with, camera_ray_color } from './rtweekend/camera'
// "Ray Tracing: The Next Week"
export { aabb } from './rtweekend/aabb'
export { bvh } from './rtweekend/bvh'
export {
  material,
  material_with_dielectric,
  lambertian,
  metal,
  metal_fuzz,
  dielectric_always_refract,
  dielectric_reflect,
  dielectric
} from './rtweekend/material'

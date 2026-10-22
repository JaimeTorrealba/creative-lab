// The world from Listing [scene-final] ("Ray Tracing in One Weekend"), built on the CPU so the
// BVH can be built over it. Same calls, same order of random numbers as the WGSL Image 23.
import { aabb_from_points } from './aabb'
import {
  seed_random,
  random_double,
  random_double_range,
  vec3,
  vec3_add,
  vec3_sub,
  vec3_mul,
  vec3_length,
  vec3_random,
  vec3_random_range
} from './rtweekend'

export const MATERIAL_LAMBERTIAN = 0
export const MATERIAL_METAL = 1
export const MATERIAL_DIELECTRIC = 2

const color = vec3
const point3 = vec3

const make_lambertian = (albedo) => ({
  kind: MATERIAL_LAMBERTIAN,
  albedo,
  fuzz: 0,
  refraction_index: 0
})

const make_metal = (albedo, fuzz) => ({
  kind: MATERIAL_METAL,
  albedo,
  fuzz: fuzz < 1 ? fuzz : 1,
  refraction_index: 0
})

const make_dielectric = (refraction_index) => ({
  kind: MATERIAL_DIELECTRIC,
  albedo: color(0, 0, 0),
  fuzz: 0,
  refraction_index
})

// Listing [sphere-bbox]: a stationary sphere's bounding box.
const make_sphere = (center, radius, mat) => {
  const rvec = vec3(radius, radius, radius)
  const bbox = aabb_from_points(vec3_sub(center, rvec), vec3_add(center, rvec))
  return { center, radius: Math.max(0, radius), mat, bbox }
}

const hittable_list_add = (world, object) => world.objects.push(object)

export const build_final_scene = () => {
  const world = { objects: [] }
  seed_random(0)

  const ground_material = make_lambertian(color(0.5, 0.5, 0.5))
  hittable_list_add(world, make_sphere(point3(0, -1000, 0), 1000, ground_material))

  for (let a = -11; a < 11; a++) {
    for (let b = -11; b < 11; b++) {
      const choose_mat = random_double()
      const center = point3(a + 0.9 * random_double(), 0.2, b + 0.9 * random_double())

      if (vec3_length(vec3_sub(center, point3(4, 0.2, 0))) > 0.9) {
        if (choose_mat < 0.8) {
          // diffuse
          const albedo = vec3_mul(vec3_random(), vec3_random())
          hittable_list_add(world, make_sphere(center, 0.2, make_lambertian(albedo)))
        } else if (choose_mat < 0.95) {
          // metal
          const albedo = vec3_random_range(0.5, 1)
          const fuzz = random_double_range(0, 0.5)
          hittable_list_add(world, make_sphere(center, 0.2, make_metal(albedo, fuzz)))
        } else {
          // glass
          hittable_list_add(world, make_sphere(center, 0.2, make_dielectric(1.5)))
        }
      }
    }
  }

  const material1 = make_dielectric(1.5)
  hittable_list_add(world, make_sphere(point3(0, 1, 0), 1.0, material1))

  const material2 = make_lambertian(color(0.4, 0.2, 0.1))
  hittable_list_add(world, make_sphere(point3(-4, 1, 0), 1.0, material2))

  const material3 = make_metal(color(0.7, 0.6, 0.5), 0.0)
  hittable_list_add(world, make_sphere(point3(4, 1, 0), 1.0, material3))

  return world
}

import { material_with_dielectric, lambertian, metal_fuzz } from '@/utils/rtweekend'
import { dielectric_reflect } from '@/utils/rtweekend'
import { camera_ray_color } from '@/utils/rtweekend'
import { image_settings } from './image6'
import { camera_h, main_cc } from './image8'
import { material_headers } from './image13'
import { build_world_with_left } from './image16'

// Listing [two-glass]: Left sphere is an air bubble in water
export const image17 = {
  ...image_settings,
  code: [
    material_headers([material_with_dielectric, lambertian, metal_fuzz, dielectric_reflect]),
    camera_h,
    camera_ray_color,
    build_world_with_left('make_dielectric(1.00 / 1.33)'),
    main_cc
  ].join('\n')
}

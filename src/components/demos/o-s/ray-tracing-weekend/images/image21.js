import { camera_ray_color } from '@/utils/rtweekend'
import { image_settings } from './image6'
import { glass_headers, build_world_hollow } from './image18'
import { camera_h, main_with_vfov } from './image20'

// Listing [change-field-view]
export const image21 = {
  ...image_settings,
  code: [
    glass_headers,
    camera_h,
    camera_ray_color,
    build_world_hollow('1.0'),
    main_with_vfov('20.0')
  ].join('\n')
}

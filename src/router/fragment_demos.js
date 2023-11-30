import { generateRoute } from '../utils'

const descriptions = {
  fragmentTemplate: 'My personal fragment shader template.',
  rayMarching: 'Basic of the ray marching, understanding the distance function and how to use it. playing with it and creating kind of a template',
  rayMarchingOperations: 'An interesting effect of how to use transparency in combination with the mouse to reveal the content behind',
  rayMarchingTweaks: 'Basic of the ray marching, understanding the distance function and how to use it. playing with it and creating kind of a template',
  rinnegan: 'A naive play with fragments draws, a rinnegan design.'
}

export const fragment_demos = [
  generateRoute('FragmentTemplate', 'Frag_demos', descriptions.fragmentTemplate),
  generateRoute('RayMarching', 'Frag_demos', descriptions.rayMarching),
  generateRoute('RayMarchingOperations', 'Frag_demos', descriptions.rayMarchingOperations),
  generateRoute('RayMarchingTweaks', 'Frag_demos', descriptions.rayMarchingTweaks),
  generateRoute('Rinnegan', 'Frag_demos', descriptions.rinnegan),
]

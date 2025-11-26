import { generateRoute } from '../utils'

const html_routes = [
  {
    name: 'HtmlMix',
    description: 'Blend HTML and WebGL using pixel-matched camera coordinates with hover effects and 3D icons.',
    link: 'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/HTML/HtmlMixView.vue'
  },
  // {
  //   name: 'PamCanvas',
  //   description: 'Canvas effect pam, which you can move through it and search for your images',
  // link: 'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/HTML/PamCanvasView.vue'
  // },
  {
    name: 'HoverButton',
    description: 'Interactive button with 3D hover effects and animations.',
    basedOn: 'https://dribbble.com/shots/11386939-Play-with-Magic-Motion',
    link: 'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/HTML/HoverButtonView.vue'
  },
  {
    name: 'Carousel3D',
    description: 'Custom 3D carousel implementation with TresJS and Vue.'
  }
]

export const html_demos = () => {
  return html_routes.map((route) => {
    return generateRoute(route.name, 'HTML', route.description, route.link, route.basedOn)
  })
}

import { generateRoute } from '../utils'

const html_routes = [
   {
      name: 'HtmlMix',
      description:
        'A basic example of how to mix TresJs with some HTML. I use a camera config to make the units in ThreeJs match the pixels in HTML. Some hover effects on the image and some 3D icons. Also a simple fragment shader banner '
    },
    {
      name: 'ReactiveText',
      description: 'A basic example of a login with 3D reactive text using VueJs and TresJs.'
    },
    {
      name: 'PamCanvas',
      description: 'Canvas effect pam, which you can move through it and search for your images'
    },
    {
      name: 'HoverButton',
      description: 'Inspired by: https://dribbble.com/shots/11386939-Play-with-Magic-Motion'
    }
]

export const html_demos = () => {
  return html_routes.map((route) => {
    return generateRoute(route.name, 'HTML', route.description, route.link)
  })
}

import { generateRoute } from '../utils'

const descriptions = {
  htmlMix: 'A basic example of how to mix TresJs with some HTML. I use a camera config to make the units in ThreeJs match the pixels in HTML. Some hover effects on the image and some 3D icons. Also a simple fragment shader banner ',
  dynamicText: 'A basic example of a login with 3D reactive text using VueJs and TresJs.',
  imageManupulation: 'html Image manipulation using them as textures webGL, shaders',
  hoverButton: 'Inspired by: https://dribbble.com/shots/11386939-Play-with-Magic-Motion'
}

export const html_demos = [
  generateRoute('HtmlMix', 'Html_demos', descriptions.htmlMix),
  generateRoute('ReactiveText', 'Html_demos', descriptions.dynamicText),
  generateRoute('ImageManipulation', 'Html_demos', descriptions.imageManipulation),
  generateRoute('HoverButton', 'Html_demos', descriptions.hoverButton),
]

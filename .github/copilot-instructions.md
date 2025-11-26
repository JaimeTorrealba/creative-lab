# Creative Lab - AI Coding Agent Instructions

## Project Overview
Vue 3 + TresJS (Three.js) showcase/playground with WebGL demos organized by category (Basics, Shaders, Textures, Complex, Controls, Fun, HTML). Built with Vite, uses pnpm for package management.

## Architecture & Key Patterns

### Demo Structure (View/Component Pattern)
Every demo follows a strict two-file pattern:
- **View** (`src/views/{Section}/{Name}View.vue`): Canvas wrapper with camera + controls
- **Component** (`src/components/demos/{section}/{Name}Demo.vue`): Actual Three.js scene content

Example:
```vue
// GlowView.vue (View)
<TresCanvas window-size clear-color="#111">
  <TresPerspectiveCamera :position="[0, 0, 15]" />
  <OrbitControls />
  <Suspense><TheExperience /></Suspense>
</TresCanvas>

// GlowDemo.vue (Component)
<TresMesh>
  <TresBoxGeometry />
  <TresMeshBasicMaterial />
</TresMesh>
```

### Naming Conventions (Critical)
- Folders: **lowerCase** (`basics/`, `shaders/`)
- Files: **PascalCase** (`WaveDemo.vue`, `GlowView.vue`)
- Components end with: **Demo** (`WaveDemo.vue`)
- Pages end with: **View** (`WaveView.vue`)
- Section folders use mixed case: `Basics/`, `Complex/`, `Textures_effects/`, `HTML/`

### Router System
Routes are auto-generated from metadata objects:
```js
// src/router/shaders.js
const shaders_routes = [
  { name: 'Glow', description: 'Glow effect using shaders' },
  // ...mapped via generateRoute()
]
```

`generateRoute()` creates:
- Path: `/glow` (lowercase with underscore separation)
- Name: `Glow Shaders`
- Meta: `{ layout: defaultLayout, section: 'Shaders', img: '/gifs/Shaders/Glow.gif', sourceCode: '...', description }`

### Layout System
All demo routes use `defaultLayout` (floating buttons for home, GitHub source, description). HomeView has no layout.

### Shader Organization
- Component-local shaders: `src/components/demos/{section}/shaders/{DemoName}/` (vertex.glsl, fragment.glsl)
- Shared utilities: `src/components/shaders/SHARED/` (noise2D.glsl, initFragment.glsl, etc.)
- Import via vite-plugin-glsl: `import fragment from './shaders/wave/fragment.glsl'`
- Usage: `<TresShaderMaterial :uniforms="..." :vertexShader="vertex" :fragmentShader="fragment" />`

### TresJS Patterns
- Use `useLoop()` from `@tresjs/core` for render loop animations
- Use composables: `useTexture()`, `useGLTF()`, `useFBO()` from `@tresjs/cientos`
- Extend Three.js classes: `extend({ ThreeScatter })` to use `<TresThreeScatter />`
- Prefer `shallowRef()` for Three.js objects (performance)
- Watch loading state: `watchOnce(isLoading, ...)` from `@vueuse/core`

### Collision & Helpers
- `useBasicCollision()`: AABB collision detection utility (takes array of refs)
- `minecraftHelpers.js`: Voxel grid helpers (getBlock, setBlock, isBlockObscured)

### Asset Organization
- Models: `/public/models/` (.glb files, some with `/textures/` subdirs)
- Textures: `/public/textures/` (organized by type: `floor_textures/`, `gaea/`, `ies/`)
- GIFs: `/public/gifs/{Section}/` (auto-referenced via route metadata)

## Developer Workflow

### Creating New Demos
**Always use the generator script:**
```bash
pnpm demo <section> <DemoName>
# Example: pnpm demo shaders Glow
# Sections: basic, complex, controls, fun, html, shaders, textures
```

This creates:
1. View file in `src/views/{Section}/{Name}View.vue`
2. Component file in `src/components/demos/{section}/{Name}Demo.vue`
3. Route entry in `src/router/{section}.js` (alphabetically sorted)

**Manual steps after generation:**
- Add description in router file (don't leave empty string)
- Add GIF: `/public/gifs/{Section}/{Name}.gif`

### Development Commands
```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview build
pnpm format           # Prettier (src/ only)
pnpm lint             # ESLint with autofix
```

### Dependencies
- **TresJS Core**: `@tresjs/core` (Three.js Vue integration)
- **Cientos**: `@tresjs/cientos` (helpers: OrbitControls, useGLTF, useTexture, etc.)
- **Post-processing**: `@tresjs/post-processing`
- **Styling**: Bulma CSS (utility classes, no custom CSS framework)
- **UI**: Tweakpane for debug controls, @heroicons/vue for icons
- **Utils**: @vueuse/core (watchOnce, useUrlSearchParams), gsap for animations

## Common Patterns

### Shader Setup with Uniforms
```vue
<script setup>
import { useLoop } from '@tresjs/core'
const shader = {
  uniforms: { uTime: { value: 0 }, uMouse: { value: new Vector2() } },
  vertexShader: vertex,
  fragmentShader: fragment
}
const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => { shader.uniforms.uTime.value = elapsed })
</script>
```

### Loading Models/Textures
```vue
const { state: model, isLoading } = useGLTF('/models/file.glb')
// Use with: <primitive v-if="!isLoading" :object="model.scene" />
```

### Home Page Search/Filter
- Search by name (case-insensitive)
- Filter by section tag (Basics, Shaders, etc.)
- URL params: `?tag=Shaders` for direct linking
- Uses masonry layout (CSS columns, responsive)

## Project-Specific Notes
- Uses `templateCompilerOptions` from TresJS for proper component compilation
- All Three.js components use `Tres` prefix: `<TresMesh>`, `<TresBoxGeometry>`
- Suspense boundaries everywhere for async loading
- `@` alias points to `src/`
- Target audience: developers learning Three.js/TresJS patterns
- Code is intentionally simple/educational (not production-optimized)

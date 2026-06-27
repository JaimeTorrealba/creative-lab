# Creative Lab — Claude Instructions

## Project Overview

A personal 3D graphics playground built with Vue 3 + TresJS (Three.js wrapper). It hosts 121+ interactive WebGL demos organized by difficulty, each with a thumbnail, description, and GitHub source link. The primary workflow is adding new demos.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| 3D | Three.js + TresJS `@tresjs/core` v5 |
| Helpers | `@tresjs/cientos` — OrbitControls, useGLTF, useTexture, useFBO |
| Post-FX | `@tresjs/post-processing` |
| Build | Vite 4 + `vite-plugin-glsl` (enables `.glsl` imports) |
| Styling | Bulma CSS + custom SCSS |
| Animation | GSAP 3 (ScrollTrigger available) |
| Debug UI | Tweakpane 4 |
| Utilities | `@vueuse/core`, `simplex-noise`, `poisson-disk-sampling`, `delaunator` |
| Package manager | **pnpm** |

## Commands

```bash
pnpm dev              # dev server with hot reload
pnpm build            # production build → dist/
pnpm preview          # preview production build
pnpm lint             # ESLint --fix (.vue/.js)
pnpm format           # Prettier (src/ only)
pnpm new-demo <section> <DemoName>   # scaffold a new demo (see below)
```

## Adding a New Demo

### 1. Use the generator

```bash
pnpm new-demo basics BouncingBall
```

This creates three files:
- `src/views/Basics/BouncingBallView.vue` — canvas wrapper
- `src/components/demos/basics/BouncingBallDemo.vue` — scene content
- Updates `src/router/basic.js` — adds a route metadata entry (alphabetically sorted)

Sections: `basic`, `intermediate`, `shaders`, `complex`, `controls`, `fragment`, `noc`, `random`

### 2. Fill in the route metadata

In `src/router/{section}.js`, the generator adds a skeleton entry. Fill in `description` and `basedOn`:

```js
{
  name: 'BouncingBall',
  description: 'A sphere bouncing with a physically-based material and GSAP easing.',
  basedOn: 'https://tresjs.org/examples/...',   // source or inspiration URL
  // link: 'https://custom-link.com',           // optional override; auto-generated if omitted
}
```

### 3. Add a thumbnail

Drop a GIF at `public/gifs/{Section}/{Name}.gif` (e.g., `public/gifs/Basics/BouncingBall.gif`). The route system references this path automatically.

---

## File & Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Demo component | `{name}/index.vue` in `src/components/demos/{section}/` (kebab-case folder) | `bouncing-ball/index.vue` |
| View (canvas wrapper) | `{Name}View.vue` in `src/views/{Section}/` | `BouncingBallView.vue` |
| Section folder (components) | lowercase | `basics/`, `shaders/` |
| Section folder (views) | PascalCase | `Basics/`, `Shaders/` |
| Demo-specific shaders | `src/components/demos/{section}/{name}/vertex.glsl` + `fragment.glsl` (same folder as `index.vue`) | |
| Shared shader utils | `src/components/shaders/SHARED/` | `noise2D.glsl` |

Always name components with two words when required by Vue (exceptions are whitelisted in `.eslintrc.cjs`).

---

## Code Patterns

### View (canvas wrapper) — standard boilerplate

```vue
<script setup>
import { OrbitControls } from '@tresjs/cientos'
import BouncingBallDemo from '@/components/demos/basics/bouncing-ball/index.vue'
</script>

<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[5, 5, 5]" />
    <OrbitControls />
    <Suspense>
      <BouncingBallDemo />
    </Suspense>
  </TresCanvas>
</template>
```

### Demo component — scene content

```vue
<script setup>
import { useLoop } from '@tresjs/core'
import { shallowRef } from 'vue'

const meshRef = shallowRef()

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  if (!meshRef.value) return
  meshRef.value.rotation.y = elapsed
})
</script>

<template>
  <TresMesh ref="meshRef">
    <TresBoxGeometry :args="[1, 1, 1]" />
    <TresMeshStandardMaterial color="hotpink" />
  </TresMesh>
  <TresAmbientLight :intensity="1" />
  <TresDirectionalLight :position="[5, 10, 5]" />
</template>
```

### Loading models / textures (async composables)

```vue
<script setup>
import { useGLTF, useTexture } from '@tresjs/cientos'

const { scene } = await useGLTF('/models/robot.glb')
const map = await useTexture({ map: '/textures/floor_textures/floor.jpg' })
</script>
```

Always wrap async demos in `<Suspense>` inside the view.

### Shaders — import and use

```vue
<script setup>
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { shallowRef, reactive } from 'vue'
import { useLoop } from '@tresjs/core'

const uniforms = reactive({ uTime: { value: 0 } })
const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => { uniforms.uTime.value = elapsed })
</script>

<template>
  <TresMesh>
    <TresPlaneGeometry :args="[2, 2, 128, 128]" />
    <TresShaderMaterial
      :vertex-shader="vertex"
      :fragment-shader="fragment"
      :uniforms="uniforms"
    />
  </TresMesh>
</template>
```

### Using `extend()` for custom Three.js classes

```js
import { extend } from '@tresjs/core'
import { MyCustomMaterial } from './MyCustomMaterial'

extend({ MyCustomMaterial })
// now usable as <TresMyCustomMaterial />
```

### Tweakpane debug panel

```vue
<script setup>
import { Pane } from 'tweakpane'
import { onMounted, onUnmounted } from 'vue'

const params = { speed: 1.0, color: '#ff0000' }
let pane

onMounted(() => {
  pane = new Pane()
  pane.addBinding(params, 'speed', { min: 0, max: 5 })
  pane.addBinding(params, 'color')
})

onUnmounted(() => pane?.dispose())
</script>
```

---

## Architecture Notes

- **Dynamic layouts**: `App.vue` uses `<component :is="$route.meta.layout">`. Demo routes use `defaultLayout` (floating toolbar with home/source/description icons). `HomeView` uses a plain `div`.
- **Route auto-generation**: `generateRoute()` in `src/utils/routesUtils.js` derives path, image URL, and GitHub source link from a metadata object. Avoid hand-crafting route objects.
- **Performance**: Use `shallowRef()` for Three.js objects, not `ref()`, to avoid deep reactivity overhead.
- **Assets**: Models → `public/models/`, textures → `public/textures/{category}/`, thumbnails → `public/gifs/{Section}/`.
- **Linting**: `pnpm lint` runs ESLint with autofix. `pnpm format` runs Prettier. Run both before committing.
- **No TypeScript**: The project uses plain `.js` and `.vue` with no tsconfig. Do not introduce TypeScript.
- **No test suite**: There are no unit or e2e tests. Do not add a test runner.
- **No dev-server checks**: Do not run `pnpm dev` to verify changes. Import correctness is sufficient for file-structure tasks.

## Code Style

- Prefer named imports from Three.js: `import { Mesh, BoxGeometry } from 'three'`. Never use `import * as THREE from 'three'`.
- No semicolons, 2-space indent, single quotes, 100-char line width, no trailing commas (enforced by Prettier).
- `<script setup>` syntax for all components.
- Imports from `@/` alias map to `src/`.
- Keep views thin (only canvas setup). Put all scene logic in the demo component.
- Do not add comments unless logic is non-obvious.
- **Ignore all spellchecker diagnostics.** GLSL keywords (`fract`, `NdotV`, `varying`, etc.) and Three.js/TresJS prop names (`metalness`, `roughness`, etc.) are not real errors — never mention or act on spellchecker warnings.

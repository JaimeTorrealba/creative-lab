<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let engine = null
let resizeHandler = null

onMounted(async () => {
  // ─── IMPORTS ──────────────────────────────────────────────────────────────
  // All Babylon.js classes come from a single modular package.
  // Dynamic import here keeps the chunk out of the initial bundle.
  const {
    WebGPUEngine,
    Scene,
    ArcRotateCamera,
    Vector3,
    Color3,
    Color4,
    HemisphericLight,
    DirectionalLight,
    MeshBuilder,
    PBRMaterial,
    Texture,
    ShaderMaterial,
    Effect,
  } = await import('@babylonjs/core')

  // @babylonjs/inspector is a side-effect import — importing it patches the
  // scene.debugLayer API so show() / hide() become available.
  // It's large (~2 MB), so we load it lazily only when the component mounts.
  await import('@babylonjs/inspector')

  const el = canvas.value
  if (!el) return

  // ─── 1. ENGINE ────────────────────────────────────────────────────────────
  // WebGPUEngine is Babylon's modern GPU backend — it targets the WebGPU API
  // instead of WebGL 2. initAsync() must be awaited because it sets up the
  // GPU device (equivalent to navigator.gpu.requestAdapter/requestDevice).
  // If the browser doesn't support WebGPU, Babylon throws here; in production
  // you'd catch and fall back to `new Engine(el)` for WebGL 2.
  engine = new WebGPUEngine(el, {
    antialias: true,
    adaptToDeviceRatio: true, // respects devicePixelRatio for sharp output on HiDPI screens
  })
  await engine.initAsync()

  // ─── LOADING SCREEN ───────────────────────────────────────────────────────
  // displayLoadingUI() shows Babylon's built-in spinner overlay on the canvas.
  // Customize text and background color before calling it.
  engine.loadingUIText = 'Loading scene…'
  engine.loadingUIBackgroundColor = '#0a0a14'
  engine.displayLoadingUI()

  // ─── 2. SCENE ─────────────────────────────────────────────────────────────
  // Scene is the root container — everything (meshes, lights, cameras,
  // materials) lives inside one Scene. clearColor is the background.
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.04, 0.04, 0.08, 1)

  // ─── 3. CAMERA ────────────────────────────────────────────────────────────
  // ArcRotateCamera orbits around a target point — like Three.js OrbitControls.
  // Constructor: (name, alpha, beta, radius, target, scene)
  //   alpha = horizontal rotation angle (radians)
  //   beta  = vertical angle from the pole (radians)
  //   radius = distance from target
  const camera = new ArcRotateCamera('cam', -Math.PI / 4, Math.PI / 3.2, 16, Vector3.Zero(), scene)
  camera.lowerRadiusLimit = 5
  camera.upperRadiusLimit = 40
  camera.wheelPrecision = 50   // slower zoom on mouse wheel
  // attachControl wires pointer/touch events to the canvas for interactive orbit
  camera.attachControl(el, true)

  // ─── 4. LIGHTING ──────────────────────────────────────────────────────────
  // HemisphericLight simulates sky/ground ambient bounce.
  // Great baseline for PBR because it provides soft directional fill.
  // Direction is the "sky" axis — light comes from above.
  const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene)
  hemi.intensity = 0.5
  hemi.diffuse = new Color3(0.25, 0.35, 0.75)    // cool blue sky
  hemi.groundColor = new Color3(0.08, 0.06, 0.04) // warm dark ground bounce

  // DirectionalLight = a parallel sun-like light with no falloff.
  const dirLight = new DirectionalLight('sun', new Vector3(-1, -2, -1).normalize(), scene)
  dirLight.position = new Vector3(10, 15, 10)
  dirLight.intensity = 4.0
  dirLight.diffuse = new Color3(1.0, 0.88, 0.65)  // warm golden sunlight

  // ─── 5. GROUND (PBR + TEXTURES) ───────────────────────────────────────────
  // CreateGround builds a flat XZ-plane. More subdivisions = smoother normal mapping.
  const ground = MeshBuilder.CreateGround('ground', { width: 22, height: 22, subdivisions: 10 }, scene)

  // PBRMaterial = Babylon's physically-based material.
  // It uses the same roughness/metallic (GGX) model as Three.js MeshStandardMaterial.
  const groundMat = new PBRMaterial('groundMat', scene)

  // albedoTexture  → the "base color" map (what the surface looks like in flat light)
  groundMat.albedoTexture = new Texture('/textures/floor_textures/Ground_Wet_002_basecolor.jpg', scene)
  // bumpTexture    → normal map — perturbs surface normals to fake surface detail
  groundMat.bumpTexture = new Texture('/textures/floor_textures/Ground_Wet_002_normal.jpg', scene)
  // ambientTexture → pre-baked ambient occlusion — darkens crevices and contact shadows
  groundMat.ambientTexture = new Texture('/textures/floor_textures/Ground_Wet_002_ambientOcclusion.jpg', scene)

  // Tile the textures 4× across the 22-unit plane so they don't look stretched
  ;[groundMat.albedoTexture, groundMat.bumpTexture, groundMat.ambientTexture].forEach(tex => {
    tex.uScale = 4
    tex.vScale = 4
  })

  // Wet ground = slightly reflective (low roughness) and non-metallic
  groundMat.roughness = 0.3
  groundMat.metallic = 0.0
  ground.material = groundMat

  // ─── 6. SPHERE — CUSTOM SHADER MATERIAL ───────────────────────────────────
  // ShaderMaterial lets you write raw GLSL vertex/fragment shaders.
  // On the WebGPU backend, Babylon automatically compiles GLSL → WGSL at runtime
  // using a built-in NAGA/SPIR-V transpiler — no extra WASM loading needed.
  //
  // If you ever want to write native WGSL instead, use:
  //   new ShaderMaterial(..., { shaderLanguage: ShaderLanguage.WGSL })
  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2.4, segments: 64 }, scene)
  sphere.position.y = 1.2

  // Effect.ShadersStore is Babylon's registry for GLSL source strings.
  // The naming convention is '{key}VertexShader' and '{key}FragmentShader'.
  Effect.ShadersStore['sphereVertexShader'] = `
    precision highp float;

    // Babylon provides these vertex attributes automatically when you list them
    // in the ShaderMaterial 'attributes' array below.
    attribute vec3 position;
    attribute vec3 normal;

    // worldViewProjection = projection * view * world (the full MVP matrix)
    // world = model matrix alone — used to transform normals to world space
    uniform mat4 worldViewProjection;
    uniform mat4 world;

    // Varyings are passed from the vertex shader to the fragment shader,
    // interpolated across the triangle for each pixel.
    varying vec3 vNormal;
    varying vec3 vWorldPos;

    void main() {
      // Transform position to clip space (required output)
      gl_Position = worldViewProjection * vec4(position, 1.0);

      // Transform normal to world space. mat3(world) drops the translation column.
      // This is correct as long as the object isn't non-uniformly scaled —
      // for production use the inverse-transpose (normalMatrix) instead.
      vNormal = normalize(mat3(world) * normal);

      // World-space position is needed in the fragment shader for per-pixel lighting
      vWorldPos = (world * vec4(position, 1.0)).xyz;
    }
  `

  Effect.ShadersStore['sphereFragmentShader'] = `
    precision highp float;

    // Custom uniforms — updated each frame in registerBeforeRender
    uniform float uTime;       // elapsed seconds → drives animation
    uniform vec3  uLightDir;   // direction TOWARD the light (normalized)
    uniform vec3  uCameraPos;  // world-space camera position for specular/Fresnel

    varying vec3 vNormal;
    varying vec3 vWorldPos;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 L = normalize(uLightDir);
      vec3 V = normalize(uCameraPos - vWorldPos);  // view direction
      vec3 H = normalize(L + V);                   // half-vector for Blinn-Phong

      // ── Diffuse (Lambertian) ──────────────────────────────────────────────
      // dot(N, L) = cosine of angle between normal and light; clamped to [0,1]
      float diff = max(dot(N, L), 0.0);

      // ── Specular (Blinn-Phong) ────────────────────────────────────────────
      // Blinn-Phong uses the half-vector instead of the reflection vector —
      // cheaper and avoids the "black fringe" artifact of classic Phong.
      float spec = pow(max(dot(N, H), 0.0), 48.0);

      // ── Fresnel rim ───────────────────────────────────────────────────────
      // Edges of the sphere face away from the camera, so dot(N,V) → 0 there.
      // 1 - dot(N,V) peaks at the silhouette → a glowing rim.
      float rim = pow(1.0 - max(dot(N, V), 0.0), 2.5);

      // ── Animated base color ───────────────────────────────────────────────
      // Sine waves on each channel create a slowly shifting iridescent blue-purple
      vec3 baseColor = vec3(
        0.04 + 0.04 * sin(uTime * 0.4),
        0.22 + 0.12 * sin(uTime * 0.3 + 1.0),
        0.80 + 0.15 * sin(uTime * 0.5 + 2.0)
      );

      // Rim glow shifts between orange and teal
      vec3 rimColor = vec3(
        0.90 + 0.10 * sin(uTime * 0.7),
        0.45 + 0.30 * sin(uTime * 0.6 + 1.2),
        0.10 + 0.20 * sin(uTime * 0.8)
      );

      // ── Combine terms ─────────────────────────────────────────────────────
      vec3 color = baseColor * (diff + 0.06)  // diffuse + tiny ambient
                 + vec3(1.0)  * spec * 0.55   // white specular highlight
                 + rimColor   * rim  * 0.75;  // Fresnel rim glow

      gl_FragColor = vec4(color, 1.0);
    }
  `

  // ShaderMaterial constructor: (name, scene, shaderBaseName, options)
  // 'sphere' in the third arg matches 'sphereVertex/FragmentShader' in ShadersStore.
  const sphereMat = new ShaderMaterial('sphereMat', scene, 'sphere', {
    attributes: ['position', 'normal'],
    uniforms: ['worldViewProjection', 'world', 'uTime', 'uLightDir', 'uCameraPos'],
  })
  sphere.material = sphereMat

  // ─── 7. PER-FRAME UPDATES ─────────────────────────────────────────────────
  // registerBeforeRender fires once per frame before the scene is drawn.
  // We use it to push new uniform values to the sphere shader.
  scene.registerBeforeRender(() => {
    const t = performance.now() / 1000  // elapsed time in seconds

    sphereMat.setFloat('uTime', t)
    // dirLight.direction points FROM source TOWARD scene — negate for "toward light"
    sphereMat.setVector3('uLightDir', dirLight.direction.negate())
    sphereMat.setVector3('uCameraPos', camera.position)
  })

  // ─── 8. INSPECTOR ─────────────────────────────────────────────────────────
  // debugLayer.show() opens the Babylon Inspector panel embedded in the canvas
  // wrapper. embedMode: true keeps it inside the div instead of a pop-up window.
  // Press I to toggle it on/off while the demo is running.
  scene.debugLayer.show({ embedMode: true })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'i' || e.key === 'I') {
      if (scene.debugLayer.isVisible()) {
        scene.debugLayer.hide()
      } else {
        scene.debugLayer.show({ embedMode: true })
      }
    }
  })

  // ─── 9. RENDER LOOP ───────────────────────────────────────────────────────
  // runRenderLoop fires at the display refresh rate (typically 60 fps).
  // scene.render() processes the scene graph, runs shaders, and presents the frame.
  engine.runRenderLoop(() => scene.render())

  // scene.executeWhenReady fires once all textures are uploaded to the GPU and
  // all shaders are compiled — the earliest point the scene can render correctly.
  // That's when we hide the loading screen.
  scene.executeWhenReady(() => engine.hideLoadingUI())

  // engine.resize() recalculates the viewport and projection matrix to match
  // the new canvas dimensions whenever the window is resized.
  resizeHandler = () => engine.resize()
  window.addEventListener('resize', resizeHandler)
})

// ─── CLEANUP ──────────────────────────────────────────────────────────────────
// Vue calls onUnmounted when the component is removed from the DOM (e.g. routing
// away). engine.dispose() releases all GPU resources: textures, buffers, pipelines.
// Always dispose to prevent memory/GPU leaks in a SPA.
onUnmounted(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  engine?.dispose()
})
</script>

<template>
  <div style="width: 100%; height: 100vh; background: #0a0a14;">
    <canvas ref="canvas" style="display: block; width: 100%; height: 100%;" />
  </div>
</template>

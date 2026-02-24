<script setup>
import { useTexture, OrbitControls } from "@tresjs/cientos";
import { useTres } from "@tresjs/core";
import { EquirectangularReflectionMapping, Vector3, BufferGeometry, Color } from "three";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";
import { Pane } from "tweakpane";
import { reactive, shallowRef, watch, onUnmounted } from "vue";
import { EffectComposer, UnrealBloom } from "@tresjs/post-processing";

const { scene } = useTres();

const options = reactive({
  autoRotateSpeed: 1,
  numPoints: 1000,
  pointSize: 20,
  pointScale: 1,
  pointColor: "#ff00ff",
  opacity: 1,
  bloomRadius: 0.5,
  bloomIntensity: 1.5,
  bloomThreshold: 0.8,
});

const pointsGeometry = shallowRef(null);

const hdrEquirect = await new EXRLoader().loadAsync(
  "/textures/NightSkyHDRI008_2K_HDR.exr"
);
hdrEquirect.mapping = EquirectangularReflectionMapping;
// scene.value.environment = hdrEquirect;
scene.value.background = hdrEquirect;

const { state } = useTexture("/textures/2k_moon.jpg");

const shader = {
  uniforms: {
    uSize: { value: options.pointSize },
    aScale: { value: options.pointScale },
    vColor: { value: new Color(options.pointColor) },
  },
  vertexShader: `
  uniform float uSize;
  uniform float aScale;
    void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

                  //random
    gl_PointSize = uSize * aScale;
            //atenuacion
    gl_PointSize *= (1.0 / -viewPosition.z *1.5);
    }
  `,
  fragmentShader: `
  uniform vec3 vColor;
    void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength *= 2.0;
    strength = 1.0 - strength;

    if (strength <= 0.0) {
      discard;
    }

    //final color
    vec3 color = mix(vec3(0.0), vColor, strength);

    gl_FragColor = vec4(color, strength);
    }
  `,
  transparent: true,
  toneMapped: false
};

function randomPointOnSphere(radius = 1) {
  const u = Math.random();
  const v = Math.random();

  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);

  return new Vector3(x, y, z);
}

function updatePointsGeometry() {
  const points = Array.from({ length: options.numPoints }, () =>
    randomPointOnSphere(1.01)
  );
  const nextGeometry = new BufferGeometry().setFromPoints(points);

  if (pointsGeometry.value) {
    pointsGeometry.value.dispose();
  }

  pointsGeometry.value = nextGeometry;
}

updatePointsGeometry();

watch(
  () => options.numPoints,
  () => {
    updatePointsGeometry();
  }
);

const pane = new Pane({ title: "Moon" });
pane.addBinding(options, "autoRotateSpeed", {
  label: "Auto Rotate",
  min: 0,
  max: 10,
  step: 0.1,
});
pane.addBinding(options, "numPoints", {
  label: "Num Points",
  min: 100,
  max: 15000,
  step: 100,
});
pane.addBinding(options, "pointSize", {
  label: "Point Size",
  min: 1,
  max: 80,
  step: 1,
});
pane.addBinding(options, "pointScale", {
  label: "Point Scale",
  min: 0.1,
  max: 5,
  step: 0.1,
});
pane.addBinding(options, "pointColor", {
  label: "Point Color",
  view: "color",
});
pane.addBinding(options, "opacity", {
  label: "Point Opacity",
  min: 0,
  max: 1,
  step: 0.01,
});
pane.addBinding(options, "bloomRadius", {
  label: "Bloom Radius",
  min: 0,
  max: 1,
  step: 0.01,
});
pane.addBinding(options, "bloomIntensity", {
  label: "Bloom Intensity",
  min: 0,
  max: 5,
  step: 0.01,
});
pane.addBinding(options, "bloomThreshold", {
  label: "Bloom Threshold",
  min: 0,
  max: 1,
  step: 0.01,
});

watch(
  () => [options.pointSize, options.pointScale, options.pointColor],
  ([pointSize, pointScale, pointColor]) => {
    shader.uniforms.uSize.value = pointSize;
    shader.uniforms.aScale.value = pointScale;
    shader.uniforms.vColor.value.set(pointColor);
  },
  { immediate: true }
);

onUnmounted(() => {
  pane.dispose();
  pointsGeometry.value?.dispose();
});
</script>
<template>
  <OrbitControls
    auto-rotate
    :autoRotateSpeed="options.autoRotateSpeed"
    :enable-pan="false"
  />
  <TresMesh>
    <TresIcosahedronGeometry :args="[1, 32]" />
    <TresMeshStandardMaterial :map="state" />
  </TresMesh>
  <TresPoints :geometry="pointsGeometry">
    <TresShaderMaterial v-bind="shader" :opacity="options.opacity" />
  </TresPoints>
  <!-- <TresDirectionalLight :position="[5, 5, 5]" :intensity="1.5" /> -->
  <TresAmbientLight :intensity="0.5" />
    <Suspense>
  <EffectComposer>
    <UnrealBloom :radius="options.bloomRadius" :strength="options.bloomIntensity" :threshold="options.bloomThreshold" />
  </EffectComposer>
    </Suspense>
</template>

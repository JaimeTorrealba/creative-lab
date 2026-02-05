<script setup>
import { reactive, computed, watch, shallowRef } from "vue";
import { useLoop } from "@tresjs/core";
import { useGLTF } from "@tresjs/cientos";
import vertexShader from "./shaders/MorphingParticles/vertex.glsl";
import fragmentShader from "./shaders/MorphingParticles/fragment.glsl";
import {
  Uniform,
  Vector2,
  AdditiveBlending,
  Float32BufferAttribute,
  BufferAttribute,
  Color,
} from "three";
import { useDevicePixelRatio } from "@vueuse/core";
import gsap from "gsap";
import { Pane } from "tweakpane";

const options = {
  colorA: "#0091ff",
  colorB: "#d400ff",
  progress: 0.0,
};

const pane = new Pane();

pane.addBinding(options, "colorA", { label: "Color A" }).on("change", (ev) => {
  uniforms.uColorA.value = new Color(ev.value);
});
pane.addBinding(options, "colorB", { label: "Color B" }).on("change", (ev) => {
  uniforms.uColorB.value = new Color(ev.value);
});
pane
  .addBinding(options, "progress", {
    label: "Progress",
    min: 0.0,
    max: 1.0,
    step: 0.01,
  })
  .on("change", (ev) => {
    uniforms.uProgress.value = ev.value;
  });
pane.addButton({ title: "Morph 0", label: "Morph" }).on("click", () => particles.morph(0));
pane.addButton({ title: "Morph 1", label: "Morph" }).on("click", () => particles.morph(1));
pane.addButton({ title: "Morph 2", label: "Morph" }).on("click", () => particles.morph(2));
pane.addButton({ title: "Morph 3", label: "Morph" }).on("click", () => particles.morph(3));



const { pixelRatio } = useDevicePixelRatio();
const uniforms = {
  uTime: new Uniform(0),
  uResolution: new Uniform(new Vector2(1 * pixelRatio.value, 1 * pixelRatio.value)),
  uSize: new Uniform(75.0),
  uProgress: new Uniform(0.0),
  uColorA: new Uniform(new Color("#ffffff")),
  uColorB: new Uniform(new Color("#ffffff")),
};

const pointsRef = shallowRef(null);

// State

const particles = reactive({
  positions: [],
  maxCount: 0,
  index: 0,
});

particles.morph = (index) => {
  // Update attributes
  pointsRef.value.geometry.attributes.position = particles.positions[particles.index];
  pointsRef.value.geometry.attributes.aPositionTarget = particles.positions[index]

  // Animate uProgress
  gsap.fromTo(
    pointsRef.value.material.uniforms.uProgress,
    { value: 0 },
    { value: 1, duration: 1.5, ease: "linear" }
  );

  // Save index
  particles.index = index;
};

// Load models

const { state: model1 } = useGLTF("/models/models_particle_morphing.glb", {
  draco: true,
});
const models = computed(() => model1.value);
watch(
  () => models.value,
  (_models) => {
    if (_models) {
      const positions = _models.scene.children.map(
        (child) => child.geometry.attributes.position
      );
      for (const position of positions) {
        if (position.count > particles.maxCount) particles.maxCount = position.count;
      }

      //Random sizes
      const sizesArray = new Float32Array(particles.maxCount);
      for (let i = 0; i < particles.maxCount; i++) {
        sizesArray[i] = Math.random();
      }
      particles.sizes = new BufferAttribute(sizesArray, 1);

      // We harmonize the positions by the max count
      for (const position of positions) {
        const originalArray = position.array;
        const newArray = new Float32Array(particles.maxCount * 3);
        for (let i = 0; i < particles.maxCount; i++) {
          const i3 = i * 3;

          if (i3 < originalArray.length) {
            newArray[i3] = originalArray[i3];
            newArray[i3 + 1] = originalArray[i3 + 1];
            newArray[i3 + 2] = originalArray[i3 + 2];
          } else {
            const randomIndex = Math.floor(position.count * Math.random()) * 3;
            newArray[i3 + 0] = position.array[randomIndex + 0];
            newArray[i3 + 1] = position.array[randomIndex + 1];
            newArray[i3 + 2] = position.array[randomIndex + 2];
          }
        }
        particles.positions.push(new Float32BufferAttribute(newArray, 3));
      }
    }
  }
);

const { onBeforeRender } = useLoop();

onBeforeRender(({ elapsed }) => {
  uniforms.uTime.value = elapsed;
});
</script>
<template>
  <TresPoints ref="pointsRef">
    <TresBufferGeometry
      v-if="particles.positions.length > 0"
      :position="[particles.positions[0].array, 3]"
      :a-position-target="[particles.positions[1].array, 3]"
      :a-size="[particles.sizes.array, 1]"
    />
    <TresShaderMaterial
      :vertex-shader="vertexShader"
      :fragment-shader="fragmentShader"
      :uniforms="uniforms"
      :transparent="true"
      :blending="AdditiveBlending"
      :depth-write="false"
    />
  </TresPoints>
</template>

<script setup>
import { DoubleSide } from "three";
import { useLoop } from "@tresjs/core";
import vertex from "./shaders/Slash/vertex.glsl";
import fragment from "./shaders/Slash/fragment.glsl";
import { Pane } from "tweakpane";
import { gsap } from "gsap";
import { computed, shallowRef, ref } from "vue";
import { useGLTF, useAnimations } from "@tresjs/cientos";
import { watchOnce } from "@vueuse/core";

const { state, isLoading } = useGLTF("/models/footman/source/Footman_RIG.glb");

watchOnce(isLoading, (v) => {
  if (!v) {
    currentAction.value = actions.Idle;
    currentAction.value.play();
  }
});

const animations = computed(() => state.value?.animations || []);
const model = computed(() => state?.value?.scene);
const { actions, mixer } = useAnimations(animations, model, {
  manualUpdate: true,
});
const fadeDuration = 0.2;
const currentAction = ref();
const waitForAnimation = ref();

document.addEventListener("click", () => {
  waitForAnimation.value = true;
  changeAnimation(actions.SwordAndShieldSlash);
  onSlash();
});

const changeAnimation = (action) => {
  currentAction.value.fadeOut(fadeDuration);
  action.reset().fadeIn(fadeDuration).play();
  currentAction.value = action;
  if (action === actions.SwordAndShieldSlash) {
    mixer.value.addEventListener("loop", () => {
      changeAnimation(actions.Idle);
      waitForAnimation.value = false;
    });
  }
};

const slashRef = shallowRef();

const shader = {
  uniforms: {
    uAppear: { value: 0 },
    uDisappear: { value: 1 },
    uTime: { value: 0 },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  side: DoubleSide,
  transparent: true,
};

const pane = new Pane();
pane.addBinding(shader.uniforms.uAppear, "value", {
  min: 0,
  max: 1,
  step: 0.01,
  label: "Appear",
});
pane.addBinding(shader.uniforms.uDisappear, "value", {
  min: 0,
  max: 1,
  step: 0.01,
  label: "Disappear",
});

const onSlash = () => {
  const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 0.2 } });
  tl.to(shader.uniforms.uAppear, {
    value: 1,
    delay: 0.5,
  })
    .to(
      slashRef.value.scale,
      {
        x: 1.15,
        y: 1.15,
      },
      "-=0.05"
    )
    .to(
      slashRef.value.position,
      {
        x: 1,
        duration: 0.1,
      },
      "<"
    ).to(shader.uniforms.uDisappear, {
        value: 0,
        duration:0.1,
        onComplete: () => {
          shader.uniforms.uAppear.value = 0;
          shader.uniforms.uDisappear.value = 1;
        },
      })
};

const { onBeforeRender } = useLoop();
onBeforeRender(({ elapsed, delta }) => {
  shader.uniforms.uTime.value = elapsed;
  mixer.value.update(delta * 1.5);
});
</script>
<template>
  <primitive v-if="model" :object="model" :rotation-y="Math.PI * 0.5" />
  <TresMesh
    ref="slashRef"
    @click="onSlash"
    :rotation="[-Math.PI * 0.5 + 0.27, 0, -Math.PI * 0.5]"
    :position="[0.67, 1.2, 0]"
  >
    <TresRingGeometry :args="[1.3, 2, 32, 32, 0.6, 3.1416]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>

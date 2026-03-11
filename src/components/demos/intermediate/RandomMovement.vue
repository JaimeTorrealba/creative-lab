<script setup>
import { computed, watch } from "vue";
import { useTres, useLoop } from "@tresjs/core";
import { useGLTF } from "@tresjs/cientos";
import { gsap } from "gsap";
import { AnimationMixer } from "three";

const { scene } = useTres();

const pxPerSecond = 2.5;
const INSTANCES = 10;

const mixers = [];

Array.from({ length: INSTANCES }).forEach(() => {
  const { state, isLoading } = useGLTF("/models/ant.glb", { draco: true });
  const model = computed(() => state.value?.scene);
  const animations = computed(() => state.value?.animations || []);

  watch(
    isLoading,
    (val) => {
      if (!val && model.value) {
        const mixer = new AnimationMixer(model.value);
        mixer.clipAction(animations.value[0], model.value).play();
        mixers.push(mixer);
        // Random scale and initial Y
        model.value.position.y = -2;
        const scale = Math.random() * 10 + 5;
        model.value.scale.set(scale, scale, scale);

        // Start roaming animation
        moveMe(model.value);

        // Add to scene
        scene.value.add(model.value);
      }
    },
  );
});

function moveMe(target) {
  const newPos = {
    x: gsap.utils.random(-5, 5),
    z: gsap.utils.random(-5, 5),
  };
  const curPos = {
    x: gsap.getProperty(target.position, "x"),
    z: gsap.getProperty(target.position, "z"),
  };
  const deltaX = curPos.x - newPos.x;
  const deltaZ = curPos.z - newPos.z;
  const distance = Math.hypot(deltaX, deltaZ);
  const duration = distance / pxPerSecond;

  target.lookAt(newPos.x, -2, newPos.z);

  gsap.to(target.position, {
    x: newPos.x,
    z: newPos.z,
    duration: duration,
    ease: "none",
    onComplete: moveMe,
    onCompleteParams: [target],
  });
}

const { onBeforeRender } = useLoop();
onBeforeRender(({ delta }) => {
  mixers.forEach((mixer) => mixer.update(delta));
});
</script>
<template>
  <TresGroup></TresGroup>
</template>

<script setup>
import { ref, shallowRef, computed } from "vue";
import { useLoop, useTres } from "@tresjs/core";
import { OrbitControls, useGLTF, useAnimations } from "@tresjs/cientos";
import { Vector3, DoubleSide } from "three";
import { watchOnce } from "@vueuse/core";

const { state, isLoading } = useGLTF("/models/footman/source/Footman_RIG.glb");

const animations = computed(() => state.value?.animations || []);
const model = computed(() => state?.value?.scene);
const { actions, mixer } = useAnimations(animations, model);

watchOnce(isLoading, (v) => {
  if (!v) {
    currentAction.value = actions.Idle;
    currentAction.value.play();
  }
});

//constants
const fadeDuration = 0.2;

// template ref
const { camera } = useTres();
const cameraTarget = new Vector3();
const orbitControlsRef = shallowRef();
const highlighter = shallowRef(null);
const waitForAnimation = ref(false);
const destination = ref(new Vector3());


const currentAction = ref(null);

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

const onSelect = (e) => {
  const highlighterPos = new Vector3().copy(e.point).floor().addScalar(0.5);
  highlighter.value.position.set(highlighterPos.x, 0, highlighterPos.z);
  highlighter.value.visible = true;
};

const moveCharacter = () => {
  destination.value.x = highlighter.value.position.x;
  destination.value.y = 0;
  destination.value.z = highlighter.value.position.z;
  model.value.lookAt(destination.value);
  changeAnimation(actions.SwordAndShieldRun);
  setTimeout(() => {
    changeAnimation(actions.Idle);
  }, 500);
};
const { onBeforeRender } = useLoop();

onBeforeRender(({ delta }) => {
  mixer.value.update(delta * 0.5);
  if (!model.value || !camera.value) return;
  orbitControlsRef.value.instance.update();

  model.value.position.x += (destination.value.x - model.value.position.x) * 0.1 * 0.5;
  model.value.position.z += (destination.value.z - model.value.position.z) * 0.1 * 0.5;

  // move camera
  camera.value.position.x += (destination.value.x - model.value.position.x) * 0.1 * 0.5;
  camera.value.position.z += (destination.value.z - model.value.position.z) * 0.1 * 0.5;
  cameraTarget.x = model.value.position.x;
  cameraTarget.y = model.value.position.y;
  cameraTarget.z = model.value.position.z;
  orbitControlsRef.value.instance.target = cameraTarget;
});
</script>
<template>
  <OrbitControls
    enableDamping
    :enable-pan="false"
    :min-distance="5"
    :max-distance="15"
    :max-polar-angle="Math.PI / 2 - 0.05"
    ref="orbitControlsRef"
  />
  <primitive v-if="model" :object="model" />
  <!-- GRID -->
  <TresMesh ref="highlighter" :position="[0.5, 0, 0.5]" :rotation-x="-Math.PI * 0.5">
    <TresPlaneGeometry :args="[1, 1]" />
    <TresMeshBasicMaterial :color="0xf7f7f7" :side="DoubleSide" />
  </TresMesh>
  <TresMesh
    name="ground"
    :rotation-x="-Math.PI * 0.5"
    :visible="false"
    @click="moveCharacter()"
    @pointermove="(e) => onSelect(e)"
  >
    <TresPlaneGeometry :args="[10, 10, 32]" />
    <TresMeshBasicMaterial :color="0x00ff00" :side="DoubleSide" />
  </TresMesh>
  <TresGridHelper :size="5" :divisions="10" />
  <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
  <TresAmbientLight />
</template>

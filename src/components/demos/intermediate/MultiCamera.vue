<script setup>
import { useLoop } from "@tresjs/core";
import { Pane } from "tweakpane";
import { computed } from "vue";
import { useAnimations, useGLTF } from "@tresjs/cientos";
import { PerspectiveCamera, Vector4, Vector3 } from "three";
import { useWindowSize, useDevicePixelRatio, watchOnce } from "@vueuse/core";

const { width, height } = useWindowSize();
const { pixelRatio } = useDevicePixelRatio();
const WIDTH = (width.value / 4) * pixelRatio.value;
const HEIGHT = (height.value / 4) * pixelRatio.value;
const ASPECT_RATIO = computed(() => width.value / height.value);

const cameras = [];

const cameraOptions = [
  {
    viewPort: new Vector4(0, 0, Math.ceil(WIDTH * 2), Math.ceil(HEIGHT * 2)),
    position: new Vector3(15, 0, 3),
    factor: 0.4,
    name: "left_bottom",
  },
  {
    viewPort: new Vector4(
      Math.floor(WIDTH),
      0,
      Math.ceil(WIDTH * 2),
      Math.ceil(HEIGHT * 2)
    ),
    position: new Vector3(0, 0, -3),
    factor: 2,
    name: "center_bottom",
  },
  {
    viewPort: new Vector4(
      Math.floor(WIDTH * 2),
      0,
      Math.ceil(WIDTH * 2),
      Math.ceil(HEIGHT * 2)
    ),
    position: new Vector3(-15, 0, 3),
    factor: 0.4,
    name: "right_bottom",
  },
  {
    viewPort: new Vector4(
      Math.floor(WIDTH - 75),
      Math.floor(HEIGHT),
      Math.ceil(WIDTH * 2.5),
      Math.ceil(HEIGHT * 2.5)
    ),
    position: new Vector3(0, 0, 3),
    factor: 2,
    name: "center_top",
  },
];

cameraOptions.forEach((data) => {
  const currentCam = new PerspectiveCamera(40, ASPECT_RATIO.value, 0.1, 10);
  currentCam.name = data.name;
  currentCam.viewport = data.viewPort;
  currentCam.position.set(...data.position);
  currentCam.position.multiplyScalar(data.factor);
  currentCam.lookAt(0, 0, 0);
  currentCam.updateMatrixWorld();
  cameras.push(currentCam);
});

const { state, isLoading } = useGLTF(
  "/models/footman/source/Footman_RIG.glb"
);

const animations = computed(() => state.value?.animations || [])
const model = computed(() => state?.value?.scene)
const { actions, mixer } = useAnimations(animations, model)
let currentAction = null;

watchOnce(isLoading, (val) => {
  if (!val) {
    currentAction = actions.Idle;
    currentAction.play();
  }
});

const pane = new Pane();

const animationList = pane.addBlade({
  view: "list",
  label: "Animations",
  options: [
    { text: "Idle", value: "Idle" },
    { text: "SwordAndShieldCrouchBlockIdle", value: "SwordAndShieldCrouchBlockIdle" },
    { text: "SwordAndShieldDeath_2", value: "SwordAndShieldDeath_2" },
    { text: "SwordAndShieldIdle", value: "SwordAndShieldIdle" },
    { text: "SwordAndShieldKick", value: "SwordAndShieldKick" },
    { text: "SwordAndShieldRun(back)", value: "SwordAndShieldRun(back)" },
    { text: "SwordAndShieldRun", value: "SwordAndShieldRun" },
    { text: "SwordAndShieldSlash_2", value: "SwordAndShieldSlash_2" },
    { text: "SwordAndShieldSlash", value: "SwordAndShieldSlash" },
    { text: "T-Pose", value: "T-Pose" },
  ],
  value: "Idle",
});

animationList.on("change", (value) => {
  currentAction.stop();
  currentAction = actions[value.value];
  currentAction.play();
});

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  if (mixer.value) {
    mixer.value.update(0.01);
  }
});
</script>
<template>
    <TresArrayCamera :args="[cameras]" :position="[0, 2, 5]" />
    <primitive v-if="model" :object="model" />
</template>
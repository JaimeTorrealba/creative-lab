<script setup>
import { useTres, useLoop } from "@tresjs/core";
import { Text3D } from "@tresjs/cientos";
import { AdditiveBlending, Color, IcosahedronGeometry } from "three";
import { Pane } from "tweakpane";
import vertex from "./shaders/glow/vertex.glsl";
import fragment from "./shaders/glow/fragment.glsl";
import { useTexture } from "@tresjs/cientos";
import { reactive, shallowRef } from "vue";

const fontPath =
  "https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json";

const { camera } = useTres();

const shader = {
  uniforms: {
    c: { value: 1.0 },
    power: { value: 1.4 },
    glowColor: { value: new Color(0xffff00) },
    viewVector: { value: camera.value.position },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  blending: AdditiveBlending,
  transparent: true,
};

const pane = new Pane();

const glowFolder = pane.addFolder({ title: "Glow Shader" });
glowFolder.addBinding(shader.uniforms.c, "value", {
  min: 0,
  max: 5,
  step: 0.1,
  label: "c",
});
glowFolder.addBinding(shader.uniforms.power, "value", {
  min: 0,
  max: 5,
  step: 0.1,
  label: "power",
});
glowFolder
  .addBinding(shader.uniforms.glowColor, "value", {
    label: "glowColor",
  })
  .on("change", ({ value }) => {
    shader.uniforms.glowColor.value.r = value.r / 255;
    shader.uniforms.glowColor.value.g = value.g / 255;
    shader.uniforms.glowColor.value.b = value.b / 255;
  });

const geometry = new IcosahedronGeometry(1, 32);

const { state: texture, isLoading } = useTexture("/textures/glow.png");
const spriteMaterialRef = shallowRef();
const textRef = shallowRef();
const text1Ref = shallowRef();

const options = reactive({
  offsetX: 0,
  offsetY: 0,
  scale: 1.5,
  color: new Color(0x0000ff),
});

const glowFolderNoShader = pane.addFolder({ title: "Glow no Shader" });
glowFolderNoShader.addBinding(options, "offsetX", {
  min: -1,
  max: 1,
  step: 0.01,
  label: "offsetX",
});

glowFolderNoShader.addBinding(options, "offsetY", {
  min: -1,
  max: 1,
  step: 0.01,
  label: "offsetY",
});

glowFolderNoShader.addBinding(options, "scale", {
  min: 0,
  max: 5,
  step: 0.1,
  label: "scale",
});

glowFolderNoShader
  .addBinding(options, "color", {
    label: "color",
  })
  .on("change", ({ value }) => {
    if (spriteMaterialRef.value) {
      spriteMaterialRef.value.color.r = value.r / 255;
      spriteMaterialRef.value.color.g = value.g / 255;
      spriteMaterialRef.value.color.b = value.b / 255;
    }
  });

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  if (textRef.value && text1Ref.value) {
    textRef.value.instance.lookAt(camera.value.position);
    text1Ref.value.instance.lookAt(camera.value.position);
  }
});
</script>
<template>
  <Suspense>
    <Text3D
      ref="textRef"
      text="Shader"
      :position="[-2, 2, 0]"
      :font="fontPath"
      :size="0.15"
    />
  </Suspense>
  <TresMesh :geometry="geometry" :position-x="-2" :scale="1.5">
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
  <TresMesh :geometry="geometry" :position-x="-2">
    <TresMeshBasicMaterial />
  </TresMesh>
  <!-- NO SHADER -->
  <Suspense>
    <Text3D
      ref="text1Ref"
      text="No Shader"
      :position="[2, 2, 0]"
      :font="fontPath"
      :size="0.15"
    />
  </Suspense>
  <TresMesh :geometry="geometry" :position-x="2">
    <TresMeshLambertMaterial />
  </TresMesh>
  <TresSprite
    v-if="!isLoading"
    :geometry="geometry"
    :position-x="2"
    :scale="options.scale"
  >
    <!-- :alignment="SpriteAlignment.center" -->
    <TresSpriteMaterial
      ref="spriteMaterialRef"
      :map="texture"
      :map-offset-x="options.offsetX"
      :map-offset-y="options.offsetY"
      :useScreenCoordinates="false"
      :blending="AdditiveBlending"
    />
  </TresSprite>
</template>

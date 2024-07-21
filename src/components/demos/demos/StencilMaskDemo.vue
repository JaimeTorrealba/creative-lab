<script setup>
import { AlwaysStencilFunc, EqualStencilFunc, ReplaceStencilOp } from 'three'
</script>
<template>
    <TresMesh name="front-face">
        <TresPlaneGeometry :args="[1, 1]" />
        <TresMeshPhongMaterial v-log :color="0xf7f7f7" stencil-write :stencil-ref="1" :stencil-func="AlwaysStencilFunc"
          :stencil-z-pass="ReplaceStencilOp" :depth-write="false" />
      </TresMesh>
      <TresMesh name="front-face-object" :position-z="-1" :scale="0.5">
        <TresIcosahedronGeometry :args="[1, 8]" />
        <TresMeshPhongMaterial :color="0xff0000" stencil-write :stencil-ref="1" :stencil-func="EqualStencilFunc" />
      </TresMesh>
      <!-- bottom-face -->
      <TresMesh name="bottom-face" :rotation-x="Math.PI * 0.5" :position="[0, -0.5, -0.5]">
        <TresPlaneGeometry :args="[1, 1]" />
        <TresMeshPhongMaterial v-log :color="0xf7f7f7" stencil-write :stencil-ref="2" :stencil-func="AlwaysStencilFunc"
          :stencil-z-pass="ReplaceStencilOp" :depth-write="false" />
      </TresMesh>
      <TresMesh name="bottom-face-object" :position-z="-0.5" :scale="0.5">
        <TresBoxGeometry :args="[1, 1,1]" />
        <TresMeshPhongMaterial :color="0xffff00" stencil-write :stencil-ref="2" :stencil-func="EqualStencilFunc" />
      </TresMesh>
      <!-- top-face -->
      <TresMesh name="top-face" :rotation-x="Math.PI * -0.5" :position="[0, 0.5, -0.5]">
        <TresPlaneGeometry :args="[1, 1]" />
        <TresMeshPhongMaterial v-log :color="0xf7f7f7" stencil-write :stencil-ref="3" :stencil-func="AlwaysStencilFunc"
          :stencil-z-pass="ReplaceStencilOp" :depth-write="false" />
      </TresMesh>
      <TresMesh name="top-face-object" :position-z="-0.5" :scale="0.05">
        <TresConeGeometry :args="[5, 10]" />
        <TresMeshPhongMaterial :color="0xff00ff" stencil-write :stencil-ref="3" :stencil-func="EqualStencilFunc" />
      </TresMesh>
      <!-- left-face -->
      <TresMesh name="left-face" :rotation-y="Math.PI * -0.5" :position="[-0.5, 0, -0.5]">
        <TresPlaneGeometry :args="[1, 1]" />
        <TresMeshPhongMaterial v-log :color="0xf7f7f7" stencil-write :stencil-ref="4" :stencil-func="AlwaysStencilFunc"
          :stencil-z-pass="ReplaceStencilOp" :depth-write="false" />
      </TresMesh>
      <TresMesh name="left-face-object" :position-z="-0.5" :scale="0.05">
        <TresCapsuleGeometry :args="[5, 5]" />
        <TresMeshPhongMaterial :color="0x00ff00" stencil-write :stencil-ref="4" :stencil-func="EqualStencilFunc" />
      </TresMesh>
      <!-- right-face -->
      <TresMesh name="right-face" :rotation-y="Math.PI * 0.5" :position="[0.5, 0, -0.5]">
        <TresPlaneGeometry :args="[1, 1]" />
        <TresMeshPhongMaterial v-log :color="0xf7f7f7" stencil-write :stencil-ref="5" :stencil-func="AlwaysStencilFunc"
          :stencil-z-pass="ReplaceStencilOp" :depth-write="false" />
      </TresMesh>
      <TresMesh name="right-face-object" :position-z="-0.5" :scale="0.05">
        <TresTorusGeometry :args="[5, 2]" />
        <TresMeshPhongMaterial :color="0x00ff" stencil-write :stencil-ref="5" :stencil-func="EqualStencilFunc" />
      </TresMesh>
      <!-- back-face -->
      <TresMesh name="back-face" :rotation-y="Math.PI" :position="[0, 0, -1]">
        <TresPlaneGeometry :args="[1, 1]" />
        <TresMeshPhongMaterial v-log :color="0xf7f7f7" stencil-write :stencil-ref="6" :stencil-func="AlwaysStencilFunc"
          :stencil-z-pass="ReplaceStencilOp" :depth-write="false" />
      </TresMesh>
      <TresMesh name="back-face-object" :position-z="-0.5" :scale="0.05">
        <TresDodecahedronGeometry :args="[5, 0]" />
        <TresMeshPhongMaterial :color="0x111" stencil-write :stencil-ref="6" :stencil-func="EqualStencilFunc" />
      </TresMesh>
</template>
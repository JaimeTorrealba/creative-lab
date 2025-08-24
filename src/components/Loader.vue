<script setup>
</script>
<template>
    <div class="custom-loader"></div>
</template>
<style scoped>
.custom-loader {
  --s: 20px;
  
  --_d: calc(0.353*var(--s));
  width: calc(var(--s) + var(--_d));
  aspect-ratio: 1;
  display: grid;
}
.custom-loader:before,
.custom-loader:after {
  content: "";
  grid-area: 1/1;
  clip-path: polygon(var(--_d) 0,100% 0,100% calc(100% - var(--_d)),calc(100% - var(--_d)) 100%,0 100%,0 var(--_d));
  background:
    conic-gradient(from -90deg at calc(100% - var(--_d)) var(--_d),
     #fff 135deg,#666 0 270deg,#aaa 0);
  animation: l6 2s infinite;
}
.custom-loader:after {
  animation-delay:-1s;
}
@keyframes l6{
  0%  {transform:translate(0,0)}
  25% {transform:translate(30px,0)}
  50% {transform:translate(30px,30px)}
  75% {transform:translate(0,30px)}
  100%{transform:translate(0,0)}
}
</style>
<script setup>
import theNavbar from './components/layout/theNavbar.vue'

</script>

<template>
    <theNavbar />
    <router-view></router-view>
</template>

<style lang="scss">
@font-face {
  font-family: 'CascadiaCode';
  font-display: swap;
  src: local('CascadiaCode'),
      url('./assets/fonts/CascadiaCode.woff2') format('truetype');
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: 'CascadiaCode';
}
#app {
  height: 100%;
  width: 100%;
  background-color: #000;
  max-height: 100vh;
  overflow: hidden;
}

.debug{
  border: 1px solid red;
}

$navbar-item-color: #fff;
$navbar-item-hover-color: #fff;

</style>

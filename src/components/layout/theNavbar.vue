<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  $navbarBurgers.forEach( el => {
    el.addEventListener('click', () => {
      const target = el.dataset.target;
      const $target = document.getElementById(target);
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');
    });
  });
})
</script>
<template>
  <nav class="navbar is-black" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <a href="https://tresjs.org/" target="_blank" class="flex-align-center">
            <img src="../../assets/tresJs.svg" width="112" height="28" />
        </a>
      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-start">
        <router-link to="/" class="link flex-align-center"> Home </router-link>
        <router-link to="/MouseShaderEffect" class="link flex-align-center"> Mouse Shader Effect </router-link>
        <router-link to="/DynamicTextEffect" class="link flex-align-center"> Dynamic 3DText Effect </router-link>

        <!-- <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link"> More </a>

          <div class="navbar-dropdown">
            <a class="navbar-item"> About </a>
            <a class="navbar-item"> Jobs </a>
            <a class="navbar-item"> Contact </a>
            <hr class="navbar-divider" />
            <a class="navbar-item"> Report an issue </a>
          </div>
        </div> -->
      </div>
    </div>
  </nav>
</template>
<style scoped>
.link{
    padding: 1rem;
}
.flex-align-center {
  display: flex;
  align-items: center;
}
</style>

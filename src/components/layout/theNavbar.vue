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
      <div class="navbar-start" >
        <router-link to="/" class="link flex-align-center"> Home </router-link>
        <router-link to="/DynamicTextEffect" class="link flex-align-center"> Dynamic 3DText Effect </router-link>
        <router-link to="/multiCamera" class="link flex-align-center"> Multi camera </router-link>
        <router-link to="/glassmorphism" class="link flex-align-center"> Glass effect </router-link>
        <router-link to="/mixHtml" class="link flex-align-center"> Mix HTML + TresJs </router-link>
        
        <div class="navbar-item has-dropdown is-hoverable is-black">
          <a class="navbar-link"> Shader experiments </a>
          <div class="navbar-dropdown">
            <router-link to="/MouseShaderEffect" class="link flex-align-center has-text-black"> Mouse Shader Effect </router-link>
            <router-link to="/darkStar" class="link flex-align-center has-text-black"> Dark Star Shader </router-link>
            <router-link to="/shaderParkIntegration" class="link flex-align-center has-text-black"> Shader park example </router-link>
          </div>
        </div> 
      </div>
      <div class="navbar-end flex-align-center mr-2">
        <a class="button is-light" href="https://twitter.com/jaimebboyjt">
          <i class="fab fa-twitter mr-2"></i>
          <strong>Twitter</strong>
        </a>
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
.router-link, .router-link-active, a {
  color: hsl(0, 0%, 100%);
}
a:hover{
  color: hsl(217, 71%, 53%)
}
</style>

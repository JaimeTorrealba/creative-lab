<script setup>
const NAV_LINKS = ['Work', 'Studio', 'Journal', 'Contact']
const STRIPE_OFFSETS = Array.from({ length: 10 }, (_, index) => 200 + index * 20)
</script>

<template>
  <div class="hero-page">
    <nav class="navbar-bar">
      <div class="page-frame navbar-content">
        <a class="navbar-logo" href="#">MONO</a>
        <ul class="navbar-links">
          <li v-for="link in NAV_LINKS" :key="link">
            <a href="#">{{ link }}</a>
          </li>
        </ul>
        <button class="solid-button" type="button">Get started</button>
      </div>
    </nav>

    <main class="hero-section">
      <div class="page-frame hero-content">
        <div class="hero-copy">
          <h1 class="hero-title">Two sides.<br />One page.</h1>
          <p class="hero-description">
            A plain landing page rendered as real DOM inside a WebGL canvas with the HTML-in-Canvas
            API. Move the mouse to slide the division bar and flip every pixel on the far side.
          </p>
          <div class="hero-actions">
            <button class="solid-button" type="button">Start now</button>
            <button class="outline-button" type="button">Learn more</button>
          </div>
        </div>

        <svg
          class="hero-image"
          viewBox="0 0 400 400"
          role="img"
          aria-label="Black and white geometric composition"
        >
          <rect x="0" y="0" width="400" height="400" fill="#fff" />
          <rect
            v-for="offset in STRIPE_OFFSETS"
            :key="offset"
            :x="offset"
            y="0"
            width="10"
            height="400"
            fill="#000"
          />
          <circle cx="200" cy="200" r="130" fill="#fff" stroke="#000" stroke-width="6" />
          <path d="M200 70 A130 130 0 0 0 200 330 Z" fill="#000" />
          <rect x="32" y="32" width="56" height="56" fill="#000" />
          <rect x="2" y="2" width="396" height="396" fill="none" stroke="#000" stroke-width="4" />
        </svg>
      </div>
    </main>
  </div>
</template>

<style scoped>
.hero-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fff;
  color: #000;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
}

.page-frame {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 48px;
}

.navbar-bar {
  flex: none;
  border-bottom: 2px solid #000;
}

.navbar-content {
  display: flex;
  align-items: center;
  gap: 40px;
  height: 72px;
}

.navbar-logo {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: #000;
  text-decoration: none;
}

.navbar-links {
  display: flex;
  gap: 32px;
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
}

.navbar-links a {
  font-size: 15px;
  font-weight: 600;
  color: #000;
  text-decoration: none;
  border-bottom: 2px solid #fff;
}

.navbar-links a:hover {
  border-bottom-color: #000;
}

.hero-section {
  display: flex;
  flex: 1;
  align-items: center;
  min-height: 0;
}

.hero-content {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  gap: 64px;
}

.hero-title {
  margin: 0;
  font-size: clamp(48px, 7vw, 104px);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.04em;
}

.hero-description {
  max-width: 44ch;
  margin: 28px 0 36px;
  font-size: 18px;
  line-height: 1.55;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.solid-button,
.outline-button {
  padding: 12px 24px;
  border: 2px solid #000;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.solid-button {
  background: #000;
  color: #fff;
}

.solid-button:hover {
  background: #fff;
  color: #000;
}

.outline-button {
  background: #fff;
  color: #000;
}

.outline-button:hover {
  background: #000;
  color: #fff;
}

.hero-image {
  width: 100%;
  max-height: calc(100vh - 72px - 96px);
  aspect-ratio: 1;
}

@media (max-width: 800px) {
  .navbar-links {
    display: none;
  }

  .navbar-content .solid-button {
    margin-left: auto;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hero-image {
    max-height: 32vh;
  }
}
</style>

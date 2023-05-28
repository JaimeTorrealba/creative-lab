import { fileURLToPath, URL } from 'node:url'
import glsl from 'vite-plugin-glsl';

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [ vue({
    template: {
      compilerOptions: {
        isCustomElement: tag => tag.startsWith('Tres') && tag !== 'TresCanvas',
      },
    },
  }), glsl()],  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

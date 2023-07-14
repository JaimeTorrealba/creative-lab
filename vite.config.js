import { fileURLToPath, URL } from 'node:url'
import glsl from 'vite-plugin-glsl';

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { templateCompilerOptions } from '@tresjs/core'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [ vue({
    ...templateCompilerOptions
  }), glsl()],  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

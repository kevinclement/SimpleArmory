import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  // Make sure you have the latest Svelte plugin options
  optimizeDeps: {
    exclude: ['svelte-kit-cookie-session']
  }
});

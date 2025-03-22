// astro.config.mjs
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  // Use the same output directory as current project
  outDir: './dist',
  // Enable Svelte for component support (useful for transitioning)
  integrations: [svelte()],
  // Similar static site setup to the current SvelteKit config
  output: 'static',
  // Base path for deployment
  base: '/',
  // Build configuration
  build: {
    // Preserve existing assets
    assets: '_assets',
  },
  // Support client-side routing similar to SvelteKit's hash-based routing
  prefetch: {
    defaultStrategy: 'hover'
  },
  // Similar to SvelteKit's vite configuration
  vite: {
    ssr: {
      noExternal: ['svelte-select']
    }
  }
});
import adapter from '@sveltejs/adapter-static'; // or your current adapter

/** @type {import('@sveltejs/kit').Config} */
const config = {
  
  kit: {
    adapter: adapter()
  },

  // Add Svelte 5 configuration
  compilerOptions: {
    runes: true,  // Enable the new reactivity system
    legacy: {
      // Configure how much of the old reactivity system to maintain
      componentApi: false  // Keep compatibility with Svelte 3/4 components
    }
  }
};

export default config;
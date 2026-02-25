import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    experimental: {
      remoteFunctions: true
    },
    adapter: adapter({ runtime: 'experimental_bun1.x' })
  },

  extensions: ['.svelte']
};

export default config;

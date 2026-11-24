// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://astro-wp-headless.netlify.app',
  integrations: [react()],
  build: { inlineStylesheets: 'auto' },
});

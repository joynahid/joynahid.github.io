// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';


// https://astro.build/config
export default defineConfig({
  site: 'https://joynahid.github.io',
  integrations: [mdx(), sitemap(), react()],
  i18n: {
    locales: ["en", "bn"],
    defaultLocale: "en",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      // wrap: true,
    },
  }
});

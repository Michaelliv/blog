// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://michaellivs.com',
	integrations: [
		mdx(),
		sitemap({
			serialize(item) {
				// Add lastmod for blog posts based on URL pattern
				if (item.url.includes('/blog/')) {
					item.lastmod = new Date().toISOString();
				}
				return item;
			},
		}),
	],
});

import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { marked } from 'marked';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

function stripMdx(content) {
	return content
		.replace(/^import\s+.*$/gm, '') // Remove import statements
		.replace(/<[A-Z][a-zA-Z]*\s*[^>]*\/>/g, '') // Remove self-closing components <Component />
		.replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g, '') // Remove component blocks <Component>...</Component>
		.replace(/\n{3,}/g, '\n\n') // Clean up excess newlines
		.trim();
}

export async function GET(context) {
	const posts = (await getCollection('blog')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			link: `/blog/${post.id}/`,
			author: 'Michael Livshits',
			categories: post.data.tags || [],
			content: marked.parse(stripMdx(post.body || '')),
		})),
	});
}

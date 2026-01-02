import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';

const fontData = await fetch(
	'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff'
).then((res) => res.arrayBuffer());

const fontDataBold = await fetch(
	'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff'
).then((res) => res.arrayBuffer());

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getCollection('blog');
	return posts.map((post) => ({
		params: { slug: post.id },
		props: { title: post.data.title, description: post.data.description },
	}));
};

export const GET: APIRoute = async ({ props }) => {
	const { title, description } = props as { title: string; description: string };

	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					padding: '60px',
					backgroundColor: '#0a0a0a',
					color: '#e5e5e5',
					fontFamily: 'Inter',
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								fontSize: '24px',
								color: '#737373',
								marginBottom: '20px',
							},
							children: '/dev/michael',
						},
					},
					{
						type: 'div',
						props: {
							style: {
								fontSize: '56px',
								fontWeight: 700,
								lineHeight: 1.2,
								marginBottom: '24px',
							},
							children: title,
						},
					},
					{
						type: 'div',
						props: {
							style: {
								fontSize: '24px',
								color: '#a3a3a3',
								lineHeight: 1.4,
							},
							children: description,
						},
					},
				],
			},
		},
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Inter',
					data: fontData,
					weight: 400,
					style: 'normal',
				},
				{
					name: 'Inter',
					data: fontDataBold,
					weight: 700,
					style: 'normal',
				},
			],
		}
	);

	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};

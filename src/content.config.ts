import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';


const commonSchema = z.object({
	title: z.string(),
	description: z.string(),
	pubDate: z.coerce.date(),
	updatedDate: z.coerce.date().optional(),
	heroImage: z.string().optional(),
	tags: z.array(z.string()).optional(),
});

const posts = defineCollection({
	loader: glob({ base: './src/content/', pattern: '**/*.{md,mdx}' }),
	schema: commonSchema.extend({
		draft: z.boolean().optional(),
	}),
});

export const collections = { posts };

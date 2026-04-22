import { defineCollection, z } from 'astro:content';

const emptyToUndef = (v: unknown) => (v === '' ? undefined : v);

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    outlet: z.enum(['UNB', 'The Daily Star', 'Substack', 'Other']),
    type: z.enum(['Analysis', 'Satire', 'Fiction', 'Poetry', 'Reportage', 'Essay']),
    date: z.coerce.date(),
    excerpt: z.string().max(280),
    sourceUrl: z.string().url(),
    featured: z.boolean().default(false),
  }),
});

const portfolio = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    projectType: z.enum(['Product', 'Publication', 'Strategy']),
    year: z.number(),
    heroImage: z.preprocess(emptyToUndef, z.string().optional()),
    problem: z.string(),
    whatIDid: z.string(),
    outcome: z.preprocess(emptyToUndef, z.string().optional()),
    liveUrl: z.preprocess(emptyToUndef, z.string().url().optional()),
    clientText: z.preprocess(emptyToUndef, z.string().optional()),
    order: z.number().default(999),
    visible: z.boolean().default(true),
  }),
});

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().max(280),
    draft: z.boolean().default(false),
  }),
});

export const collections = { publications, portfolio, posts };

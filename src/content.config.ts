import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number(),
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
  }),
});

const sheets = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/sheets" }),
  schema: z.object({ title: z.string(), summary: z.string() }),
});

export const collections = { notes, sheets };

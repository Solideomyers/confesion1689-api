import { z } from 'zod';

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  includeProofTexts: z.boolean().default(false),
});

export const SearchResultSchema = z.object({
  paragraphs: z.array(
    z.object({
      id: z.string().cuid(),
      orderInChapter: z.number().int().positive(),
      paragraphLabel: z.string().optional(),
      text: z.string(),
      chapter: z.object({
        id: z.string().cuid(),
        title: z.string(),
        chapterNumberArabic: z.number().int().positive().optional(),
      }),
    }),
  ),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;

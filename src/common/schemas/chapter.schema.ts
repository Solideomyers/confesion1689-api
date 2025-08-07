import { z } from 'zod';

export const ChapterSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1),
  chapterNumberArabic: z.number().int().positive().optional(),
  orderInConfession: z.number().int().positive(),
  isINtroduction: z.boolean().default(false),
  isAppendix: z.boolean().default(false),
  confessionId: z.string().cuid(),
  chapterGroupId: z.string().cuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateChapterSchema = ChapterSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateChapterSchema = CreateChapterSchema.partial();

export const ChapterWithParagraphsSchema = ChapterSchema.extend({
  paragraphs: z.array(
    z.object({
      id: z.string().cuid(),
      orderInChapter: z.number().int().positive(),
      paragraphLabel: z.string().optional(),
      text: z.string(),
      proofTextAnchors: z.array(
        z.object({
          id: z.string().cuid(),
          anchorMarker: z.string(),
          relevantTextSnippet: z.string().optional(),
          orderInParagraph: z.number().int().positive(),
          proofTextReferences: z.array(
            z.object({
              id: z.string().cuid(),
              orderForAnchor: z.number().int().positive(),
              contextualNotes: z.string().optional(),
              scriptureReference: z.object({
                id: z.string().cuid(),
                book: z.string(),
                chapterNumber: z.number().int().positive(),
                startVerse: z.number().int().positive(),
                endVerse: z.number().int().positive().optional(),
                fullReferenceString: z.string(),
              }),
            }),
          ),
        }),
      ),
    }),
  ),
});

export type Chapter = z.infer<typeof ChapterSchema>;
export type CreateChapterDto = z.infer<typeof CreateChapterSchema>;
export type UpdateChapterDto = z.infer<typeof UpdateChapterSchema>;
export type ChapterWithParagraphs = z.infer<typeof ChapterWithParagraphsSchema>;

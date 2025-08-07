import { z } from 'zod';

export const ParagraphSchema = z.object({
  id: z.string().cuid(),
  orderInChapter: z.number().int().positive(),
  paragraphLabel: z.string().optional(),
  text: z.string().min(1),
  chapterId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateParagraphSchema = ParagraphSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateParagraphSchema = CreateParagraphSchema.partial();

export const ParagraphWithProofTextsSchema = ParagraphSchema.extend({
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
});

export type Paragraph = z.infer<typeof ParagraphSchema>;
export type CreateParagraphDto = z.infer<typeof CreateParagraphSchema>;
export type UpdateParagraphDto = z.infer<typeof UpdateParagraphSchema>;
export type ParagraphWithProofTexts = z.infer<
  typeof ParagraphWithProofTextsSchema
>;

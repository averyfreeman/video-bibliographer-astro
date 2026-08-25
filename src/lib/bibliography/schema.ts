import { z } from 'zod';

/** Runtime schema for a single bibliography reference. */
export const bibliographyReferenceSchema = z.object({
  id: z.string().min(1),
  timestampSeconds: z.number().nonnegative(),
  timestamp: z.string().regex(/^\d+:\d{2}$/),
  quote: z.string().min(1),
  subject: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceUrl: z.string().url(),
  context: z.string().min(1),
  significance: z.string().min(1),
  thumbnailKind: z.enum(['archival', 'source', 'generated', 'reconstruction']).optional(),
  thumbnailAlt: z.string().optional(),
  disclaimer: z.string().optional(),
});

/** Runtime schema for persisted bibliography output. */
export const bibliographySchema = z.object({
  videoUrl: z.string().url(),
  videoTitle: z.string().min(1),
  references: z.array(bibliographyReferenceSchema),
  processingNotes: z.array(z.string()),
});

/** Validated TypeScript shape for one citation. */
export type BibliographyReferenceInput = z.infer<typeof bibliographyReferenceSchema>;
/** Validated TypeScript shape for a complete work product. */
export type BibliographyInput = z.infer<typeof bibliographySchema>;

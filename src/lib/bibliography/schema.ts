import { z } from 'zod';

const httpUrlSchema = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === 'http:' || protocol === 'https:';
}, 'URL must use http or https');

const timestampSchema = z.string().regex(/^(?:\d+:)?[0-5]?\d:[0-5]\d$/);

/** Runtime schema for citation thumbnail provenance and alt metadata. */
export const bibliographyThumbnailSchema = z.object({
  kind: z.enum(['archival', 'source', 'generated', 'reconstruction']),
  url: httpUrlSchema.optional(),
  alt: z.string().trim().min(1),
  provenance: z.string().trim().min(1),
}).strict();

/** Runtime schema for a single bibliography reference. */
export const bibliographyReferenceSchema = z.object({
  id: z.string().min(1),
  timestampSeconds: z.number().finite().int().nonnegative(),
  timestamp: timestampSchema,
  quote: z.string().min(1),
  subject: z.string().min(1),
  timelineLabel: z.string().trim().min(1).max(96).optional(),
  confidence: z.number().finite().min(0).max(1),
  sourceUrl: httpUrlSchema,
  sourceVerification: z.enum(['unverified', 'reachable', 'verified']).optional(),
  context: z.string().min(1),
  significance: z.string().min(1).refine((value) => value.trim().split(/\n\s*\n/).filter(Boolean).length <= 2, 'Synopsis must be at most two paragraphs'),
  thumbnail: bibliographyThumbnailSchema.optional(),
  thumbnailKind: z.enum(['archival', 'source', 'generated', 'reconstruction']).optional(),
  thumbnailAlt: z.string().min(1).optional(),
  disclaimer: z.string().optional(),
}).strict();

/** Runtime schema for transcript, provider, model, and validation metadata. */
export const bibliographyProcessingMetadataSchema = z.object({
  generatedAt: z.string().datetime(),
  transcriptSource: z.string().trim().min(1),
  analysisProvider: z.string().trim().min(1),
  model: z.string().trim().min(1).optional(),
  notes: z.array(z.string().trim().min(1)),
}).strict();

/** Runtime schema for persisted bibliography output. */
export const bibliographySchema = z.object({
  videoUrl: httpUrlSchema,
  videoTitle: z.string().min(1),
  references: z.array(bibliographyReferenceSchema),
  processing: bibliographyProcessingMetadataSchema.optional(),
  processingNotes: z.array(z.string()).default([]),
}).strict();

/** Validated TypeScript shape for thumbnail metadata. */
export type BibliographyThumbnailInput = z.infer<typeof bibliographyThumbnailSchema>;
/** Validated TypeScript shape for one citation. */
export type BibliographyReferenceInput = z.infer<typeof bibliographyReferenceSchema>;
/** Validated TypeScript shape for processing metadata. */
export type BibliographyProcessingMetadataInput = z.infer<typeof bibliographyProcessingMetadataSchema>;
/** Validated TypeScript shape for a complete work product. */
export type BibliographyInput = z.infer<typeof bibliographySchema>;

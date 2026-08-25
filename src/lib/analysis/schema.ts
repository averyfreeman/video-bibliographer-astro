import { z } from 'zod';
import { bibliographyReferenceSchema } from '../bibliography/schema';

/** Strict schema for one model-produced bibliography candidate. */
export const analysisCandidateSchema = bibliographyReferenceSchema;

/** Strict schema for one model-produced chunk response. */
export const analysisChunkResultSchema = z.object({
  candidates: z.array(analysisCandidateSchema),
  notes: z.array(z.string()),
}).strict();

/** Inferred model output for one bounded transcript chunk. */
export type AnalysisChunkResultInput = z.infer<typeof analysisChunkResultSchema>;

import type { Bibliography } from './bibliography/types';
import { bibliographySchema } from './bibliography/schema';
import { validateBibliography } from './bibliography/analysis';

/** Calls Gemini's REST API for structured bibliography extraction. */
export async function analyzeWithGemini(videoUrl: string, videoTitle: string, transcript: string): Promise<Bibliography> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured on the server.');
  const model = process.env.AI_MODEL || 'gemini-3.1-flash-lite';
  const prompt = `You are a meticulous historical bibliographer. Analyze this transcript and identify every plausible historical quote, person, event, work, or idea. Do not invent sources. Return JSON only matching the requested schema. Mark uncertain candidates with a disclaimer.\nVIDEO URL: ${videoUrl}\nVIDEO TITLE: ${videoTitle}\nTRANSCRIPT:\n${transcript}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            videoUrl: { type: 'STRING' }, videoTitle: { type: 'STRING' },
            references: { type: 'ARRAY', items: { type: 'OBJECT', properties: {
              id: { type: 'STRING' }, timestampSeconds: { type: 'NUMBER' }, timestamp: { type: 'STRING' }, quote: { type: 'STRING' }, subject: { type: 'STRING' }, confidence: { type: 'NUMBER' }, sourceUrl: { type: 'STRING' }, context: { type: 'STRING' }, significance: { type: 'STRING' }, disclaimer: { type: 'STRING' }, thumbnailKind: { type: 'STRING' }, thumbnailAlt: { type: 'STRING' }
            }, required: ['id','timestampSeconds','timestamp','quote','subject','confidence','sourceUrl','context','significance'] } },
            processingNotes: { type: 'ARRAY', items: { type: 'STRING' } }
          }, required: ['videoUrl','videoTitle','references','processingNotes']
        }
      }
    })
  });
  if (!response.ok) throw new Error(`Gemini request failed with HTTP ${response.status}.`);
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no structured content.');
  const parsed = bibliographySchema.parse(JSON.parse(text));
  return validateBibliography(parsed);
}

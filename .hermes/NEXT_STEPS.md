# Next Steps

## Transcript acquisition

The first release accepts a YouTube URL only. Add one of these later:

- A maintained YouTube transcript API/provider with explicit licensing, rate-limit, language, and private/video availability behavior.
- An optional transcript copy/paste `<textarea>` for users who already have a transcript.
- An audio-capable fallback only after rights, cost, privacy, and processing behavior are defined.

## Dynamic analysis boundary

The static Astro/nginx site must never contain Gemini, OpenAI, or OpenRouter keys. The current `/api/analyze` server endpoint and CLI retrieve transcripts, call the configured OpenAI-compatible gateway, validate candidates, and persist Markdown server-side. Source verification and thumbnail generation remain explicit follow-up stages; URLs are not treated as proof of historical authenticity.

## GitHub workflow

1. Protect the repository with `.gitignore` and secret scanning.
2. Add changes to git tree using canonical versioning tags after every few code updates, whether major or minor.
3. Commit changes to the public `youtube-video-bibliographer` GitHub repository.
4. Update remote repo codebase updated (`git push`) after 3 turns max.

## Thumbnail provenance

Create a 320x240 illustrative thumbnail of the scene described by each bibliographical ciation. Must be an easily recognizeable scene of historical relevance to the quote. Image quality of little importance.

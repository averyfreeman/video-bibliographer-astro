# Next Steps

## Transcript acquisition

The first release accepts a YouTube URL only. Add one of these later:

- A maintained YouTube transcript API/provider with explicit licensing, rate-limit, language, and private/video availability behavior.
- An optional transcript copy/paste `<textarea>` for users who already have a transcript.
- An audio-capable fallback only after rights, cost, privacy, and processing behavior are defined.

## Dynamic analysis boundary

The static Astro/nginx site must never contain Gemini, OpenAI, or OpenRouter keys. Future analysis should run in a server-side Astro endpoint, a separate worker, or a CLI agent. It should retrieve the transcript, call the AI gateway, verify sources, generate thumbnails, and persist the Markdown work product server-side.

## Future Jules/GitHub/Render workflow

1. Protect the repository with `.gitignore` and secret scanning.
2. Create the public `youtube-video-bibliographer` GitHub repository.
3. Enable Jules repository access through its MCP integration.
4. Ask Jules to run unit, Playwright, smoke, and production-build checks.
5. Have Jules deploy to Render through its own MCP connection.

## Thumbnail provenance

Choose case by case between archival/source images and generated illustrations. Clearly label reconstructions or fantasy scenes; preserve source or generation metadata with each citation.

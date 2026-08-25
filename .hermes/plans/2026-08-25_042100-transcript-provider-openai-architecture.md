# Transcript Provider and OpenAI Processing Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Replace the current fragile `yt-dlp`-only transcript path with a typed, provider-injectable YouTube transcript adapter and make OpenAI the primary server-side processor for historical-reference extraction.

**Architecture:** Keep transcript acquisition and AI analysis as separate server/CLI boundaries. Use a purpose-built TypeScript transcript library behind the project’s own `TranscriptProvider` interface so the application can enforce URL validation, timeouts, error classification, and normalized cues without coupling the domain model to a package. Use the Vercel AI SDK (`ai`) with `@ai-sdk/openai` for OpenAI structured generation, with `OPENAI_API_KEY` loaded only at runtime. Do not use an MCP server in the production application path: MCP is an assistant/tool orchestration protocol, not a stable request boundary for an Astro service. Keep an MCP transcript server as an optional development/operator adapter only if a later need justifies it.

**Tech Stack:** Astro 7, Starlight, TypeScript strict mode, pnpm, Zod 4, Vitest, TypeDoc, `@hallelx/youtube-transcript` or `youtube-transcript-nodejs`, Vercel AI SDK `ai`, `@ai-sdk/openai`, OpenAI structured output, server-only CLI/API boundary.

---

## Decision record from npm evaluation

`npm-axi` was not installed, so the read-only npm registry search was used. Candidate results included:

- `@hallelx/youtube-transcript` 0.2.0, MIT, TypeScript declarations, no runtime dependencies, supports manual/auto captions, translation, and YouTube Innertube rather than webpage scraping. It warns that datacenter/serverless deployments may be blocked.
- `youtube-transcript-nodejs` 0.1.0, TypeScript declarations, MIT, a port of the established Python library with optional PoToken support, proxy configuration, and a documented live test. It is newer but has a smaller release footprint and no repository metadata in npm.
- `youtube-captions-api` 1.0.1, TypeScript declarations, MIT, Innertube-based, but its README explicitly recommends residential proxies for cloud environments.
- `youtube-transcript` 1.3.1, MIT and simple, but its small API is less explicit about modern blocking behavior and transcript-provider controls.
- `youtube-transcript-plus` 2.0.1, MIT and injectable fetches/cache, but it directly performs page/player/transcript requests and relies on unofficial APIs.
- `@emit-ia/youtube-transcript-mcp` 1.6.1 and `@nadimtuhin/ytranscript` 1.3.0 provide MCP servers, but MCP adds a subprocess/tool protocol boundary, process lifecycle, and provider availability concerns that are unnecessary for a web request.

**Recommendation:** Start with `@hallelx/youtube-transcript` as the first injected provider because it has MIT licensing, declarations, no dependencies, and a clear non-webpage Innertube path. Validate its actual API and live behavior before adoption. Keep the existing `yt-dlp` implementation as a fallback provider only if tests show it improves coverage. If `@hallelx/youtube-transcript` fails against the controlled public fixture or cannot expose required timeout/error behavior, evaluate `youtube-transcript-nodejs` next. Do not claim either provider is reliable against datacenter blocking without live evidence.

**REST vs MCP:** Use direct library/provider calls or a dedicated REST transcript service for the production boundary. REST is easier to type, monitor, time out, test, and deploy. MCP is appropriate for Codex/Hermes/operator workflows where a model needs tools, not for the Astro application’s deterministic backend. Avoid direct webpage scraping; Innertube-based packages are still unofficial and should be documented as such.

## Objective ledger revision

Before implementation, revise Objective 5 in `OBJECTIVES.md` from Gemini-primary wording to:

- OpenAI is the primary bibliography analysis provider.
- `ai` plus `@ai-sdk/openai` are the application packages.
- Default configured model is an OpenAI model selected from runtime configuration, with a documented current default such as `gpt-4o-mini` unless the user specifies another application model.
- `OPENAI_API_KEY` is server/runtime-only and never hard-coded.
- Gemini is optional and must not be implied to be implemented unless an adapter exists.
- Acceptance includes structured output validation, source-verification state, uncertainty, processing metadata, and provider/model notes.

Record the ledger revision as a separate documentation change before implementation; do not mark the objective complete until independent live or controlled evidence exists.

## Task 1: Add provider dependencies and runtime configuration

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `.env.example`, `README.md`
- Test: `tests/analysis/configuration.test.ts`

1. Add `ai` and `@ai-sdk/openai` using `pnpm add`.
2. Add typed runtime configuration parsing for `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL` (optional), and output settings without logging values.
3. Use a real OpenAI model default only after checking current SDK/provider support; permit runtime override.
4. Test that missing keys produce a classified configuration error and that key values never enter diagnostics.
5. Do not hard-code, read from credential files, or print any API key.

## Task 2: Introduce typed transcript provider contract

**Files:**
- Create: `src/lib/youtube/provider.ts`, `src/lib/youtube/errors.ts`, `src/lib/youtube/types.ts`
- Modify: `src/lib/youtube.ts`
- Test: `tests/youtube/provider.test.ts`, `tests/youtube-url-form.test.ts`

1. Define explicit transcript cue, video metadata, provider result, and discriminated error types.
2. Keep URL normalization restricted to supported YouTube hostnames and 11-character IDs.
3. Define an injectable provider interface with abort signal/timeout support.
4. Normalize package-specific transcript records into the existing `TranscriptCue` shape.
5. Classify invalid URL, unsupported video, no captions, rate limit, timeout, provider, and empty transcript cases.
6. Ensure no arbitrary URL is passed to a transcript package.

## Task 3: Evaluate and integrate a purpose-built package

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `src/lib/youtube.ts`
- Create: `src/lib/youtube/hallelx-provider.ts`
- Test: `tests/youtube/hallelx-provider.test.ts`
- Docs: `src/content/docs/reference/configuration.md`, `.hermes/NEXT_STEPS.md`

1. Add `@hallelx/youtube-transcript` with pnpm and inspect its declaration/API surface.
2. Write fake-provider tests before wiring the package.
3. Implement a typed adapter using only the validated video ID, not an arbitrary user URL.
4. Bound all provider calls with `AbortController` and an application timeout.
5. Preserve manual/auto language provenance and transcript timestamps.
6. Run a controlled public-video smoke test; record actual provider result or blocker.
7. Retain `yt-dlp` only as a separately named fallback if it is still useful and tested.

## Task 4: Define OpenAI structured bibliography analysis

**Files:**
- Create: `src/lib/analysis/types.ts`, `src/lib/analysis/errors.ts`, `src/lib/analysis/openai.ts`, `src/lib/analysis/prompts.ts`
- Modify: `src/lib/gemini.ts`, `src/lib/bibliography/schema.ts`, `src/lib/bibliography/types.ts`
- Test: `tests/analysis/openai.test.ts`, `tests/analysis/provider.test.ts`

1. Define a provider-neutral structured analysis interface receiving normalized transcript cues and video metadata.
2. Use `createOpenAI` from `@ai-sdk/openai` and `generateObject` from `ai` with a Zod bibliography schema.
3. Use `OPENAI_API_KEY` only in server/CLI code; never include it in client imports, static output, test fixtures, or logs.
4. Use `OPENAI_MODEL` with a documented default and preserve provider/model in processing metadata.
5. Prompt for exhaustive plausible references, timestamps, quote/reference text, subjects, confidence, source URL, context, two-paragraph maximum significance, uncertainty, and thumbnail metadata. Require uncertainty instead of fabricated sources.
6. Validate returned objects with the existing strict schema and deterministic chronology rules.
7. Add fake model/provider tests for success, malformed output, schema violations, missing key, HTTP errors, unsupported model, and low-confidence disclaimers.
8. Keep Gemini only as an explicit optional adapter if it remains useful; do not let it silently become the primary path.

## Task 5: Wire transcript-to-OpenAI workflow

**Files:**
- Modify: `scripts/analyze-youtube.ts`, `src/lib/analysis/openai.ts`, `src/lib/youtube.ts`
- Test: `tests/workflow/analyze-youtube.test.ts`

1. Retrieve a normalized transcript through the selected provider.
2. Convert cues to a bounded, timestamp-preserving prompt input.
3. Call OpenAI through the typed analysis service.
4. Validate and render the result with the existing Markdown renderer.
5. Pass the exact rendered output to persistence without regeneration.
6. Return honest provider errors and never fabricate transcript or bibliography content.
7. Keep the web UI static unless a server endpoint is intentionally introduced; document that CLI/server execution is the current dynamic boundary.

## Task 6: Type all Astro boundaries and document TypeDoc

**Files:**
- Inspect/modify: `astro.config.mjs` or migrate to `astro.config.ts`, `tsconfig.json`, `src/routeData.ts`, `src/pages/og/[...slug].ts`
- Modify: `typedoc.json`, `src/content/docs/reference/configuration.md`, `src/content/docs/guides/methodology.md`
- Tests: `tests/types/astro-boundaries.test.ts`

1. Give route middleware, OG route data, config helpers, and public domain functions explicit types.
2. Add TSDoc `@param`, `@returns`, `@throws`, `@example`, and `@packageDocumentation` where relevant.
3. Keep TypeDoc entry points bounded to intended public modules and exclude generated output.
4. Document browser-safe versus server-only imports and OpenAI key handling.
5. Verify generated TypeDoc contains the intended public API and no secrets.

## Task 7: Independent verification

Run:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm typecheck
pnpm typedoc
pnpm build
```

Then run a controlled fixture test through the fake transcript provider and fake OpenAI model. If a runtime key is already configured in the approved server environment, run a user-authorized live smoke test without printing or persisting the key. Inspect the actual validated bibliography and processing metadata. Verify static output contains no API-key values or server-only imports. Keep Objective 4/5/6 incomplete until evidence is real.

## Commits and tags

The user requested no commits during the earlier SDK test. Preserve that rule for the implementation test unless the user explicitly authorizes a commit. If later authorized, commit at meaningful verified boundaries and use the next canonical tag only after Hermes independently verifies the objective.

## Risks and tradeoffs

- Purpose-built transcript packages are more direct than an MCP server, but they use undocumented YouTube/Innertube behavior and may be blocked from datacenter IPs.
- `yt-dlp` is operationally mature but adds a subprocess dependency and more complicated bounded execution/error handling.
- MCP is useful for model/operator tooling but is an unnecessary production dependency for an Astro request path.
- The Vercel AI SDK is a good OpenAI integration boundary, but `generateObject` support depends on model/provider capabilities; tests must use an injected fake and live evidence must be explicit.
- Never hard-code an API key, even for a temporary test. The test should use runtime environment configuration or a fake provider.
- OpenAI’s application model and Codex’s orchestration model are separate settings. The application may use a configured OpenAI model while Codex remains on the user’s required `gpt-5.6-luna`.

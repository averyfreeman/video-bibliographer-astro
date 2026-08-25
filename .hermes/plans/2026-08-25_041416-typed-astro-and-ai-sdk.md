# Typed Astro and AI SDK Integration Plan

> **For Hermes:** Use the objective-driven Codex orchestration workflow to implement this plan task-by-task.

**Goal:** Make the Astro/Starlight project explicitly typed end-to-end, document the public API with TypeDoc/TSDoc, and establish a provider-neutral AI boundary that is compatible with OpenAI-style providers without exposing credentials.

**Architecture:** Keep Astro/Starlight as the static presentation layer. Keep transcript retrieval, AI analysis, source verification, and filesystem persistence in server-only TypeScript modules or the CLI workflow. Use a small provider-neutral interface with a Gemini REST adapter first; add OpenAI-compatible transport only behind that interface when needed. Avoid introducing an SDK solely for branding: the current implementation uses direct `fetch` against Gemini REST and has no OpenAI SDK dependency.

**Tech Stack:** Astro 7, Starlight, TypeScript strict mode, Zod 4, Vitest, TypeDoc, pnpm, Gemini REST API, optional OpenAI-compatible HTTP adapter.

---

## Current facts and decisions

- The project currently has no AI SDK dependency such as the OpenAI SDK, Vercel AI SDK, or Google GenAI SDK.
- `src/lib/gemini.ts` directly calls Gemini’s REST endpoint with `fetch`, using `GEMINI_API_KEY` server-side only and `AI_MODEL` for model selection.
- The current `.env.example` documents `GEMINI_API_KEY`, `OPENAI_API_KEY`, and `OPENROUTER_API_KEY`, but only Gemini is implemented.
- OpenAI-compatible providers can be supported at the protocol level, but the current Gemini adapter is not itself OpenAI-compatible because it uses Gemini’s native endpoint and request schema.
- No API keys were read or printed. Earlier work recorded a redacted tracked-file secret scan with no high-confidence findings. No OpenAI key was tested in the implementation work; Gemini was the configured/attempted provider path.
- Astro diagnostics currently pass with zero errors after excluding generated `docs/api`; TypeDoc generates successfully but emits non-blocking installed-dependency/API hints.
- The repository uses `0.3.0` as its latest verified tag. Commit/tag only after independent verification.

## Task 1: Audit and explicitly type the Astro boundary

**Files:**
- Modify: `astro.config.mjs`, `tsconfig.json`, `package.json`
- Inspect: `src/routeData.ts`, `src/pages/og/[...slug].ts`, all `.astro`/`.mdx` pages
- Test: add `tests/types/astro-config.test.ts` only if a deterministic contract test is useful

1. Confirm the installed Astro version and generated Astro types using pnpm commands.
2. Keep `astro.config.mjs` in JavaScript only if Astro’s `defineConfig` provides adequate inference; otherwise migrate to `astro.config.ts` with explicit `AstroUserConfig` typing after checking compatibility.
3. Add explicit types to route middleware parameters and OG route page data where inference is currently implicit.
4. Ensure `tsconfig.json` includes source TypeScript and Astro generated types but excludes generated `docs/api`, `dist`, and transient outputs.
5. Add explicit return types and public TSDoc to exported route helpers and domain functions.
6. Run `pnpm check` and `pnpm typecheck` independently.

## Task 2: Make the bibliography domain fully explicit

**Files:**
- Modify: `src/lib/bibliography/types.ts`, `schema.ts`, `analysis.ts`, `markdown.ts`
- Test: `tests/bibliography.test.ts`, `tests/bibliography-timestamp.test.ts`

1. Replace implicit callback/temporary object types with named exported types where they cross module boundaries.
2. Give schema constants explicit exported types where practical without fighting Zod inference.
3. Add TSDoc `@param`, `@returns`, `@throws`, and examples to every exported function, interface, type, and schema.
4. Ensure normalized validation output distinguishes input data from post-validation Markdown data.
5. Preserve strict URL, timestamp, confidence, synopsis, timeline-label, thumbnail, and processing metadata constraints.
6. Add tests for malformed runtime values, timestamp edge cases including hour-form timestamps, tie ordering, and exact rendered metadata.

## Task 3: Define a provider-neutral AI contract

**Files:**
- Create: `src/lib/analysis/types.ts`, `src/lib/analysis/provider.ts`, `src/lib/analysis/errors.ts`
- Modify: `src/lib/gemini.ts`
- Test: `tests/analysis/provider.test.ts`, `tests/analysis/gemini.test.ts`

1. Define an explicit `StructuredAnalysisProvider` interface accepting a typed request and returning unknown structured data plus provider/model metadata.
2. Define typed error classes or discriminated error results for missing credentials, unsupported model, HTTP failure, malformed response, schema failure, and unavailable provider.
3. Keep secrets out of the provider request object and all client/static modules.
4. Make the Gemini adapter implement the provider interface, with explicit request/response payload types and an injectable `fetch` seam.
5. Use a configured model with a documented default only after verifying the model name against the provider contract; preserve the model in processing metadata.
6. Keep the adapter’s final output validated by the strict bibliography schema and chronology validator.

## Task 4: Add optional OpenAI-compatible transport without conflating providers

**Files:**
- Create: `src/lib/analysis/openai-compatible.ts`
- Modify: `src/lib/analysis/provider.ts`, `.env.example`, `src/content/docs/reference/configuration.md`, `README.md`
- Test: `tests/analysis/openai-compatible.test.ts`

1. Implement a provider-neutral adapter for OpenAI Chat Completions-compatible endpoints using explicit `baseUrl`, model, and server-only API key configuration.
2. Support OpenAI and OpenRouter only through the same interface; do not claim Gemini is OpenAI-compatible.
3. Use schema-constrained JSON instructions and validate returned text with Zod; reject malformed or non-object responses.
4. Permit an injected fetch implementation and deterministic fake responses in tests.
5. Never put keys in `PUBLIC_*`, Astro client code, static output, committed Compose files, test fixtures, or logs.
6. Document the compatibility boundary: “OpenAI-compatible transport” means request/response protocol compatibility, not identical model behavior or guaranteed structured-output support.
7. Do not run live OpenAI/OpenRouter calls unless a key is explicitly configured in the server runtime and the user authorizes that provider smoke test. Never inspect the key value.

## Task 5: Improve TypeDoc for Astro-facing documentation

**Files:**
- Modify: `typedoc.json`, `src/content/docs/reference/configuration.md`, `src/content/docs/guides/methodology.md`
- Create if useful: `docs/api-overview.md`

1. Keep TypeDoc entry points limited to intended public modules.
2. Add `@packageDocumentation` blocks where public module context is otherwise missing.
3. Add examples to public APIs showing safe server-side usage without credentials.
4. Document which code is safe for Astro client imports and which is server/CLI-only.
5. Include the AI provider compatibility explanation and credential boundary in Starlight reference docs.
6. Run `pnpm typedoc` and verify generated pages contain the intended declarations without generated-output recursion.

## Task 6: Verification and milestone

Run:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm typecheck
pnpm typedoc
pnpm build
```

Perform static checks that no secret-like values or provider credentials appear in `dist/` or browser-facing source. Use only redacted diagnostics. Start the dev server and verify `/` and `/bibliographies/sample/` return HTTP 200. Record all evidence in `OBJECTIVES.md`. Only after the orchestrator verifies the complete objective should the relevant commit and canonical patch/feature tag be created.

## Risks and tradeoffs

- Adding a large AI SDK is unnecessary for the current Gemini REST path and increases dependency/type surface. A narrow typed adapter is the practical default.
- Gemini native REST and OpenAI-compatible APIs are different protocols. An adapter can normalize them, but it cannot make model behavior equivalent.
- Generated TypeDoc output should remain excluded from Astro diagnostics; otherwise generated JavaScript can create unrelated warnings.
- Zod 4 currently emits deprecation hints for some legacy method names in this dependency version; resolve deliberately rather than weakening diagnostics globally.
- Live provider smoke tests are optional and credential-gated. A missing key is a documented limitation, not a reason to fabricate output.

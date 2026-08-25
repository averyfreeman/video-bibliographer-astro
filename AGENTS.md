# Agent Handoff — Video Bibliographer

Read these first, in order:

1. `PROJECT_OUTLINE.xml` — product scope and mandatory output-retention format.
2. `OBJECTIVES.md` — canonical objective/status/evidence ledger.
3. `.hermes/plans/2026-08-25_025032-video-bibliographer-objectives-orchestration.md` — objective-by-objective implementation plan.

## Current state

- The worktree is intentionally dirty and contains substantial pre-existing user work. Do not reset, clean, discard, mass-format, or overwrite unrelated changes.
- Objectives 1–6 are `IN_PROGRESS`; Objectives 7–11 are `NOT_STARTED`. Do not infer completion merely because code exists.
- Existing code includes the Starlight shell, bibliography schemas/Markdown renderer, `yt-dlp` transcript retrieval, Gemini analysis, CLI persistence, Vitest tests, and TypeDoc configuration.
- Installed locally with pnpm: `astro-d2`, `astro-og-canvas`, and `canvaskit-wasm`. D2 generation uses the pnpm-managed `@terrastruct/d2` WebAssembly runtime via `experimental.useD2js`; no global D2 binary is required.
- `astro.config.mjs` enables D2 and Starlight OG-image middleware. `src/pages/og/[...slug].ts` and `src/routeData.ts` provide generated OG images and metadata.
- A sample D2 timeline was added under `src/content/docs/bibliographies/sample.md`; note that the broad `bibliographies/` ignore rule currently also ignores that source path and generated `public/d2/...` assets. Review/fix this deliberately rather than force-adding files blindly.
- Last verified checks after plugin setup: `pnpm check` passed with no errors, `pnpm test` passed (3 files/4 tests), and `pnpm build` passed. Preview smoke checks returned HTTP 200 for the sample page, generated OG PNG, and D2 SVG.
- No commit or semantic-version tag was created.
- The prior session did not expose a callable Codex ACP connector even though `/Users/avery/.nix-profile/bin/codex-acp` exists. Re-check tools in the new session before deciding it is still unavailable.
- The prior session also did not expose the newly added `dhis2-mcp-server`. Re-check the fresh session’s tool registry; native MCP additions are discovered at startup.

## What to do next

1. Re-check the fresh session for Codex ACP and DHIS2 MCP tools. Do not treat the `codex-acp` executable alone as a usable connector without an ACP client.
2. Inspect the complete dirty diff and preserve user changes.
3. Start with Objective 1: verify repository protections, add/review `.dockerignore`, correct over-broad ignore rules, run a redacted secret scan, and prove `pnpm install --frozen-lockfile` succeeds.
4. Independently run `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm typedoc`, and `pnpm build`.
5. Continue one objective at a time. For Objective 2, add real browser/Playwright verification for the home form, copied YouTube URLs with query parameters, keyboard behavior, dark mode, deep links, and the actual `0.0.0.0:4321` bind.
6. Update `OBJECTIVES.md` only after reproducible independent evidence exists. Commit and tag only verified milestones, starting at `0.1.0`.

## Operating rules

- Codex implements; Hermes independently reviews the diff and verifies behavior. Codex must report `IMPLEMENTED_PENDING_VERIFICATION`, never self-certify `COMPLETE`.
- Use pnpm exclusively. Follow red-green-refactor TDD for behavior changes and add TSDoc to exported TypeScript APIs.
- Never read, print, commit, bundle, or expose secrets. Keep Gemini/OpenAI credentials server/runtime-only and out of `PUBLIC_*`, static output, logs, and prompts.
- Validate supported YouTube hosts and IDs; never create an arbitrary URL-fetch/SSRF proxy. Do not fabricate transcripts, sources, thumbnails, test output, or completion evidence.
- Keep static browsing separate from transcript/AI execution: unprivileged nginx can serve generated Astro output but cannot run the analysis workflow.
- Do not SSH, alter OCI resources, request certificates, publish GitHub, invoke Jules/Render, or deploy publicly unless the user explicitly authorizes the relevant objective.
- Only Hermes may mark an objective `COMPLETE`, after recording the exact command/URL/path, verification date, and limitations in `OBJECTIVES.md`.

## Required Codex handoff

```text
OBJECTIVE: <ID>
STATUS: IMPLEMENTED_PENDING_VERIFICATION | BLOCKED
FILES:
TESTS:
USER_TEST_URL:
LIMITATIONS:
```

# Video Bibliographer Astro Site Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Turn the Starlight starter into a typed, searchable video bibliography application that accepts a video URL, analyzes a transcript through an AI gateway, presents historically sourced citations with thumbnails and a D2 timeline, saves each generated bibliography locally, and is deployable on Render.

**Architecture:** Keep Astro + Starlight as the documentation shell, with Tailwind CSS and daisyUI for the visual system. Add a typed server/API layer for transcript analysis and bibliography persistence, a content/data model for citations, and client islands only where URL submission, loading, filtering, and progressive citation reveal require interactivity. Use the Vercel AI SDK with an OpenAI-compatible provider selected through environment variables, so the gateway can be changed without rewriting application code. Use a Render web service backed by the Astro Node adapter; never commit or expose the Render or AI keys.

**Tech Stack:** Astro 7, Starlight, TypeScript strict mode, `@astrojs/node`, Tailwind CSS 4, daisyUI 5, Vercel AI SDK (`ai` plus an OpenAI-compatible provider), Zod, Starlight D2 integration/plugin, optional OG-image integration, pnpm, Render.

---

## Current context and assumptions

- Workspace: `/Users/avery/build/astro-pages/video-bibliographer`.
- The repository is an almost-unmodified Starlight starter with placeholder docs and an existing `src/content.config.ts`.
- `PROJECT_OUTLINE.xml` is the product specification. It requires a video URL form, timeline ordered by video timestamp, confidence scores, source URLs, concise context, thumbnails, local Markdown output, and a timestamp/title-named output folder with `.thumbs.db`.
- The first release accepts a YouTube URL only. Transcript API integration and a transcript copy/paste textarea are explicitly deferred to `.hermes/NEXT_STEPS.md`; the implementation must report unavailable/private/unsupported videos clearly rather than pretending to analyze unavailable audio.
- Render deployment is deferred. Jules is the intended future reviewer/deployer through its configured MCP connection; no Render key should be read or used during this phase.
- OCI deployment is the active deployment target: build the static `dist/` site into a lightweight nginx container and provide a Docker Compose scaffold with a server-local `.env` seam for a future API key. Because a static nginx container cannot execute the AI analysis API, the AI key must not be placed in the browser bundle; dynamic analysis remains a future backend/service concern.
- The missing `@file:ai-sdk/openai` reference is treated as a package/provider hint, not a project file.
- Thumbnail art is intentionally case-by-case: use source images, public-domain material, or generated/fantasy illustrations as appropriate, retaining attribution/provenance metadata when available and clearly labeling reconstructions as illustrative.

## Proposed data contract

Define shared Zod/TypeScript schemas for:

- `VideoRequest`: normalized `videoUrl`, optional transcript override, optional language.
- `Bibliography`: source video metadata, generated timestamp, ordered `references`, timeline data, processing notes, and local output path.
- `Reference`: stable id, video timestamp in seconds plus display string, quoted/reference text, identified person/event/work, confidence number constrained to 0–1, source URL/title, context, significance synopsis capped at two paragraphs, thumbnail path/URL, and uncertainty/disclaimer.
- `AnalysisJob`: queued/running/completed/failed state and user-safe error message.

Keep provider, transcript extraction, source lookup, thumbnail generation, and filesystem persistence behind small interfaces so the UI is testable without live external services.

## Step-by-step implementation plan

### Task 1: Establish the project baseline and inspect dependency constraints

**Objective:** Confirm the starter builds under pnpm and record the exact current Astro/Starlight behavior before replacing placeholder content.

**Files:**
- Read: `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `tsconfig.json`, `src/content.config.ts`.
- Modify: `README.md`.

**Steps:**
1. Run `pnpm install --frozen-lockfile` and `pnpm build`; capture baseline results.
2. Verify the Astro version supports the planned Node adapter and Starlight integrations.
3. Update `README.md` with the product purpose, pnpm commands, required environment variable names (without values), and local output convention.
4. Run `pnpm build` again; expected: successful baseline build.
5. Commit as `chore: establish video bibliographer baseline`.

### Task 2: Add typed tooling, scripts, and runtime configuration

**Objective:** Make TypeScript checking and TypeDoc generation first-class commands.

**Files:**
- Modify: `package.json`, `tsconfig.json`.
- Create: `typedoc.json`, `.env.example`.
- Test: `tests/config/package-scripts.test.ts` or equivalent package metadata test.

**Steps:**
1. Add runtime/dev dependencies with pnpm: `@astrojs/node`, `ai`, an OpenAI-compatible AI SDK provider, `zod`, Tailwind integration if required by the installed Astro version, daisyUI integration/config, D2 integration/plugin, and `typedoc`.
2. Add scripts: `check` (`astro check`), `typecheck`, `typedoc`, `test`, `test:watch`, and `build` with type checks included where practical.
3. Configure TypeDoc entry points to the typed application/service modules, exclude tests/generated files, and emit docs under `docs/api`; enable warnings for missing comments.
4. Add typed environment declarations for the AI key/base URL/model, app URL, output directory, and Render deployment settings. Use runtime validation with Zod; do not provide secret defaults.
5. Add a failing metadata/config test, then run it, implement the scripts/config, and rerun expecting pass.
6. Run `pnpm check`, `pnpm typecheck`, and `pnpm typedoc`; expected: no TypeScript errors and generated API docs.
7. Commit as `build: add typedoc and typed application configuration`.

### Task 3: Replace the starter shell with the bibliography information architecture

**Objective:** Create the Starlight navigation, branded landing page, bibliography workflow pages, and accessible visual foundation.

**Files:**
- Modify: `astro.config.mjs`, `src/content/docs/index.mdx`, `src/content/docs/guides/example.md`.
- Create: `src/styles/global.css`, `src/components/VideoUrlForm.astro`, `src/components/EmptyState.astro`, `src/components/ConfidenceBadge.astro`.
- Test: `tests/ui/content-structure.test.ts`.

**Steps:**
1. Configure Starlight title, description, social links, favicon, custom CSS, and sidebar sections for Analyze, Bibliographies, Methodology, and API Reference.
2. Configure Tailwind/daisyUI without shipping unnecessary client JavaScript; define a small theme using semantic tokens and accessible contrast.
3. Replace starter hero copy with the product promise, a prominent video URL form, method/accuracy disclaimer, and sample bibliography call-to-action.
4. Build the form with labels, URL validation messaging, keyboard support, pending/error states, and no secret fields.
5. Add typedoc/API and methodology pages explaining confidence, source verification, uncertainty, thumbnails, and audio reprocessing limits.
6. Add CSS animation classes for several citation reveal effects, respecting `prefers-reduced-motion`; choose effects deterministically from citation id rather than unstable server/client randomness.
7. Add a failing content/heading/accessibility smoke test, run it, implement the shell, and rerun expecting pass.
8. Run `pnpm check` and `pnpm build`; expected: starter routes removed/replaced and branded pages build.
9. Commit as `feat: create bibliography site shell`.

### Task 4: Implement the typed bibliography domain model and local Markdown persistence

**Objective:** Validate bibliography records and save exact rendered Markdown plus local thumbnails in the required timestamp/title folder structure.

**Files:**
- Create: `src/lib/bibliography/schema.ts`, `src/lib/bibliography/slug.ts`, `src/lib/bibliography/markdown.ts`, `src/lib/bibliography/storage.ts`.
- Create: `tests/bibliography/schema.test.ts`, `tests/bibliography/storage.test.ts`.

**Steps:**
1. Write failing tests for confidence bounds, timestamp ordering, two-paragraph synopsis limits, required live source URLs, safe title slugging, and deterministic folder naming.
2. Implement Zod schemas and exported TypeScript types; add TSDoc comments to every public type/function, including examples and failure behavior where useful.
3. Write the Markdown renderer with timeline, reference tables/cards, source links, confidence/disclaimer text, and relative thumbnail links.
4. Implement storage using a configurable output root, creating `<YYYY-MM-DD_HH_MM_SS_Title>/.thumbs.db/`, the matching `.md` filename, and thumbnail files without overwriting existing outputs.
5. Rerun focused tests expecting pass, then run the full test suite.
6. Run `pnpm typedoc` and verify public domain APIs appear without missing-comment warnings.
7. Commit as `feat: add typed bibliography persistence`.

### Task 5: Add transcript acquisition and AI analysis service boundaries

**Objective:** Turn a submitted video URL/transcript into validated, source-aware bibliography records through an injectable AI gateway.

**Files:**
- Create: `src/lib/transcript/types.ts`, `src/lib/transcript/provider.ts`, `src/lib/analysis/prompts.ts`, `src/lib/analysis/gateway.ts`, `src/lib/analysis/service.ts`.
- Create: `tests/analysis/service.test.ts`, `tests/analysis/prompts.test.ts`.

**Steps:**
1. Write tests with a fake transcript provider and fake AI model for URL normalization, missing transcript errors, structured output validation, chronological sorting, confidence/disclaimer handling, and provider failures.
3. Implement a transcript provider interface for YouTube URLs only, with an explicit unsupported/unavailable result until a transcript API is selected. Do not add pasted transcript UI or claim audio analysis in this release.
3. Implement the AI SDK gateway using structured generation against the validated bibliography schema. Configure provider/key/model/base URL from server-only environment variables.
4. Craft prompts that require exhaustive candidate identification, source URLs, evidence/context, confidence 0–1, explicit uncertainty, and a processing log. Instruct the model not to invent sources and to mark unverifiable candidates.
5. Add a second-pass hook for low-confidence items so audio-capable reprocessing can be added later without changing the domain model; record each pass and score change.
6. Add TSDoc comments to gateway interfaces, prompt builders, and service methods; ensure generated docs explain that external factual claims require source verification.
7. Run focused tests expecting pass, then `pnpm check`, `pnpm typecheck`, and `pnpm typedoc`.
8. Commit as `feat: add typed transcript analysis service`.

### Task 6: Add the server endpoint and interactive result workflow

**Objective:** Connect the URL form to analysis, persistence, and a responsive result page while keeping secrets and filesystem access server-side.

**Files:**
- Create: `src/pages/api/analyze.ts`, `src/pages/bibliographies/[slug].astro`, `src/components/AnalyzePanel.tsx` or `.astro` island.
- Modify: `src/content/docs/index.mdx`.
- Create: `tests/api/analyze.test.ts`, `tests/ui/analyze-panel.test.ts`.

**Steps:**
1. Write failing endpoint tests for malformed URLs (400), missing transcript (422), successful structured output (200), safe internal errors (500), and output persistence.
2. Implement the POST endpoint with request-size limits, content-type validation, server-only environment access, dependency injection for tests, and safe error messages.
3. Add a result renderer showing D2 timeline at the top, chronological citation cards, source table, thumbnails, confidence badges, max-two-paragraph synopsis, and processing notes.
4. Add lazy/on-viewport reveal behavior using `IntersectionObserver` with a no-JS/static fallback and reduced-motion behavior. Keep hydration scoped to the submission/filter interactions.
5. Add filtering by confidence/entity/type only if it does not complicate the core flow; avoid premature client-side state architecture.
6. Run focused endpoint/UI tests, `pnpm check`, and `pnpm build`; expected: submitted fixture produces a persisted Markdown bibliography and navigable result page.
7. Commit as `feat: connect analysis workflow and citation results`.

### Task 7: Add D2 timeline and thumbnail handling

**Objective:** Provide the required overview visualization and reliable citation imagery without violating source or licensing expectations.

**Files:**
- Modify: `astro.config.mjs`, `src/lib/bibliography/markdown.ts`, `src/pages/bibliographies/[slug].astro`.
- Create: `src/components/ReferenceTimeline.astro`, `src/lib/media/thumbnails.ts`.
- Create: `tests/bibliography/timeline.test.ts`, `tests/media/thumbnails.test.ts`.

**Steps:**
1. Write tests for D2 text generation from ordered references, safe escaping of quote/event text, empty/single-reference timelines, and thumbnail fallback behavior.
2. Add and configure the Starlight D2 integration/plugin from the documented package/version; verify its actual API against installed package docs before coding the integration.
3. Render a compact D2 timeline with one box per reference, video timestamp, entity/event, and max-96-character description; include a textual accessible timeline alongside/within the visual component.
4. Implement a thumbnail service contract with local generated/selected assets, source attribution metadata, and a deterministic placeholder for unavailable images. Do not automatically copy Google Images assets without licensing/attribution checks.
5. Ensure generated thumbnails are stored under `.thumbs.db` and linked relatively in Markdown.
6. Run focused tests and `pnpm build`; expected: D2 compilation succeeds and every rendered reference has either a valid local image or an explicit fallback.
7. Commit as `feat: add D2 reference timeline and thumbnails`.

### Task 8: Prepare OCI static deployment and verify production behavior

**Objective:** Package the static Astro `dist/` output as a lightweight nginx container for deployment to the user’s Oracle Linux 10 aarch64 OCI instance.

**Files:**
- Modify: `astro.config.mjs`, `package.json`, `README.md`.
- Create: `Dockerfile`, `docker-compose.yml`, `.env.example`, `.dockerignore`, `.hermes/NEXT_STEPS.md`.
- Test: `tests/deployment/static-smoke.test.ts`.

**Steps:**
1. Write deployment smoke-test coverage asserting representative static routes and no secret leakage; do not add a server health endpoint to the static nginx image.
2. Configure static Astro output and add a multi-stage Dockerfile using an ARM-compatible lightweight nginx base, with an nginx config that supports Starlight deep links and serves `/` fallback safely.
3. Add `docker-compose.yml` and `.env.example` for a server-local API-key seam, explicitly documenting that nginx cannot consume the key and that it must not be exposed to client JavaScript. Keep the real `.env` ignored.
4. Add OCI deployment notes covering Oracle Linux 10 aarch64, Docker Compose, SSH prerequisites, firewall/OCI security-list ports, image build/run commands, and the static-site limitation. Document the exact handoff data required before any SSH action: reachable hostname/IP (preferably a Tailscale hostname), SSH username, key path or already-authorized agent identity, remote deployment directory, ingress port, and explicit authorization to deploy.
5. Add `.hermes/NEXT_STEPS.md` documenting transcript API and transcript textarea options, plus the future dynamic AI/backend boundary.
6. Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm typedoc`, and `pnpm build`.
7. Build the container locally with `docker build`, run it with Compose, and verify representative routes using an HTTP client. Do not SSH or deploy until the user supplies connection details and explicitly requests deployment.
8. Commit as `chore: prepare OCI static deployment`.

### Task 9: Final documentation, generated API docs, and quality review

**Objective:** Leave a maintainable, documented project with no starter artifacts or untyped public APIs.

**Files:**
- Modify: `README.md`, `src/content/docs/guides/methodology.md`, `src/content/docs/reference/configuration.md`.
- Remove/replace: starter example docs and unused `src/assets/houston.webp` if no longer referenced.
- Generate: `docs/api/` via TypeDoc if committed by project convention.

**Steps:**
1. Search for starter text, placeholder links, `any`, secret literals, and un-commented exported declarations.
2. Add or update TSDoc for all public domain/service/configuration APIs, including `@param`, `@returns`, `@throws`, and `@example` where behavior is non-obvious.
3. Run `pnpm typedoc` and inspect generated output for warnings and useful navigation.
4. Run the full test/check/build sequence and inspect the production bundle for accidental client inclusion of AI keys or filesystem modules.
5. Perform an accessibility smoke test: keyboard-only URL submission, visible focus, reduced motion, alt text, heading order, source-link labels, and textual timeline fallback.
6. Review the final diff for scope, licensing/attribution, unsafe secret handling, and retention behavior.
7. Commit as `docs: finalize typed API and deployment guidance` and tag only if the repository’s release convention is explicitly confirmed.

## Tests and validation summary

Required before implementation is considered complete:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm typecheck
pnpm test
pnpm typedoc
pnpm build
```

Also verify:

- A fixture request produces a validated, chronologically ordered bibliography.
- Invalid and unavailable transcript inputs fail with actionable, non-secret errors.
- Confidence values are always between 0 and 1 and uncertain references carry disclaimers.
- Each citation has a source URL or an explicit unverifiable status; no fabricated source is silently presented as verified.
- D2 timeline renders and has an accessible text equivalent.
- Local Markdown and `.thumbs.db` output links resolve correctly.
- `dist/`/server output contains no AI or Render secret values.
- Render build/start/health checks work with `PORT` and pnpm.

## Risks, tradeoffs, and open questions

- **Transcript access:** A YouTube URL alone is not enough for reliable analysis. This release should make that limitation explicit and defer both a licensed transcript API and pasted-transcript textarea to `.hermes/NEXT_STEPS.md`.
- **AI source accuracy:** The model can hallucinate references or URLs. Keep confidence and uncertainty visible, validate URL shape, and add a source-verification step or human review status before labeling a source verified.
- **D2 compatibility:** Starlight D2 plugins vary in package/API shape. Confirm the current package and Astro 7 compatibility before locking dependencies.
- **Thumbnail licensing:** “Google Images” is not a license. Prefer generated illustrations, public-domain sources, or explicit attribution metadata.
- **OCI persistence:** Static nginx cannot create dynamic bibliography files or execute AI analysis. Treat generated Markdown/thumbnails as build/local artifacts until a backend/object-storage design is selected.
- **AI gateway choice:** Use the simplest OpenAI-compatible provider available in the current SDK ecosystem; keep it behind an interface so changing provider packages is a small follow-up.
- **Deployment target:** OCI SSH deployment is now preferred. Jules/Render remains a later workflow for review and deployment automation.

## Deferred Jules/GitHub/Render workflow

The user’s preferred future workflow is:

1. Initialize and protect the repository immediately with a comprehensive `.gitignore` before any credentials or generated secrets can enter Git history.
2. Create a public GitHub repository and push the project only after a secret scan and clean diff review.
3. Enable/grant Jules access to that repository through the configured Jules MCP integration.
4. Ask Jules to double-check the implementation, run unit tests, Playwright tests, smoke tests, and production build checks.
5. Have Jules deploy to Render through its own MCP connection, keeping Render credentials outside this project and outside Hermes session output.

This workflow should be saved as a reusable self-made skill or `POTENTIAL_NEXT_STEPS.md` during execution, not performed as part of the current OCI-focused plan. Jules should be treated as an independent reviewer/deployer, and claims of completion must be verified using repository, CI, deployment, or URL evidence.

## Handoff

Plan complete and saved. Ready to execute using subagent-driven-development — dispatch a fresh subagent per task with two-stage review (spec compliance, then code quality) and require `pnpm check`, `pnpm typedoc`, tests, and production build evidence before declaring completion.

---

## Decisions needed before execution

1. Which transcript API should be selected later, and what licensing/rate limits apply?
2. Should generated bibliographies eventually use OCI-mounted storage, object storage, or a dedicated backend?
3. What OCI hostname/IP, SSH username, SSH key path/agent identity, and remote deployment directory should be used when deployment is authorized?
4. Which OCI ingress port should nginx use (80, 443 behind a reverse proxy, or another port)?

These questions affect implementation scope; they do not block the initial typed project scaffolding and schema work.

## Implementation-ready notes

- Use pnpm exclusively; update `pnpm-lock.yaml` through pnpm rather than hand-editing it.
- Do not read, print, or commit `$HOME/.secrets/MacClawd/render-api-key`; Render/Jules deployment is deferred.
- Do not attempt SSH or OCI deployment until the user supplies a hostname/IP, username, authentication method, remote path, and explicit deployment authorization.
- `PROJECT_OUTLINE.xml` remains the source specification; preserve its local-output naming and `.thumbs.db` requirements.
- Every exported TypeScript declaration added by the implementation must have TSDoc so `pnpm typedoc` is clean.
- Prefer small, reversible commits after each task.
- Current baseline branch status observed during planning: `main`, with pre-existing modifications to `AGENTS.md`, `package.json`, and `pnpm-lock.yaml`, plus untracked `PROJECT_OUTLINE.xml`; do not discard those changes during implementation.

## Plan review checklist

- [x] Sequential, bite-sized tasks
- [x] Exact paths for planned artifacts
- [x] TDD cycle and expected validation included
- [x] pnpm workflow specified
- [x] TypeScript and TypeDoc explicitly covered
- [x] AI gateway and secret handling addressed
- [x] Render setup and deployment verification addressed
- [x] Local bibliography/thumbnails retention requirements addressed
- [x] Risks and unresolved product decisions called out
- [x] No implementation performed during plan mode

Plan complete and saved. Ready to execute using subagent-driven-development — I'll dispatch a fresh subagent per task with two-stage review (spec compliance then code quality). Shall I proceed?
練習
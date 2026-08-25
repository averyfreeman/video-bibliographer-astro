# YouTube Video Bibliographer Agentic Workflow Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build and verify a working Astro development site plus a safe agentic workflow that accepts a YouTube URL, obtains its transcript through a provider, produces the required bibliography work product, and later packages/deploys the static site with Podman on the OCI VM.

**Architecture:** Keep the web UI and generated bibliography presentation in Astro/Starlight with strict TypeScript and TypeDoc/TSDoc. Put transcript retrieval, AI analysis, source verification, thumbnail generation, and local work-product persistence behind server-side modules or a separate agent/CLI workflow so API keys never enter browser assets. Use Gemini as the first practical AI path because it is adjacent to YouTube and select an inexpensive Flash-class model available in the configured API; fall back to OpenAI or OpenRouter only if Gemini is unavailable or inadequate. Use the OCI VM as the authoritative container environment because Podman is not installed locally on macOS.

**Tech Stack:** Astro 7, Starlight, TypeScript strict mode, TypeDoc/TSDoc, pnpm, Tailwind CSS 4, daisyUI, D2 or an accessible typed timeline fallback, Gemini/OpenAI-compatible AI SDK, YouTube transcript adapter, generated/source thumbnails, nginx unprivileged, Podman Compose, Certbot.

---

## Current context and constraints

- Workspace: `/Users/avery/build/astro-pages/video-bibliographer`.
- Product specification: `PROJECT_OUTLINE.xml`.
- Existing project is an Astro/Starlight starter with user-provided `Dockerfile` and `docker-compose.yml`.
- No local Podman is available on this Mac. `pnpm`, Docker, OrbStack CLI, SSH, and the Chrome Canary launcher are available, but local container compatibility is not the production authority.
- Authoritative container test target: `avery@oci-amp212.tail78ee63.ts.net`, Oracle Linux 10 aarch64, Podman/`podman compose`, unprivileged `avery` user, host low-port configuration already prepared.
- Development server must bind to `0.0.0.0:5000` so it can be checked over the tailnet. Configure this as a project script or Astro CLI invocation and verify the bind address with an HTTP request from the host.
- First product scope is YouTube URL only. A transcript API is now part of the requested agentic workflow, but pasted transcript textarea support remains deferred and must be recorded in `.hermes/NEXT_STEPS.md`.
- API key candidates have been discovered by filename only under `$HOME/.secrets/MacClawd/`: Gemini primary/secondary, OpenAI, OpenRouter, and related credentials. Never print their contents, commit them, send them to the browser, or include them in tool output.
- The requested initial Git repository name is `youtube-video-bibliographer`; use conventional commits and semantic-version tags beginning at `0.1.0` at validated milestones.
- Render/Jules/GitHub remains a later workflow. Do not read or use the Render key during this OCI-focused phase.
- The user wants a check-in once the transcript-to-work-product workflow is genuinely working. If an API-key integration blocks progress, break early and notify through the configured Telegram gateway if that outbound channel is available; otherwise report the blocker in this chat without exposing credentials.

## Non-negotiable security boundary

A static nginx container cannot execute AI analysis. The browser may submit a YouTube URL to a future server-side endpoint, but no Gemini/OpenAI/OpenRouter key may appear in `dist/`, client JavaScript, `docker-compose.yml` committed content, or public HTML. For the first working workflow, prefer a local/server-side CLI or Astro server endpoint with environment variables loaded only at runtime. If transcript retrieval or AI generation requires a credential that cannot be safely configured, stop and report the exact missing capability rather than weakening this boundary.

## Step-by-step implementation plan

### Task 1: Protect the repository and establish the 0.1.0 baseline

**Objective:** Create a safe local repository baseline before adding code or using any external service.

**Files:**
- Modify: `.gitignore`, `README.md`.
- Create: `.env.example`, `.dockerignore`.
- Read: `PROJECT_OUTLINE.xml`, `AGENTS.md`, `package.json`, `astro.config.mjs`, `tsconfig.json`.

**Steps:**
1. Strengthen `.gitignore` to ignore all real `.env` files, certificates, private keys, `dist/`, `.astro/`, generated bibliography folders, local logs, and TypeDoc output unless deliberately committed.
2. Add `.env.example` containing variable names only for Gemini/OpenAI/OpenRouter selection, model name, app URL, output root, and future transcript adapter settings.
3. Run a tracked/worktree secret scan for API-key and private-key patterns; inspect results without printing secret values.
4. Initialize or rename the local repository to `youtube-video-bibliographer` if needed, preserving existing user changes and avoiding destructive resets.
5. Commit the protected baseline and tag `0.1.0` only after the scan and baseline build pass.

### Task 2: Build the minimal Astro dev site first

**Objective:** Replace starter content with the product shell and prove `http://0.0.0.0:5000` works before integrating APIs.

**Files:**
- Modify: `astro.config.mjs`, `package.json`, `src/content/docs/index.mdx`, starter guide/reference pages.
- Create: `src/styles/global.css`, `src/components/VideoUrlForm.astro`, `src/components/ScopeNotice.astro`.
- Test: `tests/ui/site-shell.test.ts`.

**Steps:**
1. Write a failing test for product branding, YouTube URL input, accessible labels, explicit transcript-processing status, and removal of starter copy.
2. Run the focused test and confirm the expected failure.
3. Implement the smallest branded Starlight shell with URL validation, a sample bibliography link, and clear processing/error states.
4. Configure the dev script to bind `--host 0.0.0.0 --port 5000` and document the phone/tailnet access URL.
5. Add TSDoc to all exported TypeScript declarations introduced by the UI.
6. Run `pnpm install --frozen-lockfile`, start `pnpm dev`, and verify with `curl http://127.0.0.1:5000/` plus a browser smoke check through Chrome Canary if needed.
7. Run `pnpm check` and `pnpm build`.
8. Commit the working shell and tag `0.2.0` after validation.

### Task 3: Add typed bibliography schemas, work-product rendering, and TypeDoc

**Objective:** Define and document the validated output format required by `PROJECT_OUTLINE.xml`.

**Files:**
- Modify: `package.json`, `tsconfig.json`.
- Create: `typedoc.json`, `src/lib/bibliography/schema.ts`, `src/lib/bibliography/types.ts`, `src/lib/bibliography/markdown.ts`, `src/lib/bibliography/storage.ts`.
- Test: `tests/bibliography/schema.test.ts`, `tests/bibliography/markdown.test.ts`, `tests/bibliography/storage.test.ts`.

**Steps:**
1. Add test runner/assertion dependencies with pnpm and preserve the lockfile.
2. Write failing tests for confidence range 0–1, timestamp ordering, source URL validation, max-two-paragraph synopsis, 96-character timeline labels, safe title/folder names, relative thumbnail links, and exact Markdown output persistence.
3. Implement Zod schemas and TypeScript types with complete TSDoc (`@param`, `@returns`, `@throws`, and examples for public APIs).
4. Implement output folders named `YYYY-MM-DD_HH_MM_SS_Title`, matching Markdown filename, `.thumbs.db` image directory, and no-overwrite behavior.
5. Add TypeDoc scripts/config and verify `pnpm typedoc` produces docs without missing-comment errors.
6. Run focused tests, then full tests/type checks.
7. Commit and tag the validated domain/work-product milestone as `0.3.0`.

### Task 4: Implement the YouTube transcript adapter

**Objective:** Convert a public YouTube URL into a transcript or a precise, user-safe unavailable result.

**Files:**
- Create: `src/lib/youtube/url.ts`, `src/lib/youtube/transcript.ts`, `src/lib/youtube/types.ts`.
- Test: `tests/youtube/url.test.ts`, `tests/youtube/transcript.test.ts`.
- Modify: `.env.example`, `README.md`.

**Steps:**
1. Write failing tests for standard YouTube URLs, shortened URLs, playlist/video extraction, malformed/private/unavailable videos, and transcript language handling.
2. Implement URL normalization and an injectable transcript-provider interface.
3. Select a maintained transcript retrieval approach after checking current package/API behavior; do not scrape around access controls or claim success without actual transcript text.
4. Implement bounded timeouts, rate-limit/error classification, and redacted diagnostics.
5. Run tests with deterministic fixtures/mocks; separately run one safe live public YouTube smoke test only after the adapter passes fixture tests.
6. Record transcript API/license/rate-limit assumptions in `.hermes/NEXT_STEPS.md` and document that pasted transcript input is deferred.
7. Commit and tag the validated adapter milestone as `0.4.0`.

### Task 5: Implement the AI analysis agentic workflow

**Objective:** Turn a retrieved transcript into an evidence-aware, chronologically ordered bibliography work product.

**Files:**
- Create: `src/lib/analysis/prompts.ts`, `src/lib/analysis/gateway.ts`, `src/lib/analysis/service.ts`, `src/lib/analysis/verification.ts`.
- Create: `scripts/analyze-youtube.ts` or a server-only equivalent.
- Test: `tests/analysis/service.test.ts`, `tests/analysis/gateway.test.ts`, `tests/analysis/verification.test.ts`.
- Modify: `.env.example`, `package.json`, `.gitignore`.

**Steps:**
1. Write failing tests using an injected fake transcript and fake model for exhaustive candidate extraction, structured schema validation, chronological sorting, confidence/disclaimer handling, and persistence.
2. Implement a provider-neutral gateway interface and select Gemini first using the cheapest available Flash-class model configured by environment. Do not hardcode a model name that the current Gemini API does not support; verify the model list/API contract before choosing it.
3. Add OpenAI/OpenRouter provider fallback only behind the same interface if Gemini cannot be made reliable. Keep provider selection server-side.
4. Prompt for every plausible quote/reference, timestamp, entity/event, original source URL, context, two-paragraph maximum significance, confidence, uncertainty, and processing notes. Explicitly instruct the model not to fabricate citations or URLs.
5. Add source-verification checks: URL shape, reachable/source response where feasible, evidence status, and explicit “unverified” state. A valid-looking URL is not automatically an original source.
6. Add low-confidence reprocessing hooks and record attempts/scores, but do not claim audio reprocessing until an audio-capable implementation exists.
7. Persist the exact generated Markdown work product and local metadata after successful validation.
8. Run focused tests and one controlled live test with a safe public YouTube URL. Redact prompts/responses if they contain sensitive data.
9. Commit and tag the validated transcript-to-work-product milestone as `0.5.0`.

### Task 6: Add the result UI and sample/fixture experience

**Objective:** Make the generated bibliography enjoyable and accessible to browse while retaining a deterministic fixture for testing.

**Files:**
- Create: `src/data/sample-bibliography.ts`, `src/components/ReferenceTimeline.astro`, `src/components/CitationCard.astro`, `src/pages/bibliographies/sample.astro`.
- Modify: `src/content/docs/index.mdx`.
- Test: `tests/ui/sample-bibliography.test.ts`.

**Steps:**
1. Write failing UI tests for timeline-first ordering, source links, confidence badges, synopsis limits, thumbnail alt text, and illustrative/reconstructed labeling.
2. Add a clearly labeled fixture that is not presented as live AI output.
3. Integrate the compatible Starlight D2 package if its current API supports this Astro version; otherwise provide a typed accessible timeline and record D2 as a follow-up rather than inventing an integration.
4. Add case-by-case thumbnail metadata for archival, attributed, public-domain, generated, and fantasy reconstruction images.
5. Add deterministic viewport reveal effects with reduced-motion fallback.
6. Run UI tests, `pnpm check`, `pnpm typedoc`, and `pnpm build`.
7. Commit and tag the validated browsing milestone as `0.6.0`.

### Task 7: Compare image-generation options with controlled examples

**Objective:** Produce a small, reviewable comparison of OpenAI Image Generation and Nano Banana 2 Flash for historical/fantasy citation thumbnails.

**Files:**
- Create: `docs/image-generation-comparison.md`, `assets/thumbnail-comparisons/`.
- Modify: `.gitignore`, `.env.example`.

**Steps:**
1. Choose three controlled prompts: a documented historical event, an impossible-to-photograph historical scene, and a clearly labeled imaginative reconstruction such as a 1896 Pollock-era protest scene.
2. Generate a small batch with each available image provider/model, using only secret files loaded server-side and never printing key contents.
3. Save returned image files and record provider/model, prompt, date, and attribution/reconstruction label. Do not imply generated images are archival evidence.
4. Compare legibility, historical specificity, controllability, consistency, latency, and cost qualitatively; avoid inventing pricing or model availability.
5. If a provider is unavailable or the active image tool cannot select the requested model, report that honestly and compare only results actually produced.
6. Commit comparison assets/docs only if sizes/licensing/repo policy are acceptable; otherwise retain them as local artifacts.

### Task 8: Harden the OCI Podman deployment scaffold

**Objective:** Make the static site build and run correctly on the matching Oracle Linux aarch64 Podman host.

**Files:**
- Modify: `Dockerfile`, `docker-compose.yml`, `README.md`, `.gitignore`.
- Create/modify: `nginx/default.conf`, `.dockerignore`.
- Test: `tests/deployment/static-smoke.test.ts`.

**Steps:**
1. Write failing static smoke expectations for `/`, `/bibliographies/sample/`, assets, and `/.well-known/acme-challenge/`.
2. Change the builder to pnpm lockfile-respecting installation and ensure the final nginx image is multi-architecture and unprivileged.
3. Configure deep-link routing, static cache headers, ACME webroot, and later TLS mount points. Do not pretend port mapping creates HTTPS without nginx TLS configuration.
4. Use the requested host layout: `/home/avery/containers/video-bibliographer`, `certbot-certs/`, and a separate ACME webroot. Keep real `.env` server-local and ignored.
5. Do not recursively chown certificates inside the web container. Verify nginx UID 101/group access using host-side ownership, groups, or ACLs and read-only certificate mounts.
6. After local Astro checks pass, SSH to the OCI VM for authoritative `podman compose config`, `podman compose build`, `podman compose up`, route checks, image architecture checks, and non-root process checks. Do not require local Podman.
7. Commit and tag the validated container milestone as `0.7.0`.

### Task 9: Optional OCI deployment and HTTPS

**Objective:** Expose the validated static site at `averyfreeman.com` only after explicit deployment authorization and successful local/remote checks.

**Required confirmation before action:**

- Explicit authorization to SSH/deploy.
- Remote path, expected ingress ports, and whether ports 80/443 are already occupied.
- Confirmation of the Certbot email/domain and current DNS target.
- Whether to transfer source/build context or a built image archive.

**Steps:**
1. Run read-only SSH preflight as `avery`: identity, OS/architecture, Podman/Compose versions, listeners, firewall, directory permissions, and DNS observations. Never print secret contents.
2. Transfer only validated files or image archive; create `.env` remotely from approved values, never from Git.
3. Start HTTP only and verify the apex domain, sample deep link, and ACME challenge route.
4. Run Certbot through the webroot mount only after HTTP challenge routing works.
5. Configure/reload TLS and verify nginx UID 101 can read certificates without broad permissions or container-side chown.
6. Verify HTTPS, restart persistence, renewal strategy, logs, and non-root execution.
7. Tag successful public deployment as `0.8.0`; do not tag failed/incomplete deployment.

## Required check-in point

Stop and report back once all of the following are true:

- A real YouTube URL has been accepted.
- A real transcript has been retrieved, or the provider has returned a verified limitation.
- The selected AI provider has produced schema-valid reference records.
- The output has been source/evidence checked, rendered into the required Markdown work product, and saved in the required folder structure.
- The local dev site presents the result or a truthful error state.

If Gemini/OpenAI/OpenRouter authentication fails or the model cannot reliably perform the workflow, break early. Notify through Telegram only if the configured Hermes Telegram gateway is already available; do not attempt to configure a new bot or expose credentials mid-task. Also report the blocker here when the channel is unavailable.

## Validation commands

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm typecheck
pnpm test
pnpm typedoc
pnpm build
pnpm dev --host 0.0.0.0 --port 5000
curl -fsS http://127.0.0.1:5000/
ssh avery@oci-amp212.tail78ee63.ts.net 'uname -m; podman --version; podman compose version'
# Remote only, after local checks:
podman compose config
podman compose build
podman compose up -d
```

## Risks and practical tradeoffs

- **Transcript availability:** YouTube URLs can be private, age-restricted, captionless, rate-limited, or inaccessible. Fail transparently rather than inventing transcript content.
- **AI reliability:** A cheap Flash model is appropriate for initial extraction, but source verification and confidence labels are mandatory because generated citations can be wrong.
- **Provider fallback:** Gemini first is reasonable; keep the gateway abstract so OpenAI/OpenRouter can be tested without changing the bibliography domain.
- **Image comparison:** Only compare images actually generated. Model naming and availability must be verified at execution time.
- **Static deployment:** The nginx image serves presentation only. Dynamic analysis requires a future backend or separate agent service.
- **Remote container testing:** OCI is the correct compatibility authority because it matches Podman/aarch64 production; local Docker/OrbStack would be secondary and optional.
- **Secrets:** `$HOME/.secrets/MacClawd/*` is a credential source, not a file to copy into the project. Use process environment or secret injection and redact diagnostics.

## Handoff

Plan updated for the requested dev-first workflow, Gemini-first transcript analysis, controlled image comparison, remote Podman validation, `0.0.0.0:5000` access, and repository milestones beginning at `0.1.0`.

The next execution should start with Task 1 and Task 2 locally. Do not contact OCI or attempt deployment until the local dev server and build are working.

Repository target: `youtube-video-bibliographer`.

Deferred future workflow: create a public GitHub repo after secret scanning, enable Jules access, have Jules run unit/Playwright/smoke checks, and have Jules deploy to Render through its MCP connection.

Plan complete and saved. Ready to execute using subagent-driven-development — I’ll dispatch a fresh subagent per task with two-stage review (spec compliance, then code quality) once execution begins.


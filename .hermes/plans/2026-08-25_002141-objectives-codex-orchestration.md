# Objectives and Codex Orchestration Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Synthesize `PROJECT_OUTLINE.xml` and the existing implementation plans into a single approval artifact, `OBJECTIVES.md`, then use `codex-acp` under orchestration to implement objectives one at a time with verifiable Playwright or user acceptance evidence before marking each objective complete.

**Architecture:** `OBJECTIVES.md` is the single source of truth for project objectives, acceptance criteria, dependencies, status, evidence links, and completion dates. `AGENTS.md` will contain Codex operating rules requiring objective-by-objective work, test-first implementation, no premature completion claims, and an explicit handoff after each verified objective. Hermes remains the orchestrator: Codex may implement and report, but Hermes must independently run tests/browser checks and update objective status only after evidence exists.

**Tech Stack:** Astro 7, Starlight, strict TypeScript, TypeDoc/TSDoc, pnpm, Vitest, Playwright, Gemini-first server-side workflow, yt-dlp or a maintained transcript adapter, Markdown work-product persistence, Tailwind/daisyUI-compatible styling, D2 timeline or accessible fallback, nginx/Podman OCI deployment, `codex-acp`.

---

## Planning-only constraint

This turn is plan mode. Do not create or modify `OBJECTIVES.md`, `AGENTS.md`, source files, tests, Git history, tags, external repositories, or deployments yet. The only file written by this plan is this plan document. After approval, execute the plan and create the two requested project files in a separate execution turn.

## Current context

- Workspace: `/Users/avery/build/astro-pages/video-bibliographer`.
- Product specification: `PROJECT_OUTLINE.xml`.
- Existing plans:
  - `.hermes/plans/2026-08-24_203406-video-bibliographer.md`
  - `.hermes/plans/2026-08-24_223857-video-bibliographer.md`
  - `.hermes/plans/2026-08-24_224932-video-bibliographer.md`
- Existing implementation includes a Starlight shell, dark-mode correction, YouTube URL form, bibliography TypeScript/Zod models, TypeDoc, Vitest, `yt-dlp` transcript retrieval, Gemini structured generation, Markdown rendering, and a CLI workflow.
- The dev server is intended to bind `0.0.0.0` on Astro’s default port `4321`; the currently observed process is reachable at `http://localhost:4321/` and `http://100.96.88.72:4321/`.
- Existing worktree is dirty. Codex must not reset, discard, or overwrite pre-existing changes without explicit direction.
- `codex-acp` is available at `/Users/avery/.nix-profile/bin/codex-acp`. It must be invoked with a PTY through the approved Codex harness workflow.
- Credentials exist under `$HOME/.secrets/MacClawd/`; Codex must not read, print, commit, or place them in client assets. Gemini is the preferred inexpensive model for the future workflow.
- No GitHub publication, Jules/Render operation, or OCI deployment is part of objective implementation until the relevant objective is explicitly approved and its prerequisites are verified.

## Proposed `OBJECTIVES.md` content

The execution phase should create `OBJECTIVES.md` at the repository root with this structure. Preserve the wording and status discipline; objective statuses must not be changed to `complete` merely because code exists.

```markdown
# YouTube Video Bibliographer Objectives

> Canonical project objective tracker. Keep this file current.
> An objective is complete only after implementation exists and Hermes independently verifies it with Playwright, an equivalent reproducible browser smoke test, or explicit user acceptance.

## Status legend

- `NOT_STARTED` — no implementation work verified.
- `IN_PROGRESS` — implementation or verification is underway.
- `BLOCKED` — a concrete dependency or external limitation prevents completion.
- `COMPLETE` — implementation exists, automated/manual evidence is recorded, and Hermes has independently verified it.

## Objective 1 — Protected repository baseline

- **Status:** NOT_STARTED
- **Goal:** Establish the `youtube-video-bibliographer` repository with secret-safe ignore rules and a reproducible pnpm baseline.
- **Acceptance:** `.gitignore` exists before credentials or generated artifacts are added; no API keys, private keys, certificates, `.env`, `dist/`, or local work products are tracked; `pnpm install --frozen-lockfile` succeeds.
- **Evidence required:** Secret scan output, clean relevant Git status, install output.
- **Milestone:** Commit/tag `0.1.0` only after evidence.

## Objective 2 — Accessible Astro site shell

- **Status:** IN_PROGRESS
- **Goal:** Present the Video Bibliographer identity and a usable YouTube URL entry point.
- **Acceptance:** Home page has an accessible YouTube URL field and action, no restrictive pattern rejects valid copied URLs with query parameters, starter copy is removed, dark mode has a dark content background and readable contrast, and the dev server binds `0.0.0.0:4321` unless the port is occupied.
- **Evidence required:** Playwright test or equivalent browser smoke test, URL `http://localhost:4321/` or reported fallback, and user-testable tailnet URL when available.
- **Milestone:** Tag `0.2.0` only after evidence.

## Objective 3 — Typed bibliography contract and TypeDoc

- **Status:** IN_PROGRESS
- **Goal:** Define the validated work-product model for references, confidence, sources, timestamps, context, synopsis, thumbnails, and processing notes.
- **Acceptance:** Strict TypeScript/Zod schemas reject invalid confidence/timestamps/URLs and overlong synopses; public declarations have TSDoc; TypeDoc generates successfully; chronology is deterministic.
- **Evidence required:** Focused Vitest tests, `pnpm check`, `pnpm typecheck`, and `pnpm typedoc` output.
- **Milestone:** Tag `0.3.0` only after evidence.

## Objective 4 — YouTube transcript acquisition

- **Status:** IN_PROGRESS
- **Goal:** Accept a valid public YouTube URL and retrieve timestamped transcript cues server-side, or provide an honest unavailable/error result.
- **Acceptance:** Standard watch, short, embed, shorts/live forms are normalized safely; start-time query parameters are accepted; arbitrary URLs are rejected; transcript retrieval is bounded and server-side; private, captionless, rate-limited, and unsupported cases are classified without fabricated text.
- **Evidence required:** Unit tests plus one controlled live public-video smoke test or a documented provider limitation.
- **Milestone:** Tag `0.4.0` only after evidence.

## Objective 5 — Gemini bibliography analysis

- **Status:** IN_PROGRESS
- **Goal:** Convert a real retrieved transcript into schema-valid historical reference candidates using a Gemini Flash-class model.
- **Acceptance:** API key is server/runtime-only; model is verified as available; output includes timestamps, quote/reference, subject, confidence 0–1, source URL, context, max-two-paragraph significance, uncertainty, thumbnail metadata, and processing notes; malformed or fabricated-looking output is rejected or marked unverified.
- **Evidence required:** Key-safe API smoke test, fake-provider tests, real public YouTube transcript run, structured validation output, and persisted work-product path.
- **Milestone:** Tag `0.5.0` only after evidence.

## Objective 6 — Exact Markdown work product persistence

- **Status:** IN_PROGRESS
- **Goal:** Save the exact bibliography output and local thumbnail directory required by `PROJECT_OUTLINE.xml`.
- **Acceptance:** Output folder is `YYYY-MM-DD_HH_MM_SS_<title>` with spaces replaced by underscores and title limited to 32 characters; matching Markdown filename exists; `.thumbs.db` exists; Markdown includes ordered timeline, citation details, source links, context, significance, confidence/disclaimers, and processing notes; existing output is never silently overwritten.
- **Evidence required:** Filesystem test with fixture and real workflow output inspection.
- **Milestone:** Tag `0.5.1` only after evidence.

## Objective 7 — Browser-visible bibliography browsing

- **Status:** NOT_STARTED
- **Goal:** Render a sample and generated work product as a fun, accessible, timeline-first Starlight experience.
- **Acceptance:** Timeline appears first; citations are in ascending video order; source links, confidence badges, synopsis limits, image alt text, and reconstruction labels are visible; viewport reveal effects have reduced-motion fallback; D2 is used if compatible, otherwise an accessible typed fallback is present.
- **Evidence required:** Playwright smoke tests at home and sample bibliography routes, including dark mode and keyboard navigation.
- **Milestone:** Tag `0.6.0` only after evidence.

## Objective 8 — Thumbnail generation/comparison

- **Status:** NOT_STARTED
- **Goal:** Support case-by-case archival/source/generated/reconstruction thumbnails and compare actually produced OpenAI and Nano Banana 2 Flash results.
- **Acceptance:** Each image is labeled as evidence/source or illustrative/reconstruction; local Markdown links resolve; provider/model/prompt metadata is retained; comparison claims only use successfully generated assets.
- **Evidence required:** Saved image files and `docs/image-generation-comparison.md`, or an explicit provider-blocker record.

## Objective 9 — OCI Podman static container

- **Status:** NOT_STARTED
- **Goal:** Build and run static Astro `dist/` output in an unprivileged, aarch64-compatible nginx container using Podman Compose on OCI.
- **Acceptance:** Dockerfile uses pnpm lockfile reproducibly; nginx serves deep links and ACME webroot; Compose uses `/home/avery/containers/video-bibliographer`; real `.env` remains server-local; container does not run as root; certificate permissions do not rely on broad recursive chown.
- **Evidence required:** Remote read-only preflight, `podman compose config`, build/run logs, route checks, architecture and UID checks.
- **Milestone:** Tag `0.7.0` only after evidence.

## Objective 10 — OCI HTTPS deployment

- **Status:** NOT_STARTED
- **Goal:** Expose the validated site at `averyfreeman.com` over HTTP/HTTPS through the OCI VM.
- **Acceptance:** Explicit deployment authorization exists; DNS, OCI ingress, and Oracle Linux firewall permit the chosen ports; HTTP and ACME challenge work before Certbot; nginx UID 101 can read certificates through controlled read-only mounts; HTTPS and restart behavior pass smoke checks.
- **Evidence required:** Redacted SSH preflight, HTTP/HTTPS curl or Playwright checks, certificate path/permission checks without printing private material.
- **Milestone:** Tag `0.8.0` only after evidence.

## Objective 11 — Deferred Jules/GitHub/Render workflow

- **Status:** NOT_STARTED
- **Goal:** Prepare a later public repository/review/deployment workflow managed through Jules.
- **Acceptance:** After secret scanning and explicit approval, create public GitHub repository `youtube-video-bibliographer`, enable Jules access, have Jules run unit/Playwright/smoke/build checks, and have Jules deploy to Render through its MCP connection.
- **Evidence required:** GitHub URL, Jules session/status, test outputs, Render deployment URL/ID; never claim completion from an unverified agent report.

## Objective completion log

| Objective | Status | Hermes verification date | Evidence/link | Notes |
| --- | --- | --- | --- | --- |
| 1 | NOT_STARTED | — | — | — |
| 2 | IN_PROGRESS | — | `http://localhost:4321/` | Existing shell works; independent Playwright verification still required. |
| 3 | IN_PROGRESS | — | — | Existing implementation has tests/TypeDoc; objective needs formal verification record. |
| 4 | IN_PROGRESS | — | — | `yt-dlp` path has passed a live CLI smoke test. |
| 5 | IN_PROGRESS | — | — | Gemini generation has passed a live CLI smoke test. |
| 6 | IN_PROGRESS | — | `/tmp/video-bibliographer-work-products/...` | Existing output path must be verified against all retention requirements. |
| 7 | NOT_STARTED | — | — | — |
| 8 | NOT_STARTED | — | — | — |
| 9 | NOT_STARTED | — | — | — |
| 10 | NOT_STARTED | — | — | — |
| 11 | NOT_STARTED | — | — | — |
```

## Proposed `AGENTS.md` Codex instructions

The execution phase should replace the current one-line `AGENTS.md` with this Codex-specific operating contract while preserving any project rules that are not contradictory:

```markdown
# Agent Instructions — YouTube Video Bibliographer

## Canonical objective tracking

- `OBJECTIVES.md` is the authoritative objective list and status ledger.
- Do not delete, reorder, rename, or silently weaken objectives.
- Before coding, read `PROJECT_OUTLINE.xml`, all relevant `.hermes/plans/*.md`, and `OBJECTIVES.md`.
- Work on one objective at a time. State the objective ID in every progress update and commit message.
- Never mark an objective `COMPLETE` yourself. Report `IMPLEMENTED_PENDING_VERIFICATION` with changed files, tests run, and a proposed browser/user test URL. Hermes, acting as orchestrator, records completion only after independently verifying it.
- If verification fails, leave the objective incomplete and record the failure/root cause in the objective notes.

## Development rules

- Use pnpm exclusively and preserve `pnpm-lock.yaml` through pnpm commands.
- Follow strict TypeScript and add TSDoc to every exported type, function, interface, and class.
- Follow red-green-refactor TDD for behavior changes: write a failing test, run it, implement minimally, rerun it, then refactor.
- Do not discard existing user changes, reset the worktree, or rewrite unrelated files.
- Keep secrets in runtime environment variables only. Never read, print, commit, or bundle API keys, private keys, certificates, `.env`, or credential files.
- YouTube processing must validate/normalize supported YouTube URLs and must not become an arbitrary URL fetch/SSRF proxy.
- AI output must be schema-validated. Do not invent references, original sources, transcript text, thumbnails, or test results.
- Keep static client assets free of Gemini/OpenAI/OpenRouter credentials and server-only filesystem/process imports.

## Required verification before handoff

For each objective, provide:

1. Objective ID and implementation summary.
2. Exact files changed.
3. Exact tests/commands run and real output summary.
4. A browser-testable URL, route, CLI invocation, or explicit blocker.
5. Remaining known limitations.

The orchestrator will independently run the relevant Playwright/browser smoke test and update `OBJECTIVES.md`. If no browser-verifiable surface exists, propose the narrowest deterministic test harness instead; do not self-certify completion.

## Dev server

- Use `pnpm dev` with Astro default port `4321` and host `0.0.0.0`.
- Leave the dev server running after verification unless explicitly told to stop it.
- If port 4321 is occupied, report Astro’s actual fallback port and provide the local/tailnet URL.

## Commits and tags

- Use conventional commits at meaningful milestones.
- Do not create a semantic-version tag until the orchestrator has verified the corresponding objective.
- Versioning begins at `0.1.0`.

## Deployment boundaries

- Do not SSH to OCI, publish GitHub, invoke Jules/Render, or expose a site publicly unless the orchestrator’s prompt explicitly authorizes that objective.
- OCI container tests use Podman on the matching aarch64 host; local Docker/OrbStack is optional and secondary.
- Never use container-side recursive chown as a shortcut for certificate permissions.
```

## Codex-acp orchestration sequence after approval

### Task 1: Create and verify canonical objective files

**Objective:** Create `OBJECTIVES.md` and the Codex-focused `AGENTS.md` from this approved synthesis.

**Files:**
- Create/modify: `OBJECTIVES.md`, `AGENTS.md`.
- Test: `tests/project-objectives.test.ts` or a deterministic Markdown/content validation script.

**Steps:**
1. Hermes writes the approved objective tracker and agent contract.
2. Hermes runs a content test asserting all objective IDs, status rules, YouTube URL scope, TypeDoc/TSDoc requirement, `0.0.0.0:4321`, secret boundary, OCI/Podman constraint, and version `0.1.0` are present.
3. Hermes runs `git diff --check` and a secret scan.
4. Hermes records Objective 1/2/3 existing evidence only as `IN_PROGRESS` until independent browser verification and baseline rules pass.
5. Commit the objective files only when the user authorizes commits; do not tag until Objective 1’s acceptance is independently verified.

### Task 2: Start Codex-acp with one bounded objective

**Objective:** Have Codex implement only the next incomplete objective, not the entire project in one pass.

**Steps:**
1. Launch `codex-acp` from the repository with PTY and a prompt containing the exact objective ID, acceptance criteria, current status, no-go boundaries, and required tests.
2. Instruct Codex to inspect before editing, follow TDD, leave the dev server running, and return `IMPLEMENTED_PENDING_VERIFICATION` rather than changing `OBJECTIVES.md` to `COMPLETE`.
3. Monitor Codex with `process poll/log`; do not interfere unless it drifts outside the objective.
4. If Codex asks for credentials or tries to print secrets, stop it and redirect to server-only environment handling.
5. When Codex reports completion, inspect its diff and verify claimed files/results independently.

### Task 3: Hermes verification gate

**Objective:** Prevent false completion claims.

**Steps:**
1. Run the exact unit/type/build checks relevant to the objective.
2. Start or reuse the dev server on `0.0.0.0:4321` and run Playwright/browser smoke checks against the user-testable URL.
3. Check dark/light mode, keyboard behavior, copied YouTube URLs with query parameters, deep links, and responsive behavior when relevant.
4. For transcript/AI objectives, run a safe public YouTube fixture and verify the actual persisted work-product path, schema, timestamps, source/disclaimer fields, and no secret leakage.
5. Only after real evidence exists, update the corresponding objective status and evidence link in `OBJECTIVES.md`.
6. Tell the user which objective was verified and provide the exact URL/command to test.
7. If verification fails, record `BLOCKED` or leave `IN_PROGRESS` with the root cause and redirect Codex with a narrow fix request.

### Task 4: Repeat objective-by-objective

Repeat Tasks 2–3 for Objectives 4–11 in dependency order. Do not parallelize objectives that modify shared files or depend on a prior objective’s verified behavior. Use fresh bounded Codex-acp sessions for each objective, and use a separate review pass before each objective is recorded complete.

## Verification and completion criteria

The orchestration is complete only when:

- `OBJECTIVES.md` exists and is maintained after every verified objective.
- `AGENTS.md` explicitly prevents Codex from self-certifying completion.
- Every objective status has evidence or a concrete blocker.
- The dev server remains available at the reported port.
- All project checks pass for the completed scope.
- The user receives a testable URL after each verified browser objective.
- Git commits/tags correspond to verified milestones only, starting at `0.1.0`.

## Risks and tradeoffs

- **Codex-acp interface:** The exact command/session protocol must be checked with `codex-acp --help` before launch; do not guess flags or treat ordinary `codex` CLI behavior as identical.
- **Context drift:** A large all-at-once prompt encourages Codex to skip verification. Bounded objective prompts are slower but auditable.
- **Existing dirty worktree:** Objective-file creation must preserve user changes and avoid destructive cleanup.
- **Stale plans:** Existing plans contain earlier port/deployment assumptions. `OBJECTIVES.md` supersedes conflicts with the current user direction: port `4321`, Gemini-first workflow, OCI Podman authority, and Codex orchestration.
- **External APIs:** Transcript and AI services may fail independently. Record actual provider/model/error evidence; never substitute plausible output.
- **Public exposure:** A dev server bound to `0.0.0.0` is reachable on local interfaces. Keep it on the tailnet/dev network and do not expose secrets or deploy publicly without authorization.

## Approval gate

This plan deliberately stops before creating `OBJECTIVES.md`, replacing `AGENTS.md`, launching Codex, or changing the objective ledger. After the user approves this synthesized tracker and orchestration contract, execution may begin with Task 1.

Plan complete and saved. Ready to execute after approval using `codex-acp`, with Hermes verification gates before every objective is recorded as complete.

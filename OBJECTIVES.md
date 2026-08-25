# YouTube Video Bibliographer Objectives

> Canonical project objective tracker. Keep this file current.
> An objective is complete only after implementation exists and Hermes independently verifies it with Playwright, an equivalent reproducible browser smoke test, or explicit user acceptance.

## Status legend

- `NOT_STARTED` — no implementation work verified.
- `IN_PROGRESS` — implementation or verification is underway.
- `BLOCKED` — a concrete dependency or external limitation prevents completion.
- `COMPLETE` — implementation exists, automated/manual evidence is recorded, and Hermes has independently verified it.

## Objective 1 — Protected repository baseline

- **Status:** COMPLETE
- **Goal:** Establish the `youtube-video-bibliographer` repository with secret-safe ignore rules and a reproducible pnpm baseline.
- **Acceptance:** `.gitignore` exists before credentials or generated artifacts are added; no API keys, private keys, certificates, `.env`, `dist/`, or local work products are tracked; `pnpm install --frozen-lockfile` succeeds.
- **Evidence required:** Secret scan output, clean relevant Git status, install output.
- **Milestone:** Commit/tag `0.1.0` only after evidence.

## Objective 2 — Accessible Astro site shell

- **Status:** IN_PROGRESS
- **Goal:** Present the Video Bibliographer identity and a usable YouTube URL entry point.
- **Acceptance:** Home page has an accessible YouTube URL field and action, valid copied URLs with query parameters are accepted, starter copy is removed, dark mode has a dark content background and readable contrast, and the dev server binds `0.0.0.0:4321` unless occupied.
- **Evidence required:** Playwright test or equivalent browser smoke test, user-testable URL, and independent Hermes verification.
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
- **Evidence required:** Saved image files and comparison documentation, or an explicit provider-blocker record.

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
- **Acceptance:** After secret scanning and explicit approval, create public GitHub repository `youtube-video-bibliographer`, enable Jules repository access, have Jules run unit/Playwright/smoke/build checks, and have Jules deploy to Render through its MCP connection.
- **Evidence required:** GitHub URL, Jules session/status, test outputs, Render deployment URL/ID; never claim completion from an unverified agent report.

## Completion log

| Objective | Status | Hermes verification date | Evidence/link | Notes |
| --- | --- | --- | --- | --- |
| 1 | COMPLETE | 2026-08-25 | `pnpm install --frozen-lockfile`; `pnpm test`; `pnpm check`; `pnpm typecheck`; `pnpm typedoc`; `pnpm build` | Hermes verified `SECRET_SCAN=PASS`, no tracked sensitive paths, `.env`/build/work-product ignores, source bibliography is not ignored, and `git diff --check` passed for the implementation files. `.dockerignore` added. |
| 2 | IN_PROGRESS | — | `http://localhost:4321/` | Shell and URL regression work exists; browser verification remains required. |
| 3 | IN_PROGRESS | — | — | Existing implementation has tests/TypeDoc; formal evidence record remains required. |
| 4 | IN_PROGRESS | — | — | `yt-dlp` path has passed a live CLI smoke test. |
| 5 | IN_PROGRESS | — | — | Gemini generation has passed a live CLI smoke test. |
| 6 | IN_PROGRESS | — | — | Existing output path must be verified against all retention requirements. |
| 7 | NOT_STARTED | — | — | — |
| 8 | NOT_STARTED | — | — | — |
| 9 | NOT_STARTED | — | — | — |
| 10 | NOT_STARTED | — | — | — |
| 11 | NOT_STARTED | — | — | — |

## Verification policy

Codex reports implementation; Hermes independently verifies. Only Hermes may change a status to `COMPLETE`, and only after recording reproducible evidence and a user-testable URL or command.

## Codex handoff protocol

Codex must end each objective handoff with:

- `OBJECTIVE: <ID>`
- `STATUS: IMPLEMENTED_PENDING_VERIFICATION | BLOCKED`
- `FILES:`
- `TESTS:`
- `USER_TEST_URL:`
- `LIMITATIONS:`

Hermes independently verifies the handoff and records completion here.

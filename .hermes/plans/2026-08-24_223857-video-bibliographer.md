# Video Bibliographer Dev-First OCI Deployment Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** First turn the Astro Starlight starter into a working, typed video-bibliography interface that runs successfully in development and production build mode, then package the static site for unprivileged Podman deployment on the OCI Oracle Linux 10 aarch64 VM at `averyfreeman.com`.

**Architecture:** Release 1 is a YouTube-URL-only interface and static bibliography presentation layer. It will not pretend to analyze a YouTube video without a transcript acquisition service; transcript API integration and a transcript paste field are deferred. Astro emits static `dist/` output, which nginx serves as an unprivileged container. Any future AI key remains server-local and must never enter the browser bundle; nginx cannot execute the future analysis API.

**Tech Stack:** Astro 7, Starlight, strict TypeScript, TypeDoc/TSDoc, pnpm, Tailwind CSS 4, daisyUI, D2 timeline integration, nginx unprivileged Alpine image, Podman Compose, Certbot webroot flow.

---

## Current context and verified starting point

- Workspace: `/Users/avery/build/astro-pages/video-bibliographer`.
- Product requirements are in `PROJECT_OUTLINE.xml`.
- Existing starter project contains Astro/Starlight, daisyUI, Tailwind, and Starlight Obsidian dependencies, but still has placeholder docs/configuration.
- Existing user-provided `Dockerfile` currently uses `npm install`, `npm run build`, and `nginxinc/nginx-unprivileged:alpine-slim` on port 8080.
- Existing user-provided `docker-compose.yml` maps host ports 80→8080 and 443→8443, uses named volumes for ACME/certificates, and runs Certbot with the user’s email/domain.
- Existing `.gitignore` ignores `.env`, but should be strengthened before repository creation or any future GitHub push.
- Deployment host: `avery@oci-amp212.tail78ee63.ts.net`, Oracle Linux 10 aarch64, Podman and `podman compose`, unprivileged `avery` execution, and host port 80 available via sysctl configuration. There is no local Podman on the Mac.
- Container validation strategy: use the OCI VM as the authoritative Podman/Compose test environment because it matches production. Use local Astro/pnpm/browser checks first; avoid introducing Docker Desktop/OrbStack-specific behavior unless remote validation becomes unavailable. Dockerfile syntax will be kept OCI/Podman-compatible.
- Repository target: create/use the Git repository `youtube-video-bibliographer`; initialize `.gitignore` before adding project files, preserve existing user changes, and use regular milestone commits with canonical semantic-version tags beginning at `0.1.0`.
- The requested immediate phase is development/build verification. SSH deployment is allowed only after local dev/build and container checks are successful; no SSH action is required at the beginning.

## Important corrections to the supplied container scaffold

The implementation should inspect and fix, rather than blindly use, these issues:

1. Use `pnpm install --frozen-lockfile` in the builder and copy `package.json`, `pnpm-lock.yaml`, and workspace files as needed. Do not silently switch package managers.
2. Ensure the installed nginx image and its filesystem are compatible with aarch64 and the required unprivileged UID/port behavior.
3. Add an nginx configuration for Astro/Starlight deep links, static assets, ACME challenges, and later TLS termination. The current image does not expose HTTPS on 8443 merely because Compose maps that port.
4. Prefer the user’s planned bind mount under `$HOME/containers/video-bibliographer/certbot-certs` for certificate persistence, but do not assume its ownership or permissions. The container’s unprivileged nginx user (commonly UID 101 in this image) should only receive read access to certificates if nginx is later configured for TLS; Certbot should write certificates through a separate controlled path.
5. Add `.env.example` and keep the real server `.env` ignored. Do not place an AI key in a static-site container environment unless a future server-side service actually consumes it.
6. Treat Certbot as a deliberate second deployment step. First prove HTTP serving and ACME challenge routing; then request certificates; then add HTTPS/reload handling.

## Step-by-step implementation plan

### Task 1: Establish repository safety and inspect the app

**Objective:** Protect secrets and document the current project before changing application behavior.

**Files:**
- Modify: `.gitignore`, `README.md`.
- Read: `PROJECT_OUTLINE.xml`, `AGENTS.md`, `package.json`, `astro.config.mjs`, `src/content.config.ts`.
- Create: `.env.example`.

**Steps:**
1. Add ignores for `.env.*` with an explicit exception only for `.env.example`, certificate directories, generated output, `.astro/`, TypeDoc output if untracked, and local bibliography artifacts.
2. Confirm no key files, certificate files, or generated output are tracked or staged.
3. Document pnpm-only commands, YouTube-only scope, the deferred transcript functionality, and OCI deployment assumptions.
4. Run `git status --short --branch` and a secret-pattern scan over tracked/worktree text; expected: no API key values or private keys.
5. Initialize the local Git repository as `youtube-video-bibliographer` if it is not already initialized, create the initial protected baseline commit, and tag the first usable baseline `0.1.0` only after the user’s existing changes and secret scan are reviewed. Preserve existing user modifications.

### Task 2: Make the starter run in development and build mode

**Objective:** Replace placeholder Starlight content with a minimal product shell and prove it works before adding advanced features.

**Files:**
- Modify: `astro.config.mjs`, `src/content/docs/index.mdx`, `src/content/docs/guides/example.md`, `src/content/docs/reference/example.md`.
- Create: `src/styles/global.css`, `src/components/VideoUrlForm.astro`, `src/components/ScopeNotice.astro`.
- Test: `tests/ui/site-shell.test.ts`.

**Steps:**
1. Write failing tests for the product title, YouTube URL form, explicit transcript limitation, accessible labels, and absence of starter copy.
2. Run the focused test and verify it fails for the expected missing product elements.
3. Replace starter navigation/hero content with the Video Bibliographer identity, URL-only form, workflow explanation, and clear “transcript service not yet connected” status.
4. Add Tailwind/daisyUI styling using accessible semantic colors and reduced-motion-safe transitions.
5. Add TSDoc to any exported TypeScript helpers introduced by the shell.
6. Run `pnpm install --frozen-lockfile`, `pnpm dev`, and exercise the home page manually in the browser. Verify keyboard navigation and form validation.
7. Run `pnpm check` and `pnpm build`; expected: successful type check and static build.
8. Commit as `feat: create video bibliographer site shell`; tag the verified shell milestone as `0.2.0` only after the full checks pass.

### Task 3: Add typed bibliography data and TypeDoc

**Objective:** Establish the documented data model needed for citations, confidence, sources, timeline entries, and future generated output.

**Files:**
- Modify: `package.json`, `tsconfig.json`.
- Create: `typedoc.json`, `src/lib/bibliography/schema.ts`, `src/lib/bibliography/types.ts`, `src/lib/bibliography/timeline.ts`.
- Test: `tests/bibliography/schema.test.ts`, `tests/bibliography/timeline.test.ts`.

**Steps:**
1. Add the smallest required testing and TypeDoc dependencies using pnpm, preserving the lockfile.
2. Write failing tests for confidence values in `[0, 1]`, chronological ordering, timestamp formatting, safe 96-character timeline labels, source URL validation, and uncertainty disclaimers.
3. Implement Zod schemas and inferred TypeScript types with TSDoc on every public declaration.
4. Implement deterministic timeline conversion and an accessible text fallback representation.
5. Add `check`, `typecheck`, `test`, and `typedoc` scripts.
6. Run `pnpm test`, `pnpm check`, `pnpm typecheck`, and `pnpm typedoc`; expected: tests pass and TypeDoc generates without missing-comment warnings.
7. Commit as `feat: add typed bibliography domain model`; tag the verified typed-domain milestone as `0.3.0`.

### Task 4: Render sample bibliography UI

**Objective:** Demonstrate the intended historical-reference browsing experience without requiring a live transcript or AI provider.

**Files:**
- Create: `src/data/sample-bibliography.ts`, `src/components/ReferenceTimeline.astro`, `src/components/CitationCard.astro`, `src/pages/bibliographies/sample.astro`.
- Modify: `src/content/docs/index.mdx`.
- Test: `tests/ui/sample-bibliography.test.ts`.

**Steps:**
1. Write a failing test for timeline-first ordering, source links, confidence display, synopsis length, thumbnail alt text, and illustrative-image labeling.
2. Create a small, clearly labeled fixture dataset; do not imply that it came from an actual analyzed video.
3. Render the D2 timeline if package compatibility is confirmed; otherwise render a typed accessible timeline component and record D2 integration as a blocked compatibility item rather than inventing configuration.
4. Add case-by-case thumbnail metadata fields supporting archival, public-domain, attributed, and fantasy reconstruction categories.
5. Rotate several reveal effects deterministically by citation id and disable/reduce them under `prefers-reduced-motion`.
6. Run browser smoke checks plus `pnpm check`, `pnpm test`, and `pnpm build`.
7. Commit as `feat: add sample citation browsing experience`; tag the verified sample-UI milestone as `0.4.0`.

### Task 5: Correct and harden the OCI container scaffold

**Objective:** Build the static `dist/` site into an ARM-compatible nginx image that runs without root and supports deep links and ACME challenges.

**Files:**
- Modify: `Dockerfile`, `docker-compose.yml`, `.gitignore`, `README.md`.
- Create/modify: `nginx/default.conf`, `.dockerignore`.
- Test: `tests/deployment/static-smoke.test.ts`.

**Steps:**
1. Write failing smoke-test expectations for `/`, `/bibliographies/sample/`, static assets, and `/.well-known/acme-challenge/`.
2. Replace npm-based builder commands with pnpm lockfile-respecting commands and select a multi-architecture base image.
3. Configure nginx for unprivileged operation, static cache headers, SPA-like/Starlight deep-link fallback where appropriate, and ACME challenge files.
4. Define Compose bind mounts under `/home/avery/containers/video-bibliographer`, including a clearly documented certificate directory and an ACME webroot directory. Avoid assuming named volumes survive the requested deployment layout.
5. Ensure the container process runs as the unprivileged nginx user and document UID/GID ownership checks. Do not recursively chown certificate material from inside the web container; use host-side ownership/ACLs and read-only mounts where possible.
6. Once local Astro checks pass, use the OCI VM for the authoritative image build and runtime test: transfer the validated build context, run `podman compose config`, then `podman compose build` and `podman compose up -d` only after inspecting the rendered config.
7. Verify representative routes with `curl` and inspect `podman ps`, logs, and container user identity. Expected: HTTP 200 for home/sample routes, no root process, and no secret in image layers.
8. Commit as `chore: harden OCI static container scaffold`; tag the verified container milestone as `0.5.0`.

### Task 6: Test locally with the actual dev server and production container

**Objective:** Verify the application in both development and production-like serving modes before remote deployment.

**Files:**
- Modify: `README.md` only if test findings require documentation.
- Test: `tests/ui/site-shell.test.ts`, `tests/ui/sample-bibliography.test.ts`, `tests/deployment/static-smoke.test.ts`.

**Steps:**
1. Start the Astro dev server and use Chrome Canary via the existing `chrome-canary-with-debugger` command if browser automation is needed.
2. Exercise URL validation, sample navigation, deep-link refresh, responsive layout, keyboard interaction, reduced motion, and source-link behavior.
3. Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm typedoc`, and `pnpm build`.
4. Do not require local Podman. Validate the production container remotely on OCI with Podman after local Astro checks; if a local container smoke test is useful, use an explicitly available Docker/OrbStack runtime only as a secondary check, never as the production authority.
5. Inspect the final diff and image contents for secrets, private keys, certificate material, accidental transcript claims, or server-only code shipped to the client.
6. Proceed to remote deployment only if all checks pass and the user has authorized the attempt. Commit any test/documentation corrections before deployment and tag the release candidate as `0.6.0`.

### Task 7: Deploy to OCI over SSH, only after local verification

**Objective:** Copy the validated deployment scaffold to the OCI VM and bring up the static site as user `avery`.

**Files on remote host:**
- `/home/avery/containers/video-bibliographer/docker-compose.yml`
- `/home/avery/containers/video-bibliographer/.env`
- `/home/avery/containers/video-bibliographer/certbot-certs/`
- `/home/avery/containers/video-bibliographer/web-root/`
- image/build context or a registry image, depending on the selected transfer approach.

**Required user-provided/confirmed inputs:**
- Explicit authorization to SSH/deploy.
- Confirmation that `avery@oci-amp212.tail78ee63.ts.net` resolves and is reachable from this Mac.
- Remote deployment directory confirmation.
- Whether to transfer source/build remotely or build locally and transfer the image/archive.
- Desired HTTP/HTTPS exposure and whether an existing reverse proxy occupies ports 80/443.
- Confirmation of the Certbot registration email and whether DNS for `averyfreeman.com` remains pointed at this VM.

**Steps:**
1. Run a read-only SSH preflight: identity, OS/architecture, Podman version, `podman compose` availability, port listeners, firewall state, and directory permissions. Never print secret contents.
2. Create the remote directory as `avery` and set host ownership deliberately; do not use root or privileged containers.
3. Transfer the validated files/image, create the ignored `.env` from the agreed values, and run `podman compose config` before starting.
4. Start only the HTTP service first and verify `http://averyfreeman.com/`, the sample deep link, and ACME challenge routing.
5. Confirm host OCI security rules and Oracle Linux firewall permit the chosen port if requests fail.
6. Only after HTTP works, run Certbot with the webroot mount. Verify certificate files and permissions without exposing private key contents.
7. Add TLS nginx configuration and reload/recreate safely; ensure UID 101 can read certificate files while Certbot retains write ownership. Prefer group-readable certificate directories or a controlled copy/read-only mount over container-side recursive chown.
8. Verify HTTPS, renewal dry-run strategy, container restart behavior, logs, and no root process.
9. Commit deployment documentation locally if authorized; do not commit `.env`, certificates, private keys, or runtime logs. Tag the successfully verified OCI deployment milestone as `0.7.0` only after public HTTP/HTTPS checks pass.

## Deferred work file

Create `.hermes/NEXT_STEPS.md` during implementation with:

- Transcript API options and selection criteria.
- A future transcript copy/paste textarea option.
- A server-side AI gateway boundary that keeps API keys out of static client assets.
- Dynamic bibliography generation and durable storage options for OCI.
- Thumbnail provenance and case-by-case fantasy reconstruction workflow.

## Validation commands

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm typecheck
pnpm test
pnpm typedoc
pnpm build
# On the OCI VM, not on the Mac:
podman compose config
podman compose build
podman compose up -d
curl -fsS http://127.0.0.1/
```

Expected outcome: the dev server works, static production build succeeds, TypeDoc is generated, the production container is built and tested with Podman on the matching aarch64 OCI host, and remote public exposure is attempted only after those facts are verified.

## Risks and tradeoffs

- **YouTube URL-only scope:** Without a transcript API, analysis must be represented as unavailable/deferred rather than fabricated.
- **Static nginx limitation:** No AI API key belongs in the static image. A future backend is required for analysis.
- **UID 101 certificates:** Do not solve this with a broad recursive chown inside the web container. Use host-side ownership/groups and read-only certificate mounts.
- **ACME and HTTPS:** Port 80 must serve the challenge before certificate issuance; HTTPS configuration is a separate verified step.
- **Architecture:** Build for aarch64 or use a multi-platform image. Verify the actual image manifest before remote deployment.
- **OCI networking:** DNS, OCI security lists/NSGs, and Oracle Linux firewall must all allow the selected ports.
- **Commits and GitHub:** Do not create or publish the GitHub repository until `.gitignore` and secret scanning are complete and the user explicitly requests that workflow.
- **Versioning:** Use small conventional commits at task milestones, but create tags only after the associated validation succeeds. Start at `0.1.0`; do not invent a release tag for a failed or incomplete milestone.

## Handoff

Plan updated for the dev-first OCI workflow and saved here. The next execution phase should begin with the local application shell and `pnpm` checks—not SSH. Remote deployment should wait until the dev server, production build, and local Podman container are verified.

Before SSH deployment, provide explicit authorization plus confirmation of the remote path, HTTP/HTTPS port arrangement, and whether to build remotely or transfer a locally built image.

The local repository should be named `youtube-video-bibliographer`, with regular milestone commits and tags beginning at `0.1.0`.

# Video Bibliographer Objective-Driven Codex Orchestration Plan

> **For Hermes:** Execute objective-by-objective. Codex implements; Hermes independently verifies and alone updates `OBJECTIVES.md` to `COMPLETE`.

**Goal:** Complete the 11 objectives in `OBJECTIVES.md` within the product and retention requirements of `PROJECT_OUTLINE.xml`, using Codex through an ACP-capable client as the bounded implementation worker and Hermes as the orchestrator, reviewer, test runner, and evidence gate.

**Architecture:** Keep Astro/Starlight as the static browsing surface, strict TypeScript/Zod as the work-product contract, and transcript/AI/filesystem work in server-only modules or the CLI workflow. Implement one objective per Codex session, preserve the dirty worktree, require an `IMPLEMENTED_PENDING_VERIFICATION` handoff, inspect every diff, and run independent checks before recording completion or creating a milestone tag.

**Tech stack:** Astro 7, Starlight, pnpm, strict TypeScript, Zod, Vitest, TypeDoc/TSDoc, Playwright or equivalent browser automation, `yt-dlp`, Gemini Flash-class structured generation, Markdown/filesystem persistence, Tailwind/daisyUI styling, D2 or an accessible fallback, unprivileged nginx, Podman Compose on OCI, Codex ACP.

---

## Planning-only boundary

This plan does not implement source changes, start Codex, commit, tag, publish, SSH, request certificates, or deploy. Execution begins only in a separate implementation turn. Public GitHub/Jules/Render work and OCI exposure require their objective-specific approval gates.

## Reviewed inputs

- `AGENTS.md` currently only points to `PROJECT_OUTLINE.xml`; it is insufficient as the full Codex operating contract.
- `OBJECTIVES.md` is already the canonical tracker and defines 11 objectives plus the required Codex handoff.
- `PROJECT_OUTLINE.xml` requires exhaustive historical-reference detection, confidence scores, source URLs, no-more-than-two-paragraph significance summaries, timeline ordering, thumbnails, a D2 timeline, and exact local Markdown retention under a timestamp/title folder containing `.thumbs.db`.
- Existing implementation includes the Starlight shell, sample page, bibliography schema/renderer, `yt-dlp` transcript retrieval, Gemini analysis, a CLI persistence path, Vitest tests, TypeDoc config, container scaffolding, and generated build/docs artifacts.
- The repository is dirty. Existing user work must not be reset, discarded, mass-formatted, or folded into unrelated commits.

## Connector and prerequisite assessment

### Ready

- `codex-acp` exists and is executable at `/Users/avery/.nix-profile/bin/codex-acp` (package `codex-acp-0.13.0`).
- Codex authentication and configuration files are present at `~/.codex/auth.json` and `~/.codex/config.toml`; their contents were not read.
- Required local foundations are present: Node `v24.19.0`, pnpm `11.21.0`, Git, `yt-dlp`, Docker, `gh`, and SSH.

### Not ready under the exact requested connector contract

- This Hermes session does **not** expose a first-class `codex-acp` tool/connector.
- The ordinary `codex` CLI is not on this session’s PATH.
- `codex-acp` is an ACP-speaking agent executable, not a normal `codex exec` replacement; launching it without an ACP client is not a usable orchestration channel.

**Execution gate:** Before delegating Objective 1, connect an ACP-capable client to the discovered `codex-acp` executable or install/expose the ordinary Codex CLI and explicitly approve that fallback. Do not pretend terminal access to the ACP binary is equivalent to an operational connector.

### Objective-specific gaps

- `d2` is not installed locally. Objective 7 must install/validate a compatible D2 integration or implement the explicitly permitted accessible typed fallback and document the incompatibility.
- Podman is not installed locally. Objective 9 must use the designated OCI aarch64 Podman host as the authoritative container environment after read-only connectivity/preflight verification.
- Objectives 5 and 8 require live provider access. Use server/runtime-only credentials and never inspect or print key values.
- Objectives 10 and 11 require explicit authorization immediately before public deployment, certificate issuance, repository publication, Jules access, or Render deployment.

## Orchestrator operating protocol

For every objective:

1. Read the current objective, dependencies, relevant source/tests, Git status, and any pre-existing diff.
2. Set or retain `IN_PROGRESS`; never mark completion before evidence exists.
3. Launch one bounded Codex ACP session with:
   - the exact objective ID, goal, acceptance criteria, and evidence requirements;
   - relevant paths and current implementation facts;
   - prohibited scope and secret/deployment boundaries;
   - TDD requirements and exact expected handoff format.
4. Require Codex to return:
   - `OBJECTIVE: <ID>`
   - `STATUS: IMPLEMENTED_PENDING_VERIFICATION | BLOCKED`
   - `FILES:`
   - `TESTS:`
   - `USER_TEST_URL:`
   - `LIMITATIONS:`
5. Inspect the resulting diff. Reject unrelated edits, weakened acceptance criteria, generated-secret leakage, fabricated test claims, and destructive worktree operations.
6. Run the objective’s tests independently. For UI work, start the real app and perform browser checks rather than relying only on source-string tests.
7. Record reproducible evidence in `OBJECTIVES.md`. Only then set `COMPLETE` and create the objective’s conventional commit/tag when specified.
8. If verification fails, leave `IN_PROGRESS` or set `BLOCKED`, record the concrete cause, and issue a narrow Codex repair task.

## Objective execution sequence

### Objective 0: Make orchestration safe and operational

**Purpose:** Satisfy the connector prerequisite and strengthen project-local agent rules before implementation delegation.

**Files:**
- Modify: `AGENTS.md`
- Preserve: `OBJECTIVES.md`, `PROJECT_OUTLINE.xml`

**Steps:**
1. Attach an ACP client to `/Users/avery/.nix-profile/bin/codex-acp`, then perform a read-only handshake/session smoke test in this repository.
2. If ACP integration cannot be exposed, stop and request approval to use an installed ordinary `codex` CLI fallback; do not silently change harnesses.
3. Expand `AGENTS.md` with the objective ledger rules, pnpm-only/TDD/TSDoc requirements, dirty-worktree protection, secret and SSRF boundaries, handoff format, independent verification rule, milestone policy, and external deployment prohibitions.
4. Add a deterministic project-policy test or validation script that checks the objective IDs and required agent contract.
5. Run `git diff --check` and inspect the exact policy diff.

**Verification:** ACP read-only response is received through the actual client; agent-contract validation passes; no unrelated file changed.

### Objective 1: Protected repository baseline (`0.1.0`)

**Likely files:** `.gitignore`, `.dockerignore`, `.env.example`, `README.md`, package/lockfile only if reproducibility fixes are required.

**Steps:**
1. Inventory tracked, staged, ignored, and untracked files without cleaning them.
2. Add/verify ignore rules for `.env*` except `.env.example`, certificates/private keys, `dist/`, `.astro/`, TypeDoc output if generated, bibliography work products, thumbnail stores, reports, and local agent state.
3. Add `.dockerignore` so secrets, Git metadata, outputs, reports, and local work products cannot enter build context.
4. Run a redacted secret-pattern scan over tracked/staged/worktree text; report file/line and pattern class only, never matched secret values.
5. Run `pnpm install --frozen-lockfile` and the baseline checks.
6. Verify relevant Git status is understood rather than falsely claiming a globally clean tree.
7. Commit only reviewed baseline files and tag `0.1.0` after evidence.

**Independent verification:** frozen install succeeds; secret scan has no unresolved findings; ignored sensitive/generated paths are not tracked; `git diff --check` passes.

### Objective 2: Accessible Astro site shell (`0.2.0`)

**Likely files:** `astro.config.mjs`, `src/content/docs/index.mdx`, `src/styles/global.css`, dedicated form component/test files, Playwright configuration/tests.

**Steps:**
1. Add browser tests for accessible label/name, required URL input, submit behavior, keyboard operation, query-parameter URLs, product copy, dark-mode contrast/background, and actual port binding.
2. Replace the demo-only form action with honest behavior for the current implemented workflow; do not imply browser-side live analysis unless a server boundary exists.
3. Remove stale `SITE_URL=http://localhost:5000`/Astro `site` assumptions or reconcile them with the required default `4321` behavior.
4. Run `pnpm check`, `pnpm test`, `pnpm build`, and Playwright/equivalent browser tests.
5. Leave a verified dev server running at the actual reported URL when execution requests user testing.

**Independent verification:** page and deep links return success; valid copied YouTube URLs with `&t=` are accepted; keyboard focus/submission work; dark mode is readable; actual bind address/port is recorded.

### Objective 3: Typed bibliography contract and TypeDoc (`0.3.0`)

**Likely files:** `src/lib/bibliography/{types,schema,analysis,markdown,storage}.ts`, `tests/bibliography*.test.ts`, `typedoc.json`, `tsconfig.json`.

**Steps:**
1. Add failing tests for confidence bounds, timestamp syntax and seconds/display consistency, URL constraints, 96-character timeline labels, two-paragraph synopsis limit, deterministic chronology, thumbnail provenance fields, and processing metadata.
2. Separate validation, Markdown rendering, and filesystem storage; exported declarations receive complete TSDoc.
3. Remove `skipErrorChecking` unless a verified dependency issue requires it; do not suppress TypeDoc correctness globally.
4. Run focused Vitest, `pnpm check`, `pnpm typecheck`, and `pnpm typedoc`.

**Independent verification:** invalid records are rejected for the right reason; order is stable; TypeDoc completes without hidden project errors.

### Objective 4: YouTube transcript acquisition (`0.4.0`)

**Likely files:** refactor `src/lib/youtube.ts` into URL/provider/error modules; focused unit/integration tests; README/methodology notes.

**Steps:**
1. Test watch, `youtu.be`, embed, shorts, live, start-time, malformed, non-YouTube, deceptive-host, playlist-only, private, captionless, rate-limited, timeout, and empty-track cases.
2. Restrict accepted hosts and validate video-ID shape; do not use `hostname.endsWith('youtube.com')` without a label boundary.
3. Add bounded subprocess/network timeouts, output limits, injectable execution/fetch seams, and typed error classification.
4. Run deterministic tests, then one controlled public-video live smoke test.

**Independent verification:** real cues and timestamps are inspected when available; provider limitations are documented honestly; arbitrary URL fetching is impossible.

### Objective 5: Gemini bibliography analysis (`0.5.0`)

**Likely files:** provider-neutral analysis gateway/service/prompt/verification modules, `src/lib/gemini.ts`, analysis tests, CLI integration, environment documentation.

**Steps:**
1. Add fake-provider tests for structured success, malformed JSON, schema violations, unsupported model, HTTP errors, empty candidates, suspicious/fabricated-looking sources, uncertainty, and chronological sorting.
2. Resolve the model at runtime/configuration and verify availability before using it; avoid a stale hard-coded model default.
3. Preserve transcript timestamps, provider/model notes, confidence, source-verification state, thumbnail metadata, and uncertainty.
4. Add URL/source verification as evidence status, not as a claim that URL syntax proves historical authenticity.
5. Run a key-safe model smoke test and a real transcript-to-validated-bibliography run.

**Independent verification:** inspect actual validated output and redacted processing metadata; scan static output/client code for secret leakage.

### Objective 6: Exact Markdown persistence (`0.5.1`)

**Likely files:** `src/lib/bibliography/storage.ts`, `markdown.ts`, `scripts/analyze-youtube.ts`, filesystem tests.

**Steps:**
1. Add fixture tests for `YYYY-MM-DD_HH_MM_SS_<32-char-title>`, matching Markdown filename, local `.thumbs.db/`, relative image links, exact rendered Markdown, and collision/no-overwrite behavior.
2. Use exclusive creation or deterministic collision handling; current recursive directory creation plus ordinary `writeFile` must not silently overwrite.
3. Persist the exact Markdown returned/displayed, not a separately regenerated variant.
4. Save thumbnail files and provenance metadata when assets exist; do not claim thumbnails before files exist.
5. Run fixture and one real-workflow output inspection.

**Independent verification:** read the saved file, compare bytes to rendered output, resolve local thumbnail links, and prove a repeated name cannot overwrite prior work.

### Objective 7: Browser-visible bibliography browsing (`0.6.0`)

**Likely files:** sample/generated content route(s), citation/timeline components, styles, Starlight/D2 integration, Playwright tests.

**Steps:**
1. Choose and document one path: compatible Starlight D2 integration after installing/validating it, or the objective-permitted typed accessible fallback if incompatible.
2. Render timeline first, citations in video order, source links, confidence/uncertainty, synopsis limits, image alt text, and archival/reconstruction labels.
3. Use deterministic rotating reveal effects triggered by viewport entry; disable motion under `prefers-reduced-motion`.
4. Add Playwright checks for home/sample/deep-link routes, keyboard navigation, dark/light themes, reduced motion, source links, and responsive layouts.

**Independent verification:** exercise the live browser surface and capture the user-testable URL; do not accept static source assertions as the only UI evidence.

### Objective 8: Thumbnail generation/comparison

**Likely files:** thumbnail provider/provenance modules, `.thumbs.db` assets in a controlled fixture/output, comparison documentation, tests.

**Steps:**
1. Define an injectable provider contract and metadata record: provider, model, prompt, source URL/license when applicable, generated time, evidence-vs-illustration label, local path, and alt text.
2. Prefer archival/source images where lawful and useful; clearly label generated/reconstructed images.
3. Produce the same bounded comparison prompt with OpenAI image generation and Nano Banana 2 Flash only if each provider is actually available.
4. Save successful assets locally, verify image decodability and Markdown links, and document only observed results.
5. If one provider is unavailable, record a blocker rather than fabricate a comparison.

**Independent verification:** inspect actual image files/metadata and browser rendering; compare only successfully generated artifacts.

### Objective 9: OCI Podman static container (`0.7.0`)

**Likely files:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `nginx/default.conf`, deployment smoke tests/docs.

**Steps:**
1. Obtain current explicit permission for remote read-only preflight, then verify SSH target, architecture, rootless Podman/Compose, paths, ports, SELinux/firewall context, and existing containers without changing them.
2. Replace npm builder commands with Corepack/pnpm frozen-lockfile installation and cache-friendly copy order.
3. Configure unprivileged nginx for `/`, deep links, assets, and ACME webroot; do not map a nonexistent TLS listener.
4. Use `/home/avery/containers/video-bibliographer` and server-local secret/config files; avoid broad recursive `chown` for certificates.
5. Run `podman compose config`, build on aarch64, start rootless, and verify routes, architecture, UID, restart behavior, and mounted permissions.

**Independent verification:** real remote build/run logs and HTTP checks; container process is non-root; deep links and ACME fixture work.

### Objective 10: OCI HTTPS deployment (`0.8.0`)

**Approval gate:** Ask for explicit deployment/certificate authorization immediately before any network/firewall/DNS/container mutation.

**Steps:**
1. Verify DNS, OCI ingress, Oracle Linux firewall, port ownership, and current HTTP behavior.
2. Prove ACME challenge serving over HTTP before invoking Certbot.
3. Request the certificate with private material never printed; configure controlled read-only certificate access for nginx UID 101.
4. Enable HTTPS, redirect policy, health checks, and restart persistence.
5. Verify from outside the host with `curl` and browser automation, including certificate hostname/chain/expiry metadata without exposing keys.

**Independent verification:** public HTTP/HTTPS routes pass, restart survives, and exact evidence is recorded.

### Objective 11: Deferred GitHub/Jules/Render workflow

**Approval gate:** Ask for explicit authorization before public repository creation, push, Jules access changes, or Render deployment.

**Steps:**
1. Re-run tracked/staged/history secret scans and review the complete publication diff.
2. Create/push `youtube-video-bibliographer` only after approval.
3. Use the existing Jules MCP connector for a bounded independent review/test session; verify its outputs rather than self-certification.
4. Authorize and verify Render deployment through the intended connector only when available.
5. Record GitHub URL, Jules session/status, exact checks, and Render deployment ID/URL.

**Independent verification:** fetch the public repository and deployed routes independently; do not claim completion from an agent report alone.

## Cross-objective test matrix

Run the narrowest relevant checks after each objective and the full matrix at milestones:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm typecheck
pnpm typedoc
pnpm build
```

Add and run Playwright once introduced. For CLI/integration work, use deterministic fixtures first, followed by explicitly bounded live smoke tests. For deployment, treat the OCI aarch64 rootless Podman host as authoritative.

## Commit and evidence policy

- Use conventional commits at meaningful verified boundaries; never use Codex completion text as proof.
- Preserve existing uncommitted user changes and stage only reviewed files.
- Create tags only after the associated objective is independently `COMPLETE`: `0.1.0`, `0.2.0`, `0.3.0`, `0.4.0`, `0.5.0`, `0.5.1`, `0.6.0`, `0.7.0`, `0.8.0`.
- Record command, date, URL/path, and limitations in the completion log.
- Do not weaken acceptance criteria merely to obtain a green status.

## Main risks and practical tradeoffs

- **ACP availability:** The requested executable exists, but the current session lacks an ACP client tool. This is the first hard gate.
- **Dirty worktree:** It contains substantial pre-existing work. Objective commits must be surgical; destructive cleanup is prohibited.
- **Static/dynamic mismatch:** nginx can browse generated output but cannot run transcript/AI analysis. Keep the live workflow server-side/CLI unless a separate backend is deliberately added.
- **Source authenticity:** A reachable URL is not proof of an original historical source. Preserve verification state and uncertainty.
- **Unofficial transcript path:** `yt-dlp` can be rate-limited or blocked. Classify errors and document the provider limitation.
- **D2 compatibility:** Installing D2 solely to satisfy appearance is a bad idea if the Starlight integration is incompatible. Use the accepted accessible fallback and record why.
- **External side effects:** Certificates, public repositories, Jules/Render, and production deployment remain gated even though scaffolding exists.

## Definition of done

The project is complete only when all objective statuses are evidence-backed; all local checks pass; UI objectives have independent browser evidence and testable URLs; real workflow output is persisted exactly with valid local assets; container/deployment claims come from the actual OCI Podman host; no secrets are exposed; and publication/deployment objectives have explicit authorization plus independently verified external handles.

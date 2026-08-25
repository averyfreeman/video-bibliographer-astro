---
title: Configuration
description: Runtime configuration and security boundaries.
---

# Configuration

The development server listens on `0.0.0.0:4321` by default. This makes it reachable from a phone over the tailnet when the host firewall permits it. Astro chooses the next available port if 4321 is already occupied.

## Secret handling

AI credentials belong in a server-side environment only. Never prefix them with `PUBLIC_`, place them in `src/`, or commit a real `.env` file. The static nginx deployment does not execute analysis; the CLI is the dynamic boundary.

## OpenAI analysis CLI

The end-to-end prototype is run with `pnpm analyze:youtube <youtube-url>`. It reads `OPENAI_API_KEY` only from the runtime process environment and uses `gpt-4o-mini` unless `OPENAI_MODEL` is set. `OPENAI_BASE_URL` is optional for an approved OpenAI-compatible endpoint. The CLI retrieves validated YouTube captions, bounds timestamped chunks, requests structured output through the typed OpenAI provider, validates and deduplicates candidates, and writes the exact rendered Markdown work product.

## Output

Work products use a timestamped title folder and a `.thumbs.db` subfolder for local thumbnail files. See the project-level `.hermes/NEXT_STEPS.md` for deferred transcript and backend work.

## Container

The OCI VM is the authoritative Podman/aarch64 environment. The Mac development workflow validates Astro, TypeScript, browser behavior, and the static build first; container validation occurs remotely on OCI.

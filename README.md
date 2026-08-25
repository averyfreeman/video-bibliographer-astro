# YouTube Video Bibliographer

An Astro Starlight workbench for tracing historical quotes, people, events, and ideas in spoken video.

## Development

This project uses pnpm:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The dev server binds to `0.0.0.0` and uses Astro’s default port `4321`, making it reachable from another device on the same tailnet at `http://<mac-tailnet-ip>:4321`. If that port is occupied, Astro chooses the next available port; check the terminal output.

Validation commands:

```bash
pnpm check
pnpm typecheck
pnpm test
pnpm typedoc
pnpm build
```

## Scope

The current interface accepts YouTube URLs and presents a clearly labeled sample work product. Transcript retrieval, source verification, AI extraction, image generation, and Markdown persistence are being connected as server-side/agentic workflow components. A transcript copy/paste field is deferred.

AI credentials belong in runtime environment variables only. Never use `PUBLIC_` variables for secrets or commit `.env` files.

## Deployment

The static `dist/` site is intended for an unprivileged nginx container built and tested with Podman on the Oracle Linux aarch64 OCI host. The Mac does not require local Podman. See `.hermes/plans/` and `.hermes/NEXT_STEPS.md` for the deployment and deferred workflow notes.

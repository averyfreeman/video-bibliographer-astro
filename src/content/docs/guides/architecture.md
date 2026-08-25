---
title: Collaboration Architecture
description: How Hermes, worker agents, Kanban, artifacts, and verification collaborate.
---

# Collaboration Architecture

This project uses a durable, evidence-first workflow: Hermes receives an objective, a worker implements one bounded task, artifacts return to the project workspace, and Hermes independently verifies the result before the objective is completed.

## Information flow

```d2 pad=32 direction=right
user: {
  label: "User\nobjective + constraints"
  style.fill: "#063e3b"
  style.stroke: "#34d399"
}

orchestrator: {
  label: "Hermes orchestrator\nplan + acceptance gate"
  style.fill: "#063e3b"
  style.stroke: "#34d399"
}

rules: {
  label: "AGENTS.md\nOBJECTIVES.md\nactive plan"
  style.fill: "#4c1d95"
  style.stroke: "#a78bfa"
}

kanban: {
  label: "Kanban\nclaims + dependencies + status"
  style.fill: "#78350f"
  style.stroke: "#fbbf24"
}

worker: {
  label: "Worker profile\nCassius-Skidmax"
  style.fill: "#083344"
  style.stroke: "#22d3ee"
}

workspace: {
  label: "Project workspace\nsource + tests + docs"
  style.fill: "#083344"
  style.stroke: "#22d3ee"
}

artifacts: {
  label: "Evidence artifacts\ndiff · logs · reports · URLs"
  style.fill: "#0f172a"
  style.stroke: "#94a3b8"
}

verifier: {
  label: "Hermes verifier\nindependent checks"
  style.fill: "#063e3b"
  style.stroke: "#34d399"
}

review: {
  label: "Review decision\naccept or request changes"
  style.fill: "#881337"
  style.stroke: "#fb7185"
}

mcp: {
  label: "Optional MCP observability\nread-only inspection"
  style.fill: "#881337"
  style.stroke: "#fb7185"
}

user -> orchestrator: "objective"
orchestrator -> rules: "1. read context"
rules -> kanban: "2. create bounded card"
kanban -> worker: "3. atomic claim"
worker -> workspace: "4. implement"
workspace -> artifacts: "5. tests + artifacts"
artifacts -> verifier: "6. inspect + rerun"
verifier -> review: "7. evidence decision"
review -> kanban: "8a. complete / reopen"
review -> worker: "8b. repair request"
worker -> artifacts: "9. revised evidence"
artifacts -> verifier: "10. verify again"
verifier -> orchestrator: "11. verified result"
mcp -> artifacts: "observe"
artifacts -> mcp: "read-only state"
```

The arrows describe ownership of the next action. A worker produces implementation and evidence; the orchestrator owns acceptance and objective status.

## The mechanical loop

1. Read `PROJECT_OUTLINE.xml`, `OBJECTIVES.md`, the active plan, `AGENTS.md`, and relevant code/tests.
2. Write down the objective ID, non-goals, acceptance criteria, evidence requirements, and approval gates.
3. Create one parent Kanban card with an idempotency key and the project workspace.
4. Create bounded child cards with exact files, tests, artifacts, and handoff format.
5. Link dependencies so prerequisite cards finish before dependent cards become ready.
6. Assign the implementation card to a worker profile.
7. Let the worker claim the card atomically.
8. Have the worker preserve existing changes, use `pnpm`, follow TDD, and maintain explicit TypeScript/TSDoc.
9. Require the worker to report `IMPLEMENTED_PENDING_VERIFICATION` or `BLOCKED`, never `COMPLETE`.
10. Attach redacted logs, reports, generated files, screenshots, and user-test URLs to the card.
11. Move the card to review.
12. Rerun the relevant checks independently and inspect the real UI/API/CLI behavior.
13. Accept only when implementation, automated checks, and independent verification all pass.
14. Otherwise request changes with the exact failure and repeat the worker/verification loop.
15. Complete the parent only after every required child is verified.

## What MCP does here

MCP is an optional observability and operator layer. It can expose read-only tools for inspecting Kanban state, transcript chunks, intermediate candidates, validation results, and persisted work products. It does not replace the Kanban board, the project workspace, or Hermes’s independent verification step.

For production transcript processing, prefer a typed library or REST boundary. For model/operator collaboration, MCP can make intermediate state inspectable without forcing every artifact into one model context window.

## Current durable board

The initial board is `video-bibliographer-collaboration`.

The first task graph is:

- `t_92c784fc` — Define durable orchestrator-worker collaboration workflow
- `t_26335707` — Read project rules and establish task contract
- `t_b8a9a6f0` — Implement one bounded objective and produce artifacts
- `t_8edde0c6` — Independently verify worker output and record evidence
- `t_1acdda26` — Review, request changes, and close the loop

The dependency chain is: read rules → implement → verify → review/close.

The current highest-priority implementation card is `t_3d443e9f`: build the
bounded YouTube-to-OpenAI bibliography prototype. Its intended tracer-bullet
path is transcript retrieval, timestamp-preserving chunking, OpenAI structured
extraction, candidate aggregation, strict validation, and exact Markdown
persistence.

For the command-by-command operating procedure, see [the Kanban collaboration playbook](/guides/kanban-collaboration-playbook/).

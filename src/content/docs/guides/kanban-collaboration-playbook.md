---
title: Kanban Collaboration Playbook
description: Mechanical instructions for orchestrator and worker collaboration.
---

# Kanban Collaboration Playbook

This is the repeatable procedure for moving work between Hermes, worker profiles, the project workspace, and independent verification.

## Do this, then that

1. Receive the objective and write down its goal, non-goals, acceptance criteria, evidence requirements, approval gates, and expected artifacts.
2. Read `PROJECT_OUTLINE.xml`, `OBJECTIVES.md`, the active plan, `AGENTS.md`, and relevant source/tests.
3. Create one parent Kanban card with a durable title, complete body, project workspace, priority, and idempotency key.
4. Create bounded child cards. Assign implementation to `cassius-skidmax` when appropriate and assign verification to the orchestrator/default profile.
5. Link dependencies so prerequisites are completed before dependent cards become ready.
6. Claim the task atomically; never edit another worker’s active task.
7. Implement only the card scope. Preserve user changes, use `pnpm`, follow TDD, maintain explicit TypeScript/TSDoc, and keep secrets out of source, logs, prompts, and artifacts.
8. Produce a handoff with changed files, exact commands, real results, artifact paths, a user-test URL or command, and limitations. Use `IMPLEMENTED_PENDING_VERIFICATION` or `BLOCKED`, never `COMPLETE`.
9. Attach redacted evidence to the card.
10. Move the card to review.
11. Run independent tests and inspect the real UI/API/CLI behavior. Do not trust worker claims alone.
12. Accept only when implementation, automated checks, and independent verification all pass.
13. Otherwise request changes with the exact failure and repeat the worker/verification loop.
14. Complete the parent only after every required child is verified.

## Handoff template

```text
OBJECTIVE: <objective or card ID>
STATUS: IMPLEMENTED_PENDING_VERIFICATION | BLOCKED
FILES:
- <path>
TESTS:
- `<exact command>` — <real result>
USER_TEST_URL: <URL or command, or —>
ARTIFACTS:
- <path or handle>
LIMITATIONS:
- <known limitation>
```

## Review template

```text
CARD: <task ID>
DECISION: ACCEPT | REQUEST_CHANGES | BLOCK
EVIDENCE:
- <command, URL, artifact, or diff observation>
FAILURES:
- <exact failure, or none>
NEXT_ACTION:
- <complete, reopen, or repair card>
```

## Safety gates

- Never hard-code or request secrets in a task. Use approved runtime environment variables only.
- Validate YouTube hosts and IDs before any provider call; never create an arbitrary URL-fetch or SSRF proxy.
- Never claim source authenticity from URL syntax alone.
- Never use MCP as an unbounded production fetch proxy. Use it for bounded, read-only observation.
- Never mark `OBJECTIVES.md` complete before independent verification.
- Never deploy, publish, SSH, request certificates, or use external accounts without explicit approval.

## Useful commands

```bash
hermes kanban boards list
hermes kanban boards switch video-bibliographer-collaboration
hermes kanban list --sort priority-desc
hermes kanban show <task-id>
hermes kanban context <task-id>
hermes kanban comment <task-id> "<redacted note>"
hermes kanban request-review <task-id>
hermes kanban request-changes <task-id> "<concrete failure>"
hermes kanban complete <task-id>
hermes kanban stats
```

The gateway’s embedded dispatcher picks up ready cards. Without a running gateway, cards remain ready and workers do not start automatically.

## Current board graph

- `t_92c784fc` — parent workflow card.
- `t_26335707` — read project rules and establish task contract.
- `t_b8a9a6f0` — implement one bounded objective and produce artifacts.
- `t_8edde0c6` — independently verify worker output and record evidence.
- `t_1acdda26` — review, request changes, and close the loop.

Dependency chain: read rules → implement → verify → review/close.

The next core-product card is `t_3d443e9f`, assigned to `cassius-skidmax`:
build the bounded YouTube-to-OpenAI bibliography prototype before spending
time on deployment or secondary polish.

See [Collaboration Architecture](/guides/architecture/) for the information-flow diagram.

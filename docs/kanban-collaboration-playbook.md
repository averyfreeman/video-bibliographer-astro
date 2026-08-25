# Mechanical Kanban Collaboration Playbook

This is the repeatable procedure for moving work between Hermes, worker profiles, the project workspace, and verification.

## Actors and artifacts

- **User:** supplies the objective, constraints, acceptance criteria, and approval gates.
- **Hermes orchestrator:** decomposes work, creates cards, assigns workers, reviews diffs, runs independent checks, and updates `OBJECTIVES.md`.
- **Worker profile:** claims one ready card, reads the supplied context, edits only the bounded scope, runs tests, and reports evidence.
- **Kanban:** durable coordination state: cards, dependencies, claims, assignees, attempts, comments, reviews, and terminal outcomes.
- **Project workspace:** source files, tests, plans, generated artifacts, and work-product paths.
- **Optional MCP observability:** read-only tools for inspecting task state, transcript chunks, intermediate candidates, validation results, or artifacts. It is not the production execution path.

## Do this, then that

1. **Receive the objective.** Write down the goal, non-goals, acceptance criteria, required evidence, approval gates, and expected artifacts.
2. **Read project context.** Read `PROJECT_OUTLINE.xml`, `OBJECTIVES.md`, the active plan, `AGENTS.md`, and relevant source/tests.
3. **Create one parent Kanban card.** Give it a durable title, complete body, project workspace, priority, and idempotency key.
4. **Create bounded child cards.** Assign each to a named worker or verifier. Keep one objective per card. Add exact files, tests, limits, and handoff format to the body.
5. **Link dependencies.** Use parent-to-child links so a worker cannot start before its prerequisites are ready.
6. **Assign the worker.** Use the named profile, normally `cassius-skidmax` for implementation. Pin `gpt-5.6-luna` only when that profile/runtime supports it; never silently substitute another model.
7. **Claim atomically.** The worker or dispatcher claims the ready card. Do not manually edit another worker’s active task.
8. **Implement only the card scope.** Preserve user changes, use `pnpm`, follow TDD, maintain explicit TypeScript types/TSDoc, and keep secrets out of source, logs, prompts, artifacts, and static output.
9. **Produce a handoff.** Include changed files, exact commands, real results, user-test URL or command, limitations, and artifact paths. State `IMPLEMENTED_PENDING_VERIFICATION` or `BLOCKED`; never `COMPLETE`.
10. **Attach evidence.** Attach logs, reports, screenshots, generated files, or links to the card. Prefer small redacted evidence files over huge logs.
11. **Move to review.** The worker requests review. Do not mark the implementation complete solely because the worker’s tests passed.
12. **Verify independently.** Hermes runs the exact checks again, inspects the diff, checks secret boundaries, exercises the real UI/API/CLI path, and validates saved artifacts.
13. **Decide.** If all acceptance criteria pass, complete the card and record evidence in `OBJECTIVES.md`. If not, request changes with the concrete failure and link the repair card.
14. **Repeat the loop.** Reopened work returns to the assigned worker, produces new evidence, and re-enters independent verification.
15. **Close the parent.** Only after every required child is verified should the parent card be completed. Commit/tag only when explicitly authorized and the milestone is independently verified.

## Worker handoff template

```text
OBJECTIVE: <objective or card ID>
STATUS: IMPLEMENTED_PENDING_VERIFICATION | BLOCKED
FILES:
- <absolute or repository-relative path>
TESTS:
- `<exact command>` — <real result>
USER_TEST_URL: <URL or command, or —>
ARTIFACTS:
- <path or handle>
LIMITATIONS:
- <known limitation>
```

## Review decision template

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

- Never hard-code or request secrets in a card. Use approved runtime environment variables only.
- Never let arbitrary user URLs reach a fetcher; normalize and validate YouTube hosts/IDs first.
- Never claim source authenticity from URL syntax alone.
- Never use an MCP server as an unbounded production fetch proxy.
- Never mark `OBJECTIVES.md` `COMPLETE` before independent verification.
- Never deploy, publish, SSH, request certificates, or use external accounts without explicit approval.

## Useful CLI sequence

```bash
hermes kanban boards list
hermes kanban boards switch video-bibliographer-collaboration
hermes kanban list --sort priority-desc
hermes kanban show <task-id>
hermes kanban context <task-id>
hermes kanban comment <task-id> "<redacted progress or review note>"
hermes kanban request-review <task-id>
hermes kanban request-changes <task-id> "<concrete failure and repair requirement>"
hermes kanban complete <task-id>
hermes kanban stats
```

The gateway’s embedded dispatcher picks up ready cards. Without a running gateway, cards remain ready and workers will not start automatically.

## Current board graph

- `t_92c784fc` — parent workflow card.
- `t_26335707` — read rules and establish the task contract.
- `t_b8a9a6f0` — implement one bounded objective and produce artifacts.
- `t_8edde0c6` — independently verify worker output and record evidence.
- `t_1acdda26` — review, request changes, and close the loop.

The child dependency chain is: read rules → implement → verify → review/close.

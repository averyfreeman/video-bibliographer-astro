# DHIS2 MCP Session Access Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Determine whether the newly added `dhis2-mcp-server` is available to the current Hermes session and establish the smallest recovery path if it is not.

**Architecture:** Query the current session’s deferred tool registry for DHIS2 capabilities. Treat absence from that live registry as session-level unavailability, not proof that the MCP configuration was not saved. Because native MCP servers are discovered at Hermes startup and are not hot-reloaded, use a fresh/restarted session as the primary recovery path.

**Tech Stack:** Hermes Agent native MCP client, deferred tool registry, `dhis2-mcp-server`.

---

## Current finding

A live deferred-tool search for `dhis2 MCP server tools DHIS2` returned no DHIS2 tools. Therefore, **this current session does not have callable access to `dhis2-mcp-server`**.

The search did find tools from other active MCP servers, so deferred-tool discovery itself is functioning. The most likely explanation is that DHIS2 was added after this Hermes process/session initialized, or the server failed startup discovery.

### Task 1: Refresh the Hermes MCP tool registry

**Objective:** Start a fresh Hermes process/session so native MCP startup discovery can load `dhis2-mcp-server`.

**Files:**
- No project files should change.
- Inspect only: active Hermes MCP configuration/status and startup logs if the fresh session still lacks DHIS2.

**Step 1: Restart or open a fresh Hermes session**

Restart the Hermes desktop/runtime after saving the MCP addition, then open a new chat.

**Expected:** Native MCP discovery runs during startup and registers tools with a name beginning `mcp_dhis2_...` or a server-name-normalized equivalent.

**Step 2: Query the fresh tool registry**

Search for `dhis2`, `DHIS2 metadata`, and `DHIS2 API` capabilities.

**Expected:** At least one DHIS2 tool is returned with `source: mcp` and the DHIS2 server as `source_name`.

### Task 2: Diagnose startup failure if tools remain absent

**Objective:** Distinguish configuration, executable, environment, timeout, and authentication failures without exposing credentials.

**Files:**
- Read only: active Hermes MCP status/startup logs.
- Do not edit project files.

**Step 1: Confirm server registration**

Verify that `dhis2-mcp-server` is enabled in the active Hermes profile, not another profile.

**Expected:** The server appears under the active profile’s MCP capabilities with the intended command or URL.

**Step 2: Inspect redacted startup status**

Check for command-not-found, package resolution, connection timeout, missing required environment variables, or authentication errors.

**Expected:** Either successful connection and tool count, or one concrete redacted error that identifies the missing prerequisite.

**Step 3: Re-test after correcting only the identified prerequisite**

Restart Hermes again and query the live tool registry.

**Expected:** DHIS2 tools appear and can be schema-loaded with `tool_describe` before the first call.

## Verification

- A DHIS2 tool appears in the current live tool registry.
- `tool_describe` returns its parameter schema.
- A read-only, non-sensitive DHIS2 operation succeeds against the configured instance.
- No credentials, tokens, or private instance data are printed in logs or chat.

## Risks and tradeoffs

- Adding an MCP server does not hot-load it into an already initialized session.
- Configuration may have been added to a different Hermes profile.
- A configured server may still fail discovery because its executable, environment, network access, or credentials are unavailable.
- Do not infer that the server is broken solely from this current session’s missing tools; verify in a fresh runtime first.

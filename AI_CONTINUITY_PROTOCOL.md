# Standing AI Continuity Protocol

Owner directive: 2026-10-25. Applies to every AI agent, human operator and automation working in this repository. This document is a continuity policy, not permission to bypass any release, safety, trading, publishing, privacy or owner-approval gate.

## Mandatory START procedure
1. Read this document, repository README/AGENTS.md and applicable governance/release documents.
2. Search this repository's GitHub Issues for the **most recently updated substantive agent status/handover report**; read it fully, including linked issues, PRs, reviews and evidence. Prefer the latest timestamped verified checkpoint, not merely the highest issue number. Read any subsequent status comments as well.
3. Inspect actual default branch, working branch, exact HEAD/full SHA, dirty/unpushed local changes, open PRs and CI results. Treat reported or local-only artifacts as unverified until inspected. Distinguish committed, tested, reviewed, merged, deployed and owner-approved states.
4. Reconcile assigned work with the last checkpoint and other active agents. Do not repeat finished tasks, overwrite uncommitted work or create competing branches for the same task. Record conflicting evidence before acting.
5. Confirm current scope and authorization. Never infer authorization for live trading, production release, publishing, payments, private-data transfer or destructive changes from this protocol.

## Mandatory END procedure
Before ending **every work session**, create a new dated GitHub Issue titled `AI STATUS | YYYY-MM-DD HH:MM UTC | <agent> | <workstream>` (or append an immutable timestamped report to a designated canonical status issue when issue creation is unavailable). Include:
- Agent identity; start/end UTC times; objective; issue/PR references.
- Repository, default/working branches, exact full baseline and final commit SHAs; pushed vs local-only changes.
- Completed work, file changes, decisions and items intentionally untouched.
- Tests and CI: exact commands, environment, counts, links, failures/skips, and whether evidence is independently verified or reported.
- Outstanding blockers, risks, security/privacy concerns and release/approval gates.
- **Explicit verdict:** DONE / PARTIAL / BLOCKED / NO-GO; distinguish development completion from production deployment.
- **NEXT AGENT START HERE:** one prioritized, actionable next step and how to reproduce/verify the state.
- Links to logs/artifacts/PRs, without secrets, credentials, patient information or other sensitive data.

Verify the issue write succeeded and provide its URL to the owner. If GitHub is unavailable, preserve a local pending report and state that the session is **NOT SYNCHRONIZED**; the next session must publish it before new work.

## Coordination
Use existing GitHub issues and PRs as the shared task ledger. Check for concurrent agent work before changes; prefer isolated branches and draft PRs. Never silently merge, force-push, delete, deploy or override release gates. A passing local test does not establish production readiness. Keep this protocol and project-specific instructions together; stricter project-specific controls prevail.

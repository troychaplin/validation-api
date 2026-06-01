# Gutenberg Alignment

Documents tracking the alignment work that brought the plugin to a state ready for a Gutenberg core-merge proposal. The five-batch alignment plan and the four-item polish pass have shipped; remaining work is captured in the files below.

## Files

| Document | Purpose | Status |
|---|---|---|
| **[consolidated-plan.md](consolidated-plan.md)** | Execution record of the five alignment batches plus the four-item polish pass. Shows what shipped, with commit hashes, acceptance criteria, and the deferred-polish list (items 5-7). | Complete; kept as reference |
| **[core-pr-migration.md](core-pr-migration.md)** | Checklist activated when the core PR is actually cut. Covers PSR-4 → WP-core PHP style, text domain changes, `@since` versioning, REST-namespace finalization, sidebar mount swap, and other items that only make sense in-core. | Dormant until the PR |
| **[../PR-READINESS.md](../PR-READINESS.md)** | Single-page answer to "where are we, what's next for the Gutenberg PR?" Written for future-you returning after a break. | Active |

## History

Detailed audit + planning notes from the alignment work (pass-a convention review, pass-b architectural review, pass-c leanness review) were deleted after the batches shipped. Git history preserves them if ever needed; the decisions they captured live in the code, in the consolidated plan, and in individual commit messages (`batch 1:`, `batch 2:`, etc. — see `git log`).

## Ownership context

User owns all three related plugins — `validation-api` (this plugin), `validation-api-settings` (companion admin UI), `validation-api-integration-example` (demo). No backward-compat concerns apply to internal consumers; coordinated changes across all three are acceptable.

# Gutenberg PR Readiness

Single-page answer to *"where is this plugin in the journey to a Gutenberg core PR, and what's next?"* Written for future-you returning after a break, or a collaborator picking up the work.

**Current branch:** `review/multiple-plugins`
**Last alignment commit:** `5d956d4` (docs refresh after polish 1–4)
**Status:** Aligned + polished; pre-PR test gaps remain.

## TL;DR

The plugin has completed a five-batch alignment pass plus a four-item polish pass. Public API matches Gutenberg conventions. The code is ready for a *proposal-stage* PR (RFC post, discussion, initial store + registration surface). It is **not** ready for a *code-lands-in-core* PR until the deferred test and performance items ship.

Three questions answer "what's next?":

1. **Are you drafting the RFC / proposal post?** → You can start anytime. See [PROPOSAL.md](PROPOSAL.md) and [INTEGRATION.md](INTEGRATION.md); those are the inputs.
2. **Are you cutting code changes into `gutenberg/`?** → Activate [gutenberg-alignment/core-pr-migration.md](gutenberg-alignment/core-pr-migration.md). That doc is the checklist for translating the standalone plugin into core-style PHP + JS package.
3. **Are you still finishing pre-PR polish on this standalone plugin?** → See the "What's left" section below.

## What's done

### Alignment (shipped)

Five batches on `review/multiple-plugins`. See [gutenberg-alignment/consolidated-plan.md](gutenberg-alignment/consolidated-plan.md) for commit hashes and per-batch detail.

- **Batch 1** — JS source reshape to Gutenberg package layout; hook-first lifecycle; `editor.preSavePost` gate; `useValidationIssues` + `useMetaField` consolidations; `getInvalid*` → `useInvalid*`; aliases dropped
- **Batch 2** — REST namespace → `wp-validation/v1/checks` (plugin-owned; final core namespace TBD in review)
- **Batch 3** — `Core/I18n.php` deleted, `wp_set_script_translations()` inlined
- **Batch 4** — ~260 LOC of PHP dead code removed (`Meta\Validator`, `Contracts/CheckProvider`, orphan methods + hooks)
- **Batch 5** — `AbstractRegistry` extracted; Block/Meta/Editor registries share defaults / validation / filter plumbing

### Polish (shipped)

- **@example JSDoc** on 13 public API entries — store selectors + actions + `useMetaField` + `useMetaValidation`
- **TypeScript start** — `src/store/constants.ts` with typed `State`, `ValidationIssue`, `BlockValidationResult`, `MetaValidationResult`, `ValidationMode`, `IssueType`
- **Unit tests** — 56 tests covering store (reducer, actions, selectors) + `issue-helpers`. Run with `pnpm test`.

### Docs (shipped)

- [PROPOSAL.md](PROPOSAL.md) — RFC-style case for adding this to Gutenberg core
- [INTEGRATION.md](INTEGRATION.md) — Gutenberg landscape, component mapping, four-phase contribution plan
- [technical/README.md](technical/README.md) — Current architecture (post-alignment)
- [technical/data-flow.md](technical/data-flow.md) — PHP → JS → UI data path
- [technical/hooks.md](technical/hooks.md) — Every filter and action with parameters
- [technical/api.md](technical/api.md) — Function signatures and arg shapes
- [technical/decisions.md](technical/decisions.md) — Design-decision rationale
- [guide/troubleshooting.md](guide/troubleshooting.md) — Common issues + diagnostics
- [gutenberg-alignment/core-pr-migration.md](gutenberg-alignment/core-pr-migration.md) — Dormant checklist for when the PR branch is cut

## What's left

Grouped by whether it blocks RFC-stage vs. code-landing-stage.

### Blocks code-landing (must ship before the PR is merge-ready)

1. **Unit tests for validation functions** (Polish 5)
   `validateBlock`, `validateMetaField`/`validateAllMetaChecks`, `validateEditor`. Requires mocking `@wordpress/hooks` filters and editor-settings. Target: `src/utils/__tests__/validate-*.test.js`.

2. **Unit tests for custom hooks** (Polish 5b)
   `useMetaField`, `useMetaValidation`, `useInvalidBlocks`, `useInvalidMeta`, `useInvalidEditorChecks`, `useValidationIssues`, `useDebouncedValidation`, `useValidationSync`, `useValidationLifecycle`. Requires `@testing-library/react` + store test harness.

3. **Performance benchmarks** (Polish 6)
   200 / 500 / 1000 blocks. Measure `useInvalidBlocks` compute time, store-dispatch frequency, memory of `blockValidation` slice. Core reviewers will ask — have answers ready. Outputs determine whether to add per-block diffing or lazy-validation pre-PR.

4. **E2E integration tests** (Polish 7)
   `@wordpress/env` + `@wordpress/e2e-test-utils-playwright`. Full flow: PHP registration → editor settings → JS validation → store dispatch → save-lock → `editor.preSavePost` gate. Gives reviewers a reproducible harness.

5. **Core-PR code translation** (core-pr-migration checklist)
   PSR-4 → flat `WP_*` classes, text domain, `@since` versions, CSS prefix, sidebar mount swap to `ComplementaryArea`, Composer autoload → `require_once` chain. Activate [core-pr-migration.md](gutenberg-alignment/core-pr-migration.md) when drafting.

### Does NOT block RFC-stage

The RFC post can land against the current standalone plugin as the reference implementation. Reviewers will read `PROPOSAL.md`, examine the plugin's code, and provide feedback on shape. Only the items above block the follow-up code PR into `gutenberg/`.

## Open questions that need core-team input

From [INTEGRATION.md](INTEGRATION.md) "Open Questions" section. Expect these to come up in the RFC discussion:

1. **Package home** — Should `core/validation` be a new `@wordpress/validation` package, or merged into `@wordpress/editor`?
2. **`block.json` integration** — Should simple validation rules (required attributes, patterns) be declarable in `block.json`?
3. **Async validation** — Ship with `applyFiltersAsync` support from day one, or add later?
4. **Server-side enforcement** — The plugin dropped its `Meta\Validator` helper; consumers use the native `register_post_meta(..., 'validate_callback' => ...)` pattern. Does core want a bundled helper, or leave this split?
5. **Default checks** — Should WordPress ship with any validation checks enabled by default, or strictly framework-only?
6. **`editor.preSavePost` relationship** — The plugin uses `editor.preSavePost` as a belt-and-suspenders over `lockPostSaving`. Does core want to formalize both as complementary or pick one?
7. **REST namespace** — `wp/v2/validation-checks` vs `wp-block-editor/v1/validation-checks` vs new `wp/v2/validation` resource?
8. **Site editor support** — Currently excluded. Template validation is a related but separate problem; reviewers will ask if it's in scope.

## Risks called out in PROPOSAL / INTEGRATION

Kept here as a reminder during drafting:

- **Performance at scale** — per-block debouncing + single `useValidationSync` computation help; benchmarks are Polish 6
- **API permanence** — filter names and function signatures need careful review before they land; renaming post-merge requires deprecation cycles
- **Scope creep** — discussions may pull in content linting, accessibility auditing, editorial workflows. The framework/rules boundary must hold.
- **Field API overlap** — DataViews/DataForm has its own validation model (Gutenberg #71500). Coordination needed if that pattern expands.
- **Site editor gap** — current scope excludes site editor intentionally; not a blocker but will come up.

## What to do first when resuming

1. **Skim this doc** and the commit log since you last touched the code: `git log --oneline review/multiple-plugins`
2. **Run `pnpm test`** — confirm 56 tests still pass
3. **Activate the plugin in your local WP** — confirm nothing regressed since the last verification
4. **Pick one of:**
   - If you want to draft the RFC: re-read [PROPOSAL.md](PROPOSAL.md), [INTEGRATION.md](INTEGRATION.md), post in Gutenberg GitHub discussions or Slack #core-editor
   - If you want to chip away at pre-PR polish: pick one of Polish 5 / 5b / 6 / 7 from [gutenberg-alignment/consolidated-plan.md](gutenberg-alignment/consolidated-plan.md) deferred list
   - If you want to draft the code PR: clone `gutenberg/` trunk fresh, create a feature branch, open [gutenberg-alignment/core-pr-migration.md](gutenberg-alignment/core-pr-migration.md) as your checklist

## Quick reference — what shipped, what didn't

| Item | Status | Commit |
|---|---|---|
| 5-batch alignment (plugin stays standalone-friendly) | ✅ Shipped | See consolidated-plan.md |
| @example JSDoc on public API | ✅ Shipped | `561e32a` |
| TypeScript start (constants.ts + types) | ✅ Shipped | `a228e5d` |
| Jest unit tests (56 tests for store + issue-helpers) | ✅ Shipped | `f78624e` |
| Docs refresh / audit / PR-readiness | ✅ Shipped | this commit |
| Unit tests for validate-* functions | ⏳ Deferred | — |
| Unit tests for custom hooks | ⏳ Deferred | — |
| Performance benchmarks | ⏳ Deferred | — |
| E2E tests | ⏳ Deferred | — |
| Core-PR code translation | ⏳ Dormant | See core-pr-migration.md |

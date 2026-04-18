# Consolidated Action Plan — Gutenberg Alignment

Authoritative execution plan for aligning the Validation API plugin with Gutenberg conventions while preserving standalone-plugin viability. Synthesizes findings from Pass A (conventions), Pass B (architecture), and Pass C (leanness).

For rationale and evidence behind each change, see:
- [pass-a.md](pass-a.md) — conventions & alignment
- [pass-b.md](pass-b.md) — architecture
- [pass-c.md](pass-c.md) — leanness
- [core-pr-migration.md](core-pr-migration.md) — deferred core-merge-only changes

## Status

- [x] Pass A complete
- [x] Pass B complete
- [x] Pass C complete
- [ ] Consolidated plan approved
- [ ] Execution

## Scope

**Five batches.** Estimated impact:
- Reduced PHP LOC: ~375 (Batches 3, 4, 5)
- JS restructure: ~40 files moved/renamed, ~22 LOC saved (Batch 1)
- REST namespace cleanup (Batch 2)

All batches preserve the plugin's public API (global PHP registration functions, JS filter names, store name, kept hooks). The REST endpoint path is the only externally visible breaking change, and the only consumer (settings addon) is updated in the same change.

| Batch | Summary | Risk | From passes |
|---|---|---|---|
| 1 | JS source reshape: flat package layout, hook-based lifecycle, drop aliases, absorb `useValidationIssues` + `useMetaField` consolidation, add `pre-save-validation`, rename `getInvalid*` → `useInvalid*` | Low-Medium | A + B + C |
| 2 | REST namespace move: `wp/v2/validation-checks` → `wp-validation/v1/checks`; settings addon updated in same change | Low | A |
| 3 | Delete `Core/I18n.php`; inline `wp_set_script_translations()` in `Core/Assets.php` | None | A (confirmed C) |
| 4 | PHP dead-code deletions (~260 LOC): `Meta\Validator`, `Contracts/CheckProvider`, dead registry methods, orphan hooks, unreachable `EditorDetection` branch | Very low | C |
| 5 | Extract `AbstractValidationRegistry` base class (~115 LOC saved via deduplication) | Medium | C |

## Execution order

**Recommended order:** cleanup before restructure. Quick wins first, biggest change last.

```
1. Batch 4  (PHP deletions)        — fast win, reduces surface for Batch 5
2. Batch 3  (I18n inline)          — trivial, clears PHP clutter
3. Batch 5  (Registry extraction)  — PHP refactor, benefits from 4 being done
4. Batch 2  (REST namespace)       — coordinated with settings addon
5. Batch 1  (JS restructure)       — largest single change; do when PHP is settled
```

**Rationale:**
- Batches 4 + 3 are near-zero risk. Ship them first, enjoy the cleaner baseline.
- Batch 5 is easier after 4 (fewer dead methods to reason about when extracting the base class).
- Batch 2 is self-contained and coordinates with the settings addon — do it before any JS work that might surface REST dependencies.
- Batch 1 is the largest scope. Doing it last means the PHP side is stable and we're not juggling two moving targets.

**Dependencies (strict):**

- Batch 5 depends on Batch 4 (don't refactor code that's about to be deleted).
- Batch 2 core-plugin change and settings addon change must ship together (either atomic commit or immediate back-to-back).
- No other hard dependencies. Batches can be parallelized if preferred.

**Alternative orderings** (acceptable):
- Strict "smallest first": 3 → 4 → 2 → 5 → 1
- "PHP then JS, both internal": 4 → 3 → 5 → 1 → 2

## Per-batch detail

Each batch's full checklist lives in [pass-a.md](pass-a.md). This section provides acceptance criteria and verification steps only.

### Batch 1 — JS source reshape

**Full checklist:** See [pass-a.md](pass-a.md) Batch 1.

**Summary of touched files:**
- All files under `src/editor/` and `src/shared/` move to a flat `src/` layout
- `src/script.js` renamed to `src/index.js`
- `src/editor/hoc/with*.js` files convert from HOC-exports to module-scope side effects in `src/hooks/`
- `ValidationProvider.js` + `ValidationAPI.js` convert from renderless components to hooks (`useValidationSync`, `useValidationLifecycle`)
- New file `src/hooks/pre-save-validation.js` (adds `editor.preSavePost` filter)
- New file `src/utils/use-validation-issues.js` (consolidates duplicate `useSelect`)
- `src/utils/use-meta-field.js` consolidates its dual `useSelect`
- `getInvalid*.js` hook wrappers rename to `useInvalid*.js`
- Webpack aliases dropped; imports become relative
- `package.json` gains `sideEffects` field

**Acceptance criteria:**
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds; `build/validation-api.js` still produced at expected path
- [ ] No file under `src/editor/` or `src/shared/` remains
- [ ] No `@`, `@editor`, `@shared` alias imports remain
- [ ] Grep for `ValidationProvider\|ValidationAPI` in JS finds no renderless-component definitions (only `useValidationSync` / `useValidationLifecycle`)

**Manual verification (in WP):**
- [ ] Open a post — editor loads without console errors
- [ ] Integration example plugin's validation checks fire (block check, meta check, editor check all surface in sidebar)
- [ ] Sidebar opens under the validation icon; shows grouped issues
- [ ] Toolbar button appears on blocks with validation errors; clicking shows modal with messages
- [ ] Add/resolve an error; verify `lockPostSaving` toggles (Publish/Update button enables/disables)
- [ ] Attempt to save while in error state; `editor.preSavePost` throws; UI shows save failed
- [ ] Body classes `has-validation-errors` / `has-validation-warnings` apply correctly
- [ ] Click a block error in the sidebar; editor scrolls to and selects the block

**Post-batch rebuild:**
- [ ] Rebuild `validation-api-integration-example` (`npm run build` in its directory)

**Rollback:** Single large commit; revert if issues. Or: keep the old `src/editor/` + `src/shared/` tree in a branch until Batch 1 is verified.

---

### Batch 2 — REST namespace move

**Full checklist:** See [pass-a.md](pass-a.md) Batch 2.

**Touched files:**
- `includes/Rest/ChecksController.php` — namespace + rest_base
- `validation-api-settings/src/settings/App.js` — fetch path
- Documentation: `docs/PROPOSAL.md`, `docs/technical/*`, `CLAUDE.md`, settings addon README

**Acceptance criteria:**
- [ ] `curl -u admin:pass http://site/wp-json/wp-validation/v1/checks` returns the grouped-by-scope response
- [ ] `curl http://site/wp-json/wp/v2/validation-checks` returns 404
- [ ] Grep across all plugins: no references to old path remain

**Manual verification:**
- [ ] Settings addon page loads; table populates with all registered checks
- [ ] Change a check's level, save; reload; change persists
- [ ] `wp_validation_check_level` filter still applies the override in the editor (confirm by registering a check and setting it to "none" — check should disappear from validation surface)

**Rollback:** Revert the two file changes and rebuild settings addon.

---

### Batch 3 — I18n class simplification

**Full checklist:** See [pass-a.md](pass-a.md) Batch 3.

**Touched files:**
- `includes/Core/I18n.php` (deleted)
- `includes/Core/Assets.php` (inlined `wp_set_script_translations`)
- `includes/Core/Plugin.php` (I18n instantiation removed)

**Acceptance criteria:**
- [ ] PHP loads without fatal errors
- [ ] `pnpm build` still succeeds
- [ ] `wp_set_script_translations` is called exactly once for the editor script handle (grep to confirm)

**Manual verification:**
- [ ] If a translation `.json` exists in `languages/`, editor strings render translated
- [ ] No I18n-related PHP warnings in debug log

**Rollback:** Revert the file changes; `I18n.php` is a pure deletion.

---

### Batch 4 — PHP dead-code deletions

**Full checklist:** See [pass-a.md](pass-a.md) Batch 4.

**Touched files:**
- `includes/Meta/Validator.php` (deleted)
- `includes/Contracts/CheckProvider.php` (deleted)
- `includes/Contracts/` (directory removed if empty)
- `includes/Block/Registry.php` (two methods removed, two actions removed)
- `includes/Editor/Registry.php` (one method removed)
- `includes/Core/Traits/EditorDetection.php` (fallback branch removed)
- `docs/guide/check-providers.md` (removed or updated)
- `docs/technical/hooks.md` (two hooks removed from documentation, if listed)

**Acceptance criteria:**
- [ ] PHP linting passes
- [ ] Plugin activates without fatal errors
- [ ] `includes/Contracts/` directory removed or empty
- [ ] No PHP warnings for missing classes/methods
- [ ] Grep confirms zero remaining references to: `Meta\Validator`, `CheckProvider`, `unregister_check`, `set_check_enabled`, `register_editor_check_for_post_types`, `wp_validation_check_unregistered`, `wp_validation_check_toggled`

**Manual verification:**
- [ ] Settings addon still reads all checks via REST endpoint
- [ ] `wp_validation_check_level` filter still fires
- [ ] Integration example plugin registers all its checks (visible in settings addon table)
- [ ] Editor post/page editor still enqueues validation scripts (post editor context detection still works after removing the fallback branch)

**Rollback:** Deletions are recoverable via git. Each deletion is independent — can restore one without affecting others.

---

### Batch 5 — Registry abstract base class extraction

**Full checklist:** See [pass-a.md](pass-a.md) Batch 5.

**Touched files:**
- `includes/AbstractRegistry.php` (new file)
- `includes/Block/Registry.php` (extends new abstract class)
- `includes/Meta/Registry.php` (extends new abstract class)
- `includes/Editor/Registry.php` (extends new abstract class)

**Acceptance criteria:**
- [ ] `pnpm lint` (PHP) passes
- [ ] Each registry's public method signatures unchanged
- [ ] `BlockRegistry::get_instance()`, `MetaRegistry::get_instance()`, `EditorRegistry::get_instance()` still return singletons
- [ ] Total PHP LOC reduced by ~115 compared to pre-Batch-5
- [ ] REST endpoint response structure unchanged

**Manual verification:**
- [ ] Register a block check via `wp_register_block_validation_check()` — appears in REST response
- [ ] Register a meta check — appears; the 3-level `[post_type][meta_key][check_name]` structure intact
- [ ] Register an editor check — appears
- [ ] Settings addon lists all checks across all three scopes
- [ ] Changing a check's level via settings still filters through `wp_validation_check_level`
- [ ] Check with duplicate `namespace`+`name` logs expected error (confirm `log_error` path still wired via `Logger` trait)
- [ ] Invalid level parameter (e.g., `'critical'`) logs error and defaults to `'error'`

**Rollback:** This is the most involved batch. Revert the four file changes. Inspect each registry's `register_check()` method to confirm parity with pre-Batch-5 behavior.

---

## Cross-batch verification (post-all-batches)

After all five batches ship, run through these end-to-end checks:

- [ ] Fresh WP install; activate core plugin only — no errors
- [ ] Activate integration example — all checks register, validation surfaces in the editor
- [ ] Activate settings addon — table populates, level overrides save and apply
- [ ] Disable core plugin — integration example's `function_exists` guards kick in, no errors
- [ ] Re-enable core plugin — everything reconnects
- [ ] Create a new post of each registered post type — checks fire appropriately per post type
- [ ] Publish a post with errors resolved — save succeeds
- [ ] Attempt to publish with errors — `lockPostSaving` prevents save; `editor.preSavePost` throws if somehow bypassed
- [ ] Change a check's level via settings addon to `'warning'` — UI updates to warning styling; save allowed
- [ ] Change a check's level to `'none'` — check disappears entirely
- [ ] PHP debug log shows no warnings/notices under WP_DEBUG
- [ ] JS console shows no errors or warnings

## Post-batch polish

Orthogonal to Gutenberg alignment; tracked separately.

### Completed

- [x] **Polish 1** — `@example` JSDoc blocks added to the public API surface (6 store selectors, 5 store actions, `useMetaField`, `useMetaValidation`). Commit `561e32a`.
- [x] **Polish 2** — TypeScript migration started with `src/store/constants.ts`. Exports `State`, `ValidationIssue`, `BlockValidationResult`, `MetaValidationResult`, `ValidationMode`, `IssueType`, and the action-type constants as narrow literal types. Stale `babel.config.json` deleted in the same change so `@wordpress/scripts`' default preset (which includes `@babel/preset-typescript`) takes effect. Commit `a228e5d`.
- [x] **Polish 3+4** — Unit tests via `@wordpress/scripts test-unit-js`. Test infrastructure added (`test` / `test:watch` npm scripts; Jest env override in `.eslintrc.json`). 56 tests across 4 suites covering store reducer, actions, selectors, and `issue-helpers`. All pure-function coverage in ~1s. Commit `f78624e`.

### Deferred — pick up before the core PR

- [ ] **Polish 5** — Unit tests for the validation-dispatch functions. Requires `@wordpress/hooks` filter mocking and editor-settings mocking. Targets:
  - `validateBlock()` — block-type rule lookup, `editor.validateBlock` filter application, mode derivation
  - `validateMetaField()` / `validateAllMetaChecks()` — per-key rule lookup, `editor.validateMeta` filter, required-field fallback
  - `validateEditor()` — per-post-type rules, `editor.validateEditor` filter, priority sort
- [ ] **Polish 5b** — Unit tests for custom hooks. Requires `@testing-library/react` plus `@wordpress/data` store mocking. Targets: `useMetaField`, `useMetaValidation`, `useInvalidBlocks`, `useInvalidMeta`, `useInvalidEditorChecks`, `useValidationIssues`, `useDebouncedValidation`, `useValidationSync`, `useValidationLifecycle`.
- [ ] **Polish 6** — Performance benchmarks with 200+/500+/1000+ block posts. Measures `useInvalidBlocks` re-computation time, dispatch churn, and memory of the `blockValidation` store slice. Outputs inform whether to add per-block diffing or lazy validation before the PR.
- [ ] **Polish 7** — Integration / e2e tests via `@wordpress/env` + `@wordpress/e2e-test-utils-playwright`. Full-stack coverage: PHP check registration → editor settings injection → JS validation → store dispatch → save-lock → `editor.preSavePost` gate.

### Also worth doing before core PR (from [docs/TODO.md](../TODO.md))

- [ ] Further TypeScript migration: `src/store/actions.js`, `src/store/selectors.js`, `src/store/reducer.js`, `src/store/index.js`. Constants are typed already; making the consumers typed closes the loop.
- [ ] Add `.d.ts` or inline JSDoc types for check registration args (the object shape accepted by `wp_register_block_validation_check()` on the JS-filter side).
- [ ] **Future considerations** (design discussions, not straight tasks): `block.json` declarative validation, async validation via `applyFiltersAsync`, site-editor support. See [docs/TODO.md](../TODO.md) "Future Considerations" for rationale.

## Deferred — not in these batches

Changes that only make sense when cutting the actual core PR are captured in [core-pr-migration.md](core-pr-migration.md). These include:
- PSR-4 namespaced classes → `WP_*` flat files in `lib/validation/`
- Text domain `validation-api` → `default` (or `gutenberg` while in plugin)
- `@since 1.0.0` → target WP version
- REST namespace from `wp-validation/v1` → whatever core accepts
- CSS class prefix rename
- JS `__()` text-domain argument removal
- Sidebar mount `registerPlugin` → direct `ComplementaryArea`
- `@package ValidationAPI` → `@package gutenberg` / `@package WordPress`
- Composer PSR-4 autoload → `require_once` chain

## Sign-off checklist

Before execution begins:

- [ ] Plan reviewed and approved
- [ ] Batch order confirmed (recommended vs. alternative)
- [ ] Acceptance criteria understood for each batch
- [ ] Rollback strategy acceptable (per-batch git revert)
- [ ] Manual verification steps understood (no automated tests available)
- [ ] All three plugins accessible for testing (core, settings, integration example)
- [ ] Test WordPress site available

During execution (per batch):

- [ ] Pre-batch git status clean
- [ ] Batch checklist in [pass-a.md](pass-a.md) followed item-by-item
- [ ] Acceptance criteria verified
- [ ] Manual verification complete
- [ ] Commit with batch number in message
- [ ] Move to next batch

After all batches:

- [ ] Cross-batch verification passed
- [ ] Post-batch polish items scheduled
- [ ] [core-pr-migration.md](core-pr-migration.md) reviewed for completeness

## Notes

- This plan assumes no automated test suite. Manual verification is the gate.
- The user owns all consumers of the plugins (core, settings addon, integration example), so no backward-compat concerns apply.
- Estimated total effort: Batch 4 ~1 hour, Batch 3 ~15 min, Batch 5 ~2-3 hours, Batch 2 ~30 min, Batch 1 ~4-6 hours. Total ~8-11 hours of focused work.
- The JS restructure (Batch 1) is the single biggest time investment; most of it is mechanical file moves + import rewriting.

# Pass A — Convention & Alignment

Review of the Validation API plugin against current Gutenberg conventions. This pass covers naming, file organization, export patterns, and style. It does **not** cover architectural decisions (Pass B) or leanness / duplication (Pass C).

## Status

- [x] Review complete
- [x] Decisions locked (see below)
- [ ] Consolidated plan reviewed (awaits Pass B + Pass C)
- [ ] Execution

## Decisions locked during Pass A

| Decision | Value |
|---|---|
| REST namespace (standalone phase) | `wp-validation/v1/checks` |
| Batch 1 execution style | Single coherent restructure (owner controls all consumers; no need to split) |
| Backwards compatibility | Not required — owner controls all consuming plugins |

## Reference sources

- Gutenberg trunk: `wp-content/plugins/gutenberg/` — sampled `packages/editor`, `packages/block-editor`, `packages/core-data`, `packages/notices`, `packages/plugins`, `packages/interface`, and `lib/`, `lib/experimental/`, `lib/compat/`
- See `docs/PROPOSAL.md` for the core-merge pitch this alignment supports

## Findings summary

### What already aligns with Gutenberg (do not change)

| Area | Current state |
|---|---|
| Store name | `core/validation` — matches `core/*` convention |
| JS filter namespace | `editor.validateBlock` / `editor.validateMeta` / `editor.validateEditor` — matches `editor.*` behavioral-filter pattern |
| Global PHP function names | `wp_register_block_validation_check()` etc. — core-style |
| PHP hook prefix | `wp_validation_*` — positioned for core |
| Registry singleton pattern | Static `get_instance()` — matches `WP_Connector_Registry` |
| Editor settings injection | `block_editor_settings_all` filter — canonical |
| Selector naming | `getInvalidBlocks`, `hasErrors`, `hasWarnings` — matches `get*`/`has*`/`is*` convention |
| Action naming | `setInvalidBlocks` (present tense) — matches `editPost`/`savePost` style |
| Filter name strings | Inline (not constants) — matches Gutenberg |
| CSS class prefix `validation-api-*` | Correct for standalone; renamed at core-PR time |

### Tier 1 — blockers for core merge (deferred; standalone-safe as-is)

These are addressed in `core-pr-migration.md` (drafted after all three passes complete).

- PSR-4 namespaced classes → `WP_*` flat classes under `lib/validation/`
- Text domain `validation-api` → `gutenberg` → `default`
- `@since 1.0.0` → target WP version
- CSS class prefix rename
- Drop text-domain argument from JS `__()` calls

### Tier 2 — significant alignment (addressed below or deferred to Pass B/C)

- [Batch 1] JS entry point and package shape: `src/script.js` + `registerPlugin` + `src/editor/` + `src/shared/` split + webpack aliases
- [Batch 2] REST namespace `wp/v2/validation-checks` → `wp-validation/v1/checks`
- [Pass B] REST permission callback `manage_options` — audit consumers
- [Pass B] `registerPlugin('core-validation', ...)` — keep for standalone sidebar mount, but verify against architectural review
- [Pass C] Three duplicate `Registry` classes — collapse candidate
- [Pass C] Six lifecycle hooks — audit consumers, prune unused

### Tier 3 — polish (addressed below)

- [Batch 1] `package.json` `sideEffects` declaration
- [Batch 1] `getInvalid*.js` hook wrappers renamed to `useInvalid*.js`
- [Batch 3] `Core/I18n.php` collapsed to an enqueue line
- [Future] JSDoc `@example` blocks on public APIs (optional polish, separate task)
- [Future] TypeScript for `store/constants.ts` (optional, defer until after Pass C)

---

## Action plan

Three independent batches. Order of execution is decided in the consolidated plan after Pass B and Pass C.

---

### Batch 1 — JS source reshape

**Goal:** Restructure `src/` to match Gutenberg package layout. Pure reorganization. No public API changes.

**Risk:** Low. Internal file paths change; public API (store name, filter names, global PHP functions) unchanged. Integration example requires rebuild but no code change.

#### Checklist

**Directory flattening — file moves:**

- [ ] `src/editor/store/` → `src/store/`
- [ ] `src/editor/store/constants.js` → `src/store/constants.js`
- [ ] `src/editor/store/actions.js` → `src/store/actions.js`
- [ ] `src/editor/store/selectors.js` → `src/store/selectors.js`
- [ ] `src/editor/store/reducer.js` → `src/store/reducer.js`
- [ ] `src/editor/store/index.js` → `src/store/index.js`
- [ ] `src/editor/components/ValidationSidebar.js` → `src/components/validation-sidebar/index.js`
- [ ] `src/editor/components/ValidationToolbarButton.js` → `src/components/validation-toolbar-button/index.js`
- [ ] `src/editor/components/ValidationIcon.js` → `src/components/validation-icon/index.js`
- [ ] `src/editor/components/ValidationProvider.js` → `src/hooks/use-validation-sync.js` — **convert from renderless component to hook per Pass B finding B-1**. Export `useValidationSync()`; it runs the three `GetInvalid*` hooks and dispatches to the store via `useEffect`.
- [ ] `src/editor/validation/ValidationAPI.js` → `src/hooks/use-validation-lifecycle.js` — **convert from renderless component to hook per Pass B finding B-1**. Export `useValidationLifecycle()`; it `useSelect`s from the store and runs the two `useEffect`s (save-locking + body CSS classes).
- [ ] `src/editor/validation/blocks/validateBlock.js` → `src/utils/validate-block.js`
- [ ] `src/editor/validation/meta/validateMeta.js` → `src/utils/validate-meta.js`
- [ ] `src/editor/validation/editor/validateEditor.js` → `src/utils/validate-editor.js`
- [ ] `src/editor/validation/meta/hooks/useMetaField.js` → `src/utils/use-meta-field.js`
- [ ] `src/editor/validation/meta/hooks/useMetaValidation.js` → `src/utils/use-meta-validation.js`
- [ ] `src/shared/utils/validation/issueHelpers.js` → `src/utils/issue-helpers.js`
- [ ] `src/shared/utils/validation/getValidationConfig.js` → `src/utils/get-validation-config.js`
- [ ] `src/shared/hooks/useDebouncedValidation.js` → `src/utils/use-debounced-validation.js`
- [ ] `src/editor/register.js` → `src/hooks/register-sidebar.js` — calls `registerPlugin( 'core-validation', { render: ValidationPlugin, icon } )`. The `ValidationPlugin` root component (defined in this file or co-located) calls `useValidationSync()` and `useValidationLifecycle()` inside its body, then returns `<ValidationSidebar />`. Keeps hooks running even when the sidebar conditionally returns `null`. (Pass B finding B-1.)
- [ ] **New file `src/hooks/pre-save-validation.js`** — Pass B finding B-2. Registers `addFilter( 'editor.preSavePost', 'validation-api/pre-save-gate', async ( edits ) => { if ( select( validationStore ).hasErrors() ) throw new Error( '...' ); return edits; } )` as a save-time safety net layered on top of `lockPostSaving`.
- [ ] **New file `src/utils/use-validation-issues.js`** — Pass C finding C-9. Extracts the duplicated 7-line `useSelect` block (currently in `ValidationSidebar` and post-Pass-B `useValidationLifecycle`) into a single shared hook returning `{ invalidBlocks, invalidMeta, invalidEditorChecks }`. Update both consumers.
- [ ] **Consolidate dual `useSelect` in `use-meta-field.js`** — Pass C finding C-10. Currently calls `useMetaValidation()` (which has its own `useSelect`) plus a second `useSelect` for the meta value. Merge into one `useSelect` that reads both.
- [ ] Remove empty `src/editor/`, `src/shared/`, index barrel files that no longer serve

**HOC → side-effect hook files:**

- [ ] `src/editor/hoc/withErrorHandling.js` → `src/hooks/validate-block.js`
  - Convert from `export default createHigherOrderComponent(...)` to a module-scope `addFilter('editor.BlockEdit', 'validation-api/error-handling', withErrorHandling)` side effect
- [ ] `src/editor/hoc/withBlockValidationClasses.js` → `src/hooks/block-validation-classes.js`
  - Same conversion: HOC defined locally, `addFilter('editor.BlockListBlock', 'validation-api/block-classes', ...)` at module scope

**New file — `src/hooks/index.js`:**

```js
// Side-effect imports — each module registers its filter/plugin on import
import './register-sidebar';
import './validate-block';
import './block-validation-classes';
import './pre-save-validation';
```

*Note: `use-validation-sync.js` and `use-validation-lifecycle.js` are custom hooks (not side-effect modules), so they are NOT imported here. They are imported by `register-sidebar.js`'s `ValidationPlugin` component and invoked inside its render.*

**Getter-style hooks renamed to `use*`:**

- [ ] `src/shared/utils/validation/getInvalidBlocks.js` → `src/utils/use-invalid-blocks.js` (rename export `getInvalidBlocks` → `useInvalidBlocks`)
- [ ] `src/shared/utils/validation/getInvalidMeta.js` → `src/utils/use-invalid-meta.js` (rename export `getInvalidMeta` → `useInvalidMeta`)
- [ ] `src/shared/utils/validation/getInvalidEditorChecks.js` → `src/utils/use-invalid-editor-checks.js` (rename export `getInvalidEditorChecks` → `useInvalidEditorChecks`)
- [ ] Update all call sites (likely in `ValidationProvider.js`)
- [ ] **Note:** Store selectors keep `getInvalid*` names — only the React-hook wrapper files rename

**Entry point:**

- [ ] `src/script.js` → `src/index.js`
- [ ] `src/index.js` body:

```js
import './store';   // registers core/validation store (side effect)
import './hooks';   // registers filters + sidebar (side effects)
import './styles.scss';

// Public exports (for any future consumer importing from build/)
export * from './store';
export * from './utils';
export { default as ValidationSidebar } from './components/validation-sidebar';
export { default as ValidationToolbarButton } from './components/validation-toolbar-button';
export { default as ValidationIcon } from './components/validation-icon';
```

- [ ] Update `webpack.config.js` entry: `index: path.resolve(__dirname, 'src/index.js')` — keep output filename `validation-api.js` so `Core/Assets.php` enqueue path doesn't change
- [ ] Verify `Core/Assets.php` still finds the built file

**Webpack aliases removed:**

- [ ] Delete `resolve.alias` entries for `@`, `@editor`, `@shared` from `webpack.config.js`
- [ ] Convert every `@/...`, `@editor/...`, `@shared/...` import in JS files to relative path
- [ ] Verify no alias references remain (grep `@editor/`, `@shared/`, `from '@/`)

**Styles:**

- [ ] `src/styles.scss` and `src/styles/` tree — keep at `src/styles.scss` + `src/styles/` (Gutenberg packages typically co-locate style per component, but plugin-scoped global stylesheet is acceptable)
- [ ] Verify component folder style co-location works: `src/components/validation-sidebar/style.scss` for component-scoped styles, if any exist

**`package.json`:**

- [ ] Add `sideEffects` field:

```json
"sideEffects": [
  "src/index.js",
  "src/hooks/**",
  "src/store/index.js",
  "src/**/*.scss"
]
```

- [ ] Update `main` field if present (probably `build/validation-api.js`) — no change needed unless entry filename changes

**Integration example plugin rebuild:**

- [ ] After Batch 1 ships, rebuild `validation-api-integration-example` (`npm run build` in its directory)
- [ ] Verify its validation hooks still fire — the public filter names and PHP functions didn't change, so this should just work

**Settings addon:**

- [ ] No changes required from Batch 1 alone (settings addon doesn't import from core plugin JS)

#### Acceptance criteria

- [ ] `pnpm build` completes cleanly
- [ ] Plugin loads in `wp-admin` with no console errors
- [ ] Opening a post shows the validation sidebar under its usual icon
- [ ] Integration example plugin's checks still fire (block, meta, editor scopes)
- [ ] Settings addon settings page still loads (REST endpoint unchanged in Batch 1)
- [ ] No file under `src/editor/` or `src/shared/` remains
- [ ] No webpack alias imports remain
- [ ] `pnpm lint` passes

---

### Batch 2 — REST namespace move

**Goal:** Move REST route off `wp/v2` (reserved core namespace) to plugin-owned `wp-validation/v1`. Settings addon updated in the same change.

**Risk:** Low for owner (all consumers controlled). Any third-party consumer of old endpoint breaks — acceptable.

**Decision locked:** `wp-validation/v1/checks`

#### Checklist

**Core plugin:**

- [ ] `includes/Rest/ChecksController.php`: change `$this->namespace = 'wp/v2'` → `$this->namespace = 'wp-validation/v1'`
- [ ] `includes/Rest/ChecksController.php`: change `$this->rest_base = 'validation-checks'` → `$this->rest_base = 'checks'`
- [ ] Verify no other file hard-codes the old path
- [ ] Grep for `wp/v2/validation-checks` across codebase — replace with `wp-validation/v1/checks`

**Settings addon:**

- [ ] `validation-api-settings/src/settings/App.js`: update the `apiFetch({ path: '/wp/v2/validation-checks' })` call to `/wp-validation/v1/checks`
- [ ] Grep settings addon for old path — replace
- [ ] Rebuild settings addon (`npm run build` in its directory)

**Documentation:**

- [ ] Update `docs/PROPOSAL.md` — the "REST API" paragraph currently cites `GET /wp/v2/validation-checks`. Replace with `GET /wp-validation/v1/checks` and add a note: "final namespace in core TBD during PR — candidates: `wp/v2/validation-checks`, `wp-block-editor/v1/validation-checks`"
- [ ] Update `docs/technical/` REST reference if present
- [ ] Update `CLAUDE.md` REST API section in core plugin (`/wp/v2/validation-checks` → `/wp-validation/v1/checks`)
- [ ] Update settings addon README if it documents the REST integration

#### Acceptance criteria

- [ ] `curl -u admin:pass http://site/wp-json/wp-validation/v1/checks` returns the expected grouped-by-scope response
- [ ] `curl http://site/wp-json/wp/v2/validation-checks` returns 404
- [ ] Settings addon page loads, table populates with checks
- [ ] Settings addon save round-trip works (POST → `wp_options` → reload → table reflects saved levels)

---

### Batch 3 — I18n class simplification

**Goal:** Match Gutenberg's functional style for script translation loading.

**Risk:** None. Same behavior, one less class.

#### Checklist

- [ ] Identify the `wp_set_script_translations()` call inside `includes/Core/I18n.php`
- [ ] Move the call inline into `includes/Core/Assets.php` wherever `wp_register_script()`/`wp_enqueue_script()` is called for the main validation-api editor script
- [ ] Remove `$this->i18n = new I18n(...)` and associated init from `includes/Core/Plugin.php`
- [ ] Delete `includes/Core/I18n.php`
- [ ] Verify Composer autoload works without the file (PSR-4 discovers by convention, no registry update needed)

#### Acceptance criteria

- [ ] `pnpm build` and PHP load still succeed
- [ ] Existing `.json` translation file (if any under `languages/`) still loads for the editor script
- [ ] `wp_set_script_translations` is called exactly once for the editor script handle

---

## Pending Pass B (architectural) — RESOLVED

Pass B completed. Results folded into Batch 1 above, with full rationale in `pass-b.md`. Summary:

- [x] **REST permission callback `manage_options`** — **KEEP**. Only consumer is the settings admin page; editor JS uses `block_editor_settings_all` injection, not the REST endpoint. `manage_options` is correct for an admin-only config endpoint.
- [x] **`registerPlugin('core-validation', ...)` for sidebar** — **KEEP** during standalone phase. Canonical for third-party plugins; Gutenberg reserves `ComplementaryArea` direct mount for built-in sidebars. Swap deferred to core-PR.
- [x] **`ValidationProvider` / `ValidationAPI` renderless components** — **CONVERT TO HOOKS** (Batch 1 updated above). `useValidationSync` + `useValidationLifecycle` invoked from a single `ValidationPlugin` root component.
- [x] **`EditorDetection` trait** — **KEEP**. No Gutenberg PHP helper exists to replace it. Gutenberg features detect context per-feature (same pattern).
- [x] **`editor.preSavePost` usage** — **ADD** as belt-and-suspenders safety net (Batch 1 now includes new file `src/hooks/pre-save-validation.js`).

## Pending Pass C (leanness) — RESOLVED

Pass C completed. New batches 4 and 5 added below. Results summary:

- [x] **Collapse three `Registry` classes** — Refined: extract `AbstractRegistry` base class (keep scope-specific subclasses due to state-shape differences). See Batch 5 below. ~115 LOC saved.
- [x] **Prune lifecycle actions** — Delete 2 (undocumented, coupled to dead methods): `wp_validation_check_unregistered`, `wp_validation_check_toggled`. Keep 4 + 3 filters (documented public API).
- [x] **`Contracts/CheckProvider` interface** — DELETE (no implementations found workspace-wide). See Batch 4.
- [x] **`Core/Traits/Logger` trait** — KEEP. 28 active call sites; debugging consistency value.
- [x] **`getValidationConfig.js` utility layer** — KEEP. The indirection earns its file.
- [x] **`EditorDetection` trait internals** — Trim 8 LOC dead `get_current_screen()` fallback branch. See Batch 4.
- [x] **Store-subscription consolidation** (Pass B forward) — Add `useValidationIssues()` hook; absorbed into Batch 1.
- [x] **Global editor-settings injection vs per-context** (Pass B forward) — Skip. No perf concern at current scale.

---

## Batch 4 — PHP dead-code deletions (Pass C)

**Goal:** Delete public API surfaces that have no consumers and no documented contract.

**Risk:** Very low. All deletions are of unused code; public filter/action names that remain are those with documentation or active consumers.

#### Checklist

- [ ] **Delete `includes/Meta/Validator.php`** (109 LOC). No callers in workspace; server-side meta validation is available via `register_post_meta( ..., 'validate_callback' => ... )` directly.
  - [ ] Remove any `use` statements or references to `ValidationAPI\Meta\Validator` elsewhere
  - [ ] Remove mention from `docs/guide/` and `docs/technical/` if present
- [ ] **Delete `includes/Contracts/CheckProvider.php`** (47 LOC). No implementations in workspace.
  - [ ] Remove the `includes/Contracts/` directory if empty afterward
  - [ ] Remove mention from `docs/guide/check-providers.md` (or delete that guide entirely if it was the only content)
- [ ] **Delete `Block\Registry::unregister_check()`** (17 LOC) + the `wp_validation_check_unregistered` action it fires
- [ ] **Delete `Block\Registry::set_check_enabled()`** (12 LOC) + the `wp_validation_check_toggled` action it fires
- [ ] **Delete `Editor\Registry::register_editor_check_for_post_types()`** (9 LOC). Bulk convenience helper, never called.
- [ ] **Delete `EditorDetection::get_current_screen()` fallback branch** (lines where it falls through after the `$pagenow` + post-type checks; ~8 LOC). Unreachable in modern WP admin where `$pagenow` is always set.
- [ ] **Documentation cleanup:**
  - [ ] Remove `wp_validation_check_unregistered` and `wp_validation_check_toggled` from `docs/technical/hooks.md` (if present — Pass C found them undocumented, but verify)
  - [ ] Remove any `docs/guide/` examples using the deleted methods

#### Acceptance criteria

- [ ] `pnpm lint` (PHP portion) passes — no unresolved references to deleted classes/methods
- [ ] Plugin activates without fatal errors
- [ ] Settings addon's `wp_validation_check_level` filter still fires (confirm by loading settings page, toggling a level, saving, confirming the level applies)
- [ ] Integration example plugin still registers all its checks
- [ ] REST endpoint `GET /wp-validation/v1/checks` still returns expected structure

---

## Batch 5 — Registry duplication reduction (Pass C)

**Goal:** Extract shared registration/validation logic from three `Registry` classes into an abstract base class. Internal refactor; no public API change.

**Risk:** Medium. Touches all three registries. Must verify behavior parity.

#### Checklist

- [ ] **Create `includes/AbstractRegistry.php`** with:
  - `normalize_args( array $args, string $scope ): array` — merges defaults, validates level, sets `warning_msg` fallback, stamps `_namespace` from `namespace` arg
  - `validate_required_args( array $args, array $required ): bool` — required-field check + log_error on failure
  - `sort_by_priority( array &$checks ): void` — extracts the `uasort` pattern
  - `use` the `Logger` trait
- [ ] **Refactor `Block\Registry` to extend `AbstractRegistry`**
  - Replace duplicated defaults/validation block with `parent::normalize_args()` + `parent::validate_required_args()`
  - Keep scope-specific methods (`register_check`, `get_registered_block_types`, etc.)
  - Confirm hook firing (`wp_validation_check_registered`) still fires with same args
- [ ] **Refactor `Meta\Registry` to extend `AbstractRegistry`**
  - Same approach; scope-specific 3-level storage stays
  - Hook firing stays scope-specific (`wp_validation_meta_check_registered` if distinct, or same hook — confirm current behavior)
- [ ] **Refactor `Editor\Registry` to extend `AbstractRegistry`**
  - Same approach
- [ ] **Confirm `BlockRegistry::get_instance()`, `MetaRegistry::get_instance()`, `EditorRegistry::get_instance()` all still return the same singleton instances** (important — settings addon expects these)

#### Acceptance criteria

- [ ] All existing tests pass (once tests exist — currently there are none; at minimum, manual regression)
- [ ] Integration example plugin registers all its checks without error
- [ ] Settings addon lists all registered checks in the table
- [ ] Total PHP LOC reduced by ~115 compared to pre-Batch-5
- [ ] No change in public PHP API surface (same global function signatures, same hooks fired with same args)
- [ ] No change in REST endpoint response shape

## Deferred to core-PR (future `core-pr-migration.md`)

These are documented here as the authoritative list; full migration steps go in a dedicated doc after all three passes complete.

| Item | Current | Core-PR target | Trigger |
|---|---|---|---|
| PHP class style | `ValidationAPI\Block\Registry` (PSR-4 namespaced) | `WP_Validation_Block_Registry` in `lib/validation/class-wp-validation-block-registry.php` | PR branch cut against `gutenberg/` |
| Class autoload | Composer PSR-4 | WP-style `require_once` chain in `lib/validation/load.php` | PR branch cut |
| Traits | `Core/Traits/Logger`, `Core/Traits/EditorDetection` | Inline or convert to abstract class (core rarely uses traits) | PR branch cut |
| Text domain | `validation-api` | `gutenberg` (while in plugin) → `default` (in core) | PR branch cut |
| JS `__()` text domain arg | `__( 'text', 'validation-api' )` | `__( 'text' )` (no domain) | PR branch cut |
| `@since` tag | `@since 1.0.0` | `@since 6.x.y` (target WP version) | PR branch cut; WP version confirmed |
| CSS class prefix | `validation-api-*` | `wp-validation-*` or as core review decides | PR branch cut |
| REST namespace | `wp-validation/v1/checks` | `wp/v2/validation-checks` OR `wp-block-editor/v1/validation-checks` | PR review feedback |
| Sidebar mount | `registerPlugin('core-validation', ...)` | Direct `ComplementaryArea` / slot registration from within package | PR branch cut |
| `@package` tag in PHP | `@package ValidationAPI` | `@package gutenberg` → `@package WordPress` | PR branch cut |

## Notes / open questions

- Recent-PR sampling for tone/commit style was skipped during Pass A. Trunk code is the style reference. If the eventual PR needs tone examples, do a 1-hour sampling pass just before drafting.
- TypeScript migration is optional polish; defer until after Pass C (no point typing code that may get consolidated or deleted).
- Integration example plugin's build needs to be re-run after Batch 1 ships.

# Gutenberg Alignment — Execution Record

Execution record of the five-batch alignment plan and the subsequent polish pass. All batches shipped; polish items 1–4 complete, items 5–7 deferred to the pre-PR phase. Detailed per-batch planning documents (pass-a, pass-b, pass-c) were removed after the work shipped — git history preserves them.

For the active to-do list, see [../TODO.md](../TODO.md).
For the pre-PR migration checklist (dormant until the core PR is cut), see [core-pr-migration.md](core-pr-migration.md).
For current PR-readiness status, see [../PR-READINESS.md](../PR-READINESS.md).

## The five batches

All five shipped to `review/multiple-plugins`. Public API unchanged across every batch except the REST endpoint path (coordinated with the settings addon in the same change).

| Batch | Commit | Summary |
|---|---|---|
| **1** | `16b1dce` | JS source reshape to Gutenberg-package layout. Flat `src/{store, utils, hooks, components}/`. Renderless `ValidationProvider`/`ValidationAPI` converted to `useValidationSync` + `useValidationLifecycle` hooks (invoked from sibling renderless wrappers to avoid render loops). `editor.preSavePost` save gate added. `useValidationIssues()` consolidated hook. `useMetaField` dual `useSelect` collapsed. `getInvalid*` → `useInvalid*`. Webpack aliases dropped. `package.json` `sideEffects` declared. |
| **2** | `c927184` + `0088bc8` (addon) | REST namespace: `wp/v2/validation-checks` → `wp-validation/v1/checks`. Plugin-owned namespace; final core namespace TBD during PR review. Settings addon updated in lockstep. |
| **3** | `3d35352` | `includes/Core/I18n.php` deleted; `wp_set_script_translations()` inlined in `Core/Assets.php`. 58 LOC removed. |
| **4** | `7ab948d` + `826847d` (addon hot-fix) | PHP dead-code deletions (~260 LOC). Removed: `Meta\Validator` class, `Contracts/CheckProvider` interface, `Block\Registry::unregister_check()` + `set_check_enabled()`, `Editor\Registry::register_editor_check_for_post_types()`, `EditorDetection` `get_current_screen()` fallback, two orphan actions (`wp_validation_check_unregistered`, `wp_validation_check_toggled`), one orphan filter (`wp_validation_validate_meta`). Settings addon hot-fix restored meta-field border styling after a prior commit had broken it. |
| **5** | `c44e389` | `includes/AbstractRegistry.php` extracted. Block/Meta/Editor registries extend it. Shared: defaults merge, required-field check, level validation, `warning_msg` fallback, `namespace` stamping, priority sort, `wp_validation_check_level` filter application. Priority validation now consistent across all three scopes (was only Block). Logger trait methods changed from `private` to `protected` so subclasses inherit. |

### What's unchanged (still true)

Public API surface preserved through every batch:

- Global PHP functions: `wp_register_block_validation_check()`, `wp_register_meta_validation_check()`, `wp_register_editor_validation_check()`
- JS filter names: `editor.validateBlock`, `editor.validateMeta`, `editor.validateEditor`
- Store name: `core/validation`
- PHP hook prefix: `wp_validation_*`
- Registry singleton pattern (`::get_instance()`)
- `block_editor_settings_all` injection mechanism
- Severity model (`error` / `warning` / `none`)
- Editor context scoping (post editor only; site editor intentionally excluded)

## Polish pass

| Item | Commit | Summary |
|---|---|---|
| **1** | `561e32a` | `@example` JSDoc blocks on 13 public-API entries (6 store selectors, 5 store actions, `useMetaField`, `useMetaValidation`). Matches Gutenberg package convention. |
| **2** | `a228e5d` | TypeScript migration started: `src/store/constants.ts` with typed state, issues, action types. Stale `babel.config.json` deleted so `@wordpress/scripts`' default preset (which includes `@babel/preset-typescript`) takes effect. Incidental bundle-size drop ~94KB → ~70KB. |
| **3 + 4** | `f78624e` | Jest unit-test infrastructure (`pnpm test` via `@wordpress/scripts test-unit-js`) + 56 tests covering store reducer/actions/selectors and `issue-helpers`. All tests pass in ~1s. |

### Deferred polish (pick up before the PR)

- **Polish 5** — Unit tests for `validateBlock`, `validateMetaField`/`validateAllMetaChecks`, `validateEditor`. Requires `@wordpress/hooks` filter mocking and editor-settings mocking. Targets: `src/utils/__tests__/validate-*.test.js`.
- **Polish 5b** — Unit tests for custom hooks (`useMetaField`, `useMetaValidation`, `useInvalidBlocks`, `useInvalidMeta`, `useInvalidEditorChecks`, `useValidationIssues`, `useDebouncedValidation`, `useValidationSync`, `useValidationLifecycle`). Requires `@testing-library/react` + store test harness.
- **Polish 6** — Performance benchmarks with 200+/500+/1000+ block posts. Measure `useInvalidBlocks` timing, dispatch churn, memory of `blockValidation` store slice. Outputs inform whether to add per-block diffing or lazy validation before the PR.
- **Polish 7** — Integration / e2e tests via `@wordpress/env` + `@wordpress/e2e-test-utils-playwright`. Covers PHP registration → editor settings injection → JS validation → store dispatch → save-lock → `editor.preSavePost` gate.

## Deferred — core-PR-only changes

Changes that only make sense when translating to core-style code; they would break standalone-plugin viability. Full migration checklist in [core-pr-migration.md](core-pr-migration.md). Summary:

- PSR-4 namespaced classes → `WP_*` flat files in `lib/validation/`
- Text domain `validation-api` → `gutenberg` / `default`
- `@since 1.0.0` → target WP version
- REST namespace from `wp-validation/v1` → whatever core accepts
- CSS class prefix rename
- JS `__()` text-domain argument removal
- Sidebar mount `registerPlugin` → direct `ComplementaryArea`
- `@package ValidationAPI` → `@package gutenberg` / `@package WordPress`
- Composer PSR-4 autoload → `require_once` chain

## Sign-off

All five batches manually verified in a running WordPress instance before commit. Public API unchanged; external consumers (integration example, settings addon) work without code changes (settings addon required a fetch-path update for Batch 2, included in the same change). `pnpm test` passes (56/56). `pnpm lint:js` + `pnpm lint:php` + `pnpm lint:css` all clean. `pnpm build` produces `build/validation-api.js` + `.css` + `.asset.php`.

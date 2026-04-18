# Integration TODO

Remaining work items to prepare the Validation API plugin for a Gutenberg core proposal. The five-batch alignment plan is complete; items below cover remaining testing, performance, and future enhancements.

**See also:** [docs/gutenberg-alignment/consolidated-plan.md](gutenberg-alignment/consolidated-plan.md) for the authoritative status of alignment batches and post-batch polish items. This file and the consolidated plan intentionally overlap for the polish/future sections so either doc can orient a reader.

## Completed — alignment + polish

### Naming / structural alignment

- **Store renamed** to `core/validation`
- **JS filter hooks renamed** to `editor.validateBlock`, `editor.validateMeta`, `editor.validateEditor`
- **`window.ValidationAPI` replaced** with `block_editor_settings_all` filter. Config available via `select('core/editor').getEditorSettings().validationApi`
- **`PluginContext` dropped**. Replaced with required `namespace` field in check registration args
- **PHP functions renamed** to `wp_register_block_validation_check()`, `wp_register_meta_validation_check()`, `wp_register_editor_validation_check()`
- **PHP hooks renamed** from `validation_api_*` to `wp_validation_*`
- **REST endpoint** moved to `wp-validation/v1/checks` (plugin-owned namespace; final core namespace TBD during PR)
- **Issue model standardized** to camelCase only in JS. PHP still uses snake_case; transformation happens at the boundary in `createIssue()`
- **`window.ValidationAPI.useMetaField` export dropped**. External plugins import directly or consume via the store
- **Documentation updated** across all guide, technical, and root docs
- **Integration example plugin updated** to use new API names

### Five-batch alignment plan

- **Batch 1** — `src/` restructured to Gutenberg-package layout; renderless components converted to hooks (`useValidationSync`, `useValidationLifecycle`); `editor.preSavePost` save gate added; `useValidationIssues` consolidated hook; `useMetaField` dual `useSelect` collapsed; `getInvalid*` → `useInvalid*`; webpack aliases dropped; `package.json` `sideEffects` declared.
- **Batch 2** — REST namespace moved to `wp-validation/v1/checks`; settings addon updated in tandem.
- **Batch 3** — `Core/I18n.php` class deleted; `wp_set_script_translations()` inlined in `Core/Assets.php`.
- **Batch 4** — PHP dead-code deletions (~260 LOC): `Meta\Validator`, `Contracts/CheckProvider`, dead `Block\Registry` methods, orphan hooks, unreachable `EditorDetection` branch.
- **Batch 5** — `AbstractRegistry` base class extracted from Block/Meta/Editor registries; shared defaults, level validation, namespace stamping, priority sort, and filter application now live in one place.

### Post-batch polish

- **Polish 1** — `@example` JSDoc blocks on the public API (store selectors + actions, `useMetaField`, `useMetaValidation`).
- **Polish 2** — `src/store/constants.ts` (TypeScript start); stale `babel.config.json` deleted.
- **Polish 3 + 4** — Jest unit-test infrastructure + 56 tests covering store (reducer, actions, selectors) and `issue-helpers`. Run with `pnpm test`.

## Remaining

### Testing (the big gaps)

#### Add unit tests for validation functions

**Scope:** `validateBlock()`, `validateMetaField()` / `validateAllMetaChecks()`, `validateEditor()`

**Why deferred:** Each calls `applyFilters('editor.validate*', ...)` and reads editor settings via `getValidationConfig`. Testing well requires:
- Mocking `@wordpress/hooks` to control filter return values
- Mocking `select('core/editor').getEditorSettings()` to supply test rule payloads
- Thoughtful test scenarios (disabled checks, missing rules, chained filter callbacks)

**Files** (target): `src/utils/__tests__/validate-block.test.js`, `validate-meta.test.js`, `validate-editor.test.js`

#### Add unit tests for custom hooks

**Scope:** `useMetaField`, `useMetaValidation`, `useInvalidBlocks`, `useInvalidMeta`, `useInvalidEditorChecks`, `useValidationIssues`, `useDebouncedValidation`, `useValidationSync`, `useValidationLifecycle`

**Why deferred:** Need `@testing-library/react` for hook rendering + `@wordpress/data` store test harness. Store mocking is straightforward; block-editor mocking is the harder bit for `useInvalidBlocks`.

#### Add integration tests for the full validation flow

Full end-to-end: PHP registration → editor settings injection → JS validation → store dispatch → save-lock → `editor.preSavePost` gate. Uses `@wordpress/env` + `@wordpress/e2e-test-utils-playwright`.

**Why deferred:** Docker setup + WP test environment + Playwright infrastructure. Worth investing before the PR so reviewers can replicate.

### Performance

#### Benchmark with large posts

Test validation performance with posts containing 200+, 500+, and 1000+ blocks. Current approach validates all blocks when any block changes. Measure:
- Time for `useInvalidBlocks()` to complete
- Re-render count for `ValidationSync` (the renderless sibling that calls `useValidationSync`)
- Memory overhead of `blockValidation` store slice with many entries

If performance is an issue, consider:
- Validating only changed blocks (compare previous/current block lists)
- Lazy validation for off-screen blocks
- Batch dispatching instead of per-block dispatches

#### Audit `useEffect` dependency arrays

**Files:** `src/hooks/use-validation-sync.js`, `src/hooks/use-validation-lifecycle.js`

Verify re-computation is triggered only when relevant data changes. Batch 1 fixed a render-loop by making the sync/lifecycle hooks siblings (not hooks in the same parent); a deeper audit may find further opportunities.

### TypeScript

#### Expand beyond `constants.ts`

Constants are already typed. Next candidates, in order of type payoff:

- `src/store/reducer.js` → `.ts` — exhaustive switch on typed `Action` union
- `src/store/actions.js` → `.ts` — typed action creators
- `src/store/selectors.js` → `.ts` — typed selector returns
- `src/utils/issue-helpers.js` → `.ts` — typed helper signatures (already has JSDoc types)
- Public hooks (`useMetaField`, `useMetaValidation`) — signatures benefit consumers most
- Add JSDoc `.d.ts` for check registration args (the `$args` shape callers pass to `wp_register_*_validation_check()`)

### Future considerations (design discussions)

These are not blockers but are worth tracking for the core proposal discussion.

#### Block.json validation support

Declare simple validation rules in `block.json`:

```json
{
    "attributes": {
        "alt": {
            "type": "string",
            "validation": {
                "required": true,
                "errorMsg": "Alt text is required"
            }
        }
    }
}
```

Reduces JS boilerplate for common checks. Complex validation still uses JS filters.

#### Async validation support

Current filter hooks are synchronous (`applyFilters`). Some validation needs are inherently async (link checking, server-side content analysis). Explore using `applyFiltersAsync` for validation hooks, with loading states in the UI.

#### Site editor support

The plugin currently excludes the site editor. Template validation (required blocks in templates, valid template structure) is a related but distinct problem that would need its own design discussion.

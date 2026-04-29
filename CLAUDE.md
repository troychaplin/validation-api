# Validation API Plugin

A declarative validation framework for the WordPress block editor. Provides infrastructure for registering, executing, and displaying content validation checks — no built-in checks or settings UI.

## Architecture

Three validation scopes, each with a PHP registry and JS filter:

| Scope | PHP Registry | Registration Function | JS Filter |
|---|---|---|---|
| Block attributes | `ValidationAPI\Block\Registry` | `validation_api_register_block_check()` | `editor.validateBlock` |
| Post meta fields | `ValidationAPI\Meta\Registry` | `validation_api_register_meta_check()` | `editor.validateMeta` |
| Editor / document | `ValidationAPI\Editor\Registry` | `validation_api_register_editor_check()` | `editor.validateEditor` |

All three concrete registries extend `ValidationAPI\AbstractRegistry`, which provides shared defaults, level validation, namespace stamping, priority sort, and `validation_api_check_level` filter application.

All registration functions require `namespace`, `name`, and `error_msg` in the `$args` array. Meta checks also require `meta_key`.

### Severity

Three levels: `error` (blocks save), `warning` (shows feedback), `none` (disabled). Filterable at runtime via `validation_api_check_level`.

### Data flow

```
PHP registries (Block / Meta / Editor — all extend AbstractRegistry)
  → Assets::inject_editor_settings on block_editor_settings_all filter
    → select('core/editor').getEditorSettings().validationApi
      → utils/get-validation-config.js
        → utils/validate-block.js / validate-meta.js / validate-editor.js
          → useInvalidBlocks / useInvalidMeta / useInvalidEditorChecks (src/utils/)
            → useValidationSync dispatches → core/validation store
              → useValidationLifecycle (lockPostSaving + body CSS classes)
              → pre-save-validation (editor.preSavePost belt-and-suspenders)
              → ValidationSidebar component
              → block-validation-classes side-effect (per-block CSS)
              → validate-block side-effect (per-block toolbar button)
```

### Key PHP hooks

- `validation_api_check_level` — Override check severity at runtime (the settings-addon extension point)
- `validation_api_check_args` / `validation_api_meta_check_args` / `validation_api_editor_check_args` — Modify check config before registration
- `validation_api_should_register_check` / `_meta_check` / `_editor_check` — Prevent specific checks from registering
- `validation_api_initialized`, `validation_api_ready`, `validation_api_editor_checks_ready` — Lifecycle
- `validation_api_check_registered`, `validation_api_meta_check_registered`, `validation_api_editor_check_registered` — Post-registration notifications

### JS filters

- `editor.validateBlock` — Per-block validation
- `editor.validateMeta` — Per-meta-field validation
- `editor.validateEditor` — Editor/document-level validation
- `editor.preSavePost` — Save-time gate (async; throws to abort save if errors exist)

### JS store

Store name: `core/validation`

**Selectors** (each has an `@example` block in `src/store/selectors.js`):
`getInvalidBlocks()`, `getInvalidMeta()`, `getInvalidEditorChecks()`, `getBlockValidation(clientId)`, `hasErrors()`, `hasWarnings()`

**Actions** (each has an `@example` block in `src/store/actions.js`):
`setInvalidBlocks()`, `setInvalidMeta()`, `setInvalidEditorChecks()`, `setBlockValidation()`, `clearBlockValidation()`

### REST API

`GET /wp-validation/v1/checks` — Returns all registered checks grouped by scope (block, meta, editor). Requires `manage_options`.

## Project structure

```
includes/
  AbstractRegistry.php              # Abstract base for all three registries
  Block/Registry.php                # Block check registration
  Editor/Registry.php               # Editor-level check registration
  Meta/Registry.php                 # Meta check registration
  Core/Plugin.php                   # Plugin bootstrap
  Core/Assets.php                   # Script enqueue + block_editor_settings_all injection + wp_set_script_translations
  Core/Traits/EditorDetection.php   # Post editor context detection
  Core/Traits/Logger.php            # Shared WP_DEBUG-gated logging
  Rest/ChecksController.php         # REST endpoint

src/
  index.js                          # Package entry; imports store + hooks + styles; re-exports public API
  store/                            # core/validation @wordpress/data store
    constants.ts                    # Typed STORE_NAME, action types, State interface, Issue types
    actions.js                      # Action creators (with @example blocks)
    selectors.js                    # Selectors (with @example blocks)
    reducer.js                      # Reducer
    index.js                        # createReduxStore + register
    __tests__/                      # Unit tests (reducer, actions, selectors)
  hooks/                            # Side-effect modules + two real hooks
    index.js                        # Imports each side-effect module
    register-sidebar.js             # registerPlugin; mounts ValidationSync / ValidationLifecycle / ValidationSidebar as siblings
    use-validation-sync.js          # Hook: computes invalid results + dispatches to store (replaces the old ValidationProvider)
    use-validation-lifecycle.js     # Hook: lockPostSaving + body CSS class management (replaces the old ValidationAPI)
    validate-block.js               # Side-effect: editor.BlockEdit filter + withErrorHandling HOC + toolbar button
    block-validation-classes.js     # Side-effect: editor.BlockListBlock filter + per-block CSS classes
    pre-save-validation.js          # Side-effect: editor.preSavePost gate (async filter, throws on errors)
  components/
    validation-icon/index.js
    validation-sidebar/index.js     # PluginSidebar with grouped issue list
    validation-toolbar-button/index.js
  utils/                            # Flat utility tree
    issue-helpers.js                # createIssue, createValidationResult, hasErrors, hasWarnings (array-scope), filterIssuesByType, isCheckEnabled, getErrors, getWarnings
    get-validation-config.js        # Reads from editor settings
    validate-block.js               # Runs editor.validateBlock filter per check
    validate-meta.js                # Runs editor.validateMeta filter per check; validateAllMetaChecks aggregator
    validate-editor.js              # Runs editor.validateEditor filter per check
    use-invalid-blocks.js           # Source hook: walks the block tree, runs validateBlock, collects failures
    use-invalid-meta.js             # Source hook
    use-invalid-editor-checks.js    # Source hook
    use-validation-issues.js        # Reads aggregate state from store (C-9 consolidation)
    use-meta-field.js               # Meta field integration hook (value + onChange + help + className)
    use-meta-validation.js          # Meta validation status hook
    use-debounced-validation.js     # Immediate-then-debounce hook
    index.js                        # Barrel
    __tests__/                      # Unit tests (issue-helpers)
  styles.scss                       # Entry SCSS
  styles/                           # Partials (_variables, meta-validation, validation-sidebar, inline-indicators, inline-modal)
```

No `src/editor/` or `src/shared/`. No webpack aliases. Entry is `src/index.js`.

## Build and test

```bash
pnpm build       # wp-scripts build → build/validation-api.js
pnpm start       # wp-scripts start (watch)
pnpm test        # wp-scripts test-unit-js (Jest; 56 tests)
pnpm lint        # JS + PHP + CSS linting
pnpm format      # auto-fix prettier / phpcbf / stylelint --fix
```

TypeScript: `src/store/constants.ts` is the only `.ts` file. Other modules run as JS via `@babel/preset-typescript` (bundled in `@wordpress/babel-preset-default`). No `tsconfig.json` — editors read types from the `.ts` source directly.

## Companion plugins (same local `wp-content/plugins/`)

- **validation-api-integration-example** — Demo plugin with block, meta, and editor checks. Rebuild with `npm run build` in its directory after any JS filter-name changes.
- **validation-api-settings** — Admin settings page. Reads checks from `GET /wp-validation/v1/checks`, lets admins override severity via `validation_api_check_level`. Rebuild with `npm run build` in its directory after REST path changes.

## Conventions

- PHP registration args use snake_case (`error_msg`, `warning_msg`). JS issue objects use camelCase (`errorMsg`, `warningMsg`). Transformation happens in `createIssue()`.
- Plugin registers as `registerPlugin('core-validation', ...)` in JS.
- Editor context scoping: validation loads in post editor only (standard and template modes); site editor is intentionally excluded. Detection via the `EditorDetection` trait.
- Plugin attribution uses a `namespace` field in registration args, stored internally as `_namespace`.
- `ValidationSync` / `ValidationLifecycle` are renderless sibling wrappers around their hooks (inside the `ValidationPlugin` root). The sibling arrangement is load-bearing — putting both hooks in one parent causes a render loop because `useValidationLifecycle` subscribes to the store that `useValidationSync` dispatches to.
- PHPCS config (`phpcs.xml.dist`) allows `ValidationAPI`, `validation_api`, `wp_register`, and `wp_validation` as global prefixes.

## Integration pattern

External plugins register checks like this:

```php
add_action( 'init', function() {
    if ( ! function_exists( 'validation_api_register_block_check' ) ) {
        return;
    }

    validation_api_register_block_check( 'core/image', [
        'namespace' => 'my-plugin',
        'name'      => 'alt_text',
        'level'     => 'error',
        'error_msg' => __( 'Images must have alt text.', 'my-plugin' ),
    ] );
} );
```

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter( 'editor.validateBlock', 'my-plugin/image-alt-text',
    ( isValid, blockType, attributes, checkName ) => {
        if ( blockType !== 'core/image' || checkName !== 'alt_text' ) return isValid;
        return !! attributes.alt?.trim();
    }
);
```

## Key docs

- `docs/PR-READINESS.md` — "Where are we with the Gutenberg PR?" (start here if you're returning to this work)
- `docs/PROPOSAL.md` — Core-merge proposal (the RFC-style case for landing this in Gutenberg)
- `docs/gutenberg-alignment/consolidated-plan.md` — Execution record of the 5-batch alignment + polish pass
- `docs/gutenberg-alignment/core-pr-migration.md` — Checklist for when the core PR is actually cut
- `docs/TODO.md` — Active to-do list (testing gaps, perf benchmarks, future features)
- `docs/guide/` — Developer integration guides + troubleshooting
- `docs/technical/` — Architecture, data flow, API reference, hooks reference, decisions
- `docs/INTEGRATION.md` — Gutenberg integration context (what lands where in core)

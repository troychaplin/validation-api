# Architecture

The Validation API is a two-layer system: PHP registries that collect check definitions, and JavaScript hooks that execute validation logic in real time. This document describes the internal architecture for contributors and core reviewers.

## System Overview

```
┌──────────────────────────────────────────────────────────┐
│                     PHP (Server)                          │
│                                                           │
│  AbstractRegistry (shared logic)                          │
│       ▲        ▲         ▲                                │
│       │        │         │                                │
│  ┌────┴────┐┌──┴─────┐ ┌─┴──────┐                         │
│  │ Block   ││ Meta   │ │ Editor │                         │
│  │ Registry││Registry│ │Registry│                         │
│  └─────────┘└────────┘ └────────┘                         │
│       │        │         │                                │
│       └────────┼─────────┘                                │
│                │                                          │
│       block_editor_settings_all filter                    │
│                │                                          │
│       editorSettings.validationApi                        │
└────────────────┼──────────────────────────────────────────┘
                 │
┌────────────────┼──────────────────────────────────────────┐
│                ▼                 JS (Client)              │
│                                                           │
│  useInvalidBlocks   useInvalidMeta   useInvalidEditorChecks │
│       │                 │                   │             │
│       └────────┬────────┴───────────────────┘             │
│                │ useValidationSync dispatches             │
│                ▼                                          │
│       core/validation store                               │
│                │                                          │
│     ┌──────────┼────────────┬────────────────┐            │
│     │          │            │                │            │
│     ▼          ▼            ▼                ▼            │
│ useValidation  Sidebar    BlockList      preSavePost      │
│ Lifecycle      panel      block-classes  filter gate      │
│ (lockPost-     (issue     (red/yellow    (throws on       │
│  Saving,       list,      borders)       errors at save)  │
│  body CSS)     click-nav)                                 │
└───────────────────────────────────────────────────────────┘
```

## PHP Layer

### Plugin Initialization

The entry point is `validation_api_init_plugin()`, called on `init`. This bootstraps the `ValidationAPI\Core\Plugin` class, which:

1. Instantiates the `Assets` class and wires `block_editor_settings_all` injection
2. Resolves the three registry singletons
3. Registers the REST API controller on `rest_api_init`
4. Registers `enqueue_block_editor_assets` / `enqueue_block_assets` for script/style loading
5. Fires `validation_api_ready` (with Block Registry), `validation_api_editor_checks_ready` (with Editor Registry), and `validation_api_initialized` (with the Plugin instance)

### Registries

Each registry is a singleton (`::get_instance()`) and extends `ValidationAPI\AbstractRegistry`, which provides shared helpers for every scope:

- `normalize_args()` — defaults merge, required-field check (`error_msg`), `warning_msg` fallback, level validation, priority coercion
- `stamp_namespace()` — moves the public `namespace` arg to the internal `_namespace` key
- `sort_by_priority()` — `uasort` by the `priority` value
- `apply_level_filter()` — applies `validation_api_check_level` with a `none` short-circuit

The concrete registries differ in their storage shape and scope-specific hook names:

- **`ValidationAPI\Block\Registry`** — `checks[block_type][check_name] = config`. Filters: `validation_api_check_args`, `validation_api_should_register_check`. Action: `validation_api_check_registered`.
- **`ValidationAPI\Meta\Registry`** — `meta_checks[post_type][meta_key][check_name] = config` (3-level). Filters: `validation_api_meta_check_args`, `validation_api_should_register_meta_check`. Action: `validation_api_meta_check_registered`.
- **`ValidationAPI\Editor\Registry`** — `editor_checks[post_type][check_name] = config`. Filters: `validation_api_editor_check_args`, `validation_api_should_register_editor_check`. Action: `validation_api_editor_check_registered`.

### Namespace Field

The `namespace` field in check args tracks which plugin registered each check. All checks with the same `namespace` value are grouped together. This attribution appears in the REST API response as `_namespace` and is used by the companion settings package for admin grouping.

### Assets

The `ValidationAPI\Core\Assets` class handles:

- Enqueuing the editor JavaScript bundle via `enqueue_block_editor_assets`
- Calling `wp_set_script_translations()` for the main script handle
- Exporting check data via the `block_editor_settings_all` filter to `editorSettings.validationApi`
- Editor context detection (only post editor / post editor with template — site editor is excluded)

### REST API

The `ValidationAPI\Rest\ChecksController` registers `GET /wp-validation/v1/checks`. Permission: `manage_options`. Returns all registered checks across all three scopes, including `_namespace` attribution. Response shape:

```json
{
    "block":  { "core/image":   { "alt_text":   { ... } } },
    "meta":   { "post":         { "seo_desc":   { "required": { ... } } } },
    "editor": { "post":         { "heading_hierarchy": { ... } } }
}
```

### Traits

Two shared traits used across registry and asset classes:

- **`Core/Traits/Logger`** — Debug logging via `error_log()` when `WP_DEBUG` is enabled. Methods are `protected` so subclasses (via `AbstractRegistry`) can also log.
- **`Core/Traits/EditorDetection`** — Determines the current editor context for asset loading. Returns one of `'post-editor'`, `'post-editor-template'`, `'site-editor'`, or `'none'`.

## JavaScript Layer

### Side-effect modules (`src/hooks/`)

On package load, `src/index.js` imports `src/hooks/index.js`, which imports each side-effect module. Each module registers one filter or plugin at module scope.

- **`register-sidebar.js`** — `registerPlugin('core-validation', { render: ValidationPlugin })`. `ValidationPlugin` is a root component that renders three siblings: `<ValidationSync />`, `<ValidationLifecycle />`, `<ValidationSidebar />`. The first two are renderless wrappers around the corresponding hooks (see below); the sibling arrangement is deliberate — putting both hooks in the same parent caused a render loop (`core/validation` subscriber re-renders the parent, which re-runs the dispatcher).
- **`validate-block.js`** — `addFilter('editor.BlockEdit', 'validation-api/with-error-handling', withErrorHandling)`. Per-block validation with 300ms debounce, dispatches to the `blockValidation` store slice, renders a `<BlockControls>` toolbar button when issues exist.
- **`block-validation-classes.js`** — `addFilter('editor.BlockListBlock', 'validation-api/with-block-validation-classes', withBlockValidationClasses)`. Reads `getBlockValidation(clientId)` from the store and injects CSS classes (`validation-api-block-error`, `validation-api-block-warning`) onto the block's `wrapperProps.className`.
- **`pre-save-validation.js`** — `addFilter('editor.preSavePost', 'validation-api/pre-save-gate', async edits => ...)`. Layered on top of `lockPostSaving`: if `hasErrors()` is true at save time, throws to abort. Belt-and-suspenders against race conditions or direct save dispatches that bypass the reactive lock.

### Hooks (`src/hooks/use-validation-*.js`)

These are React hooks, not side-effect modules. They are imported by `register-sidebar.js` and called from the sibling wrappers.

- **`useValidationSync()`** — Calls `useInvalidBlocks`, `useInvalidMeta`, `useInvalidEditorChecks`. Each dispatches its result to the store via three separate `useEffect` calls. Single computation point; all downstream consumers read from the store.
- **`useValidationLifecycle()`** — `useSelect`s the aggregate arrays from the store via `useValidationIssues()`. Two `useEffect` handlers:
  - Save-locking: toggles `lockPostSaving` / `unlockPostSaving` / `lockPostAutosaving` / `disablePublishSidebar` based on whether any errors exist
  - Body classes: toggles `has-validation-errors` / `has-validation-warnings` on `document.body`

### Data Store (`core/validation`)

Centralized `@wordpress/data` store. State shape:

```js
{
  blocks: [],           // Invalid block results from useInvalidBlocks
  meta: [],             // Invalid meta results from useInvalidMeta
  editor: [],           // Editor check issues from useInvalidEditorChecks
  blockValidation: {},  // Per-block results keyed by clientId
}
```

**Selectors** (all documented with `@example` in `src/store/selectors.js`):

| Selector | Returns |
|---|---|
| `getInvalidBlocks()` | All invalid block validation results |
| `getInvalidMeta()` | All invalid meta validation results |
| `getInvalidEditorChecks()` | All editor-level validation issues |
| `getBlockValidation(clientId)` | Per-block validation result |
| `hasErrors()` | True if any error exists across all scopes |
| `hasWarnings()` | True if warnings exist (and no errors) |

**Actions** — `setInvalidBlocks`, `setInvalidMeta`, `setInvalidEditorChecks`, `setBlockValidation`, `clearBlockValidation`. All documented with `@example` in `src/store/actions.js`.

Consumers can query the store from the browser console:

```js
wp.data.select('core/validation').getInvalidBlocks()
wp.data.select('core/validation').hasErrors()
```

### Utility hooks (`src/utils/use-*.js`)

Exposed for external plugins that build custom UI:

- **`useMetaField(metaKey, originalHelp)`** — Primary hook for meta-field UI. Returns `{ value, onChange, help, className }` to spread onto a `TextControl`. Handles change dispatch and adds validation-aware classes + help text.
- **`useMetaValidation(metaKey)`** — Lower-level hook for custom meta UIs. Returns the raw validation result object.
- **`useInvalidBlocks / useInvalidMeta / useInvalidEditorChecks`** — Source hooks that compute invalid results on demand. Normally called only by `useValidationSync`; exposed in case a consumer wants the raw compute without store indirection.
- **`useValidationIssues`** — Read-only convenience wrapper around the store's three aggregate selectors in a single `useSelect` call.
- **`useDebouncedValidation`** — Generic immediate-then-debounce hook. Used internally by `validate-block.js`.

## Key Design Properties

### No storage

The core plugin has no `wp_options`, no custom tables, no settings pages. Check definitions live in PHP memory (populated on each request), exported to JS via the `block_editor_settings_all` filter. The `validation_api_check_level` filter is the extension point for runtime configuration — the companion settings package hooks into it and reads from its own `wp_options` key.

### Filter-first architecture

Every significant behavior passes through a filter:

- Check args can be modified before registration (`validation_api_check_args`)
- Checks can be prevented from registering (`validation_api_should_register_check`)
- Severity is overridable at runtime (`validation_api_check_level`)
- Validation results come from JS filters (`editor.validateBlock`, etc.)
- Save-time gating runs via `editor.preSavePost` as a safety net

### Editor context scoping

The plugin loads and runs only in post-editor contexts (standard and template modes). The site editor is intentionally excluded; template-level validation is a separate problem that would need its own design. Detection logic lives in the `EditorDetection` trait (PHP) and is mirrored in the editor settings injection (`editorSettings.validationApi.editorContext`).

### Debouncing

Per-block validation debounces at 300ms (`useDebouncedValidation`). Aggregate validation (via `useValidationSync`) does not debounce — it relies on `useSelect` reactivity, which naturally batches store updates.

### Save-locking defense in depth

Two mechanisms layer together:

1. `lockPostSaving` — reactive, fires whenever validation state changes. This is the primary mechanism and is what disables Publish/Update in the UI.
2. `editor.preSavePost` filter — runs inside the save action as an async filter. Throws if errors exist, aborting the save. Catches edge cases where the lock might not have propagated in time, or where something dispatches `savePost` directly.

### Singleton registries

All three registries (`Block`, `Meta`, `Editor`) are singletons accessed via `::get_instance()`. This matches the pattern used by `WP_Block_Type_Registry` and `WP_Connector_Registry` in Gutenberg core. They extend `ValidationAPI\AbstractRegistry`, which consolidates the repeated defaults / validation / filter plumbing.

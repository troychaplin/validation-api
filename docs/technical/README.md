# Architecture

The Validation API is a two-layer system: PHP registries that collect check definitions, and JavaScript runners that execute validation logic in real-time. This document describes the internal architecture for contributors and core reviewers.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     PHP (Server)                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Block        │  │ Meta         │  │ Editor       │  │
│  │ Registry     │  │ Registry     │  │ Registry     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │           │
│         └────────┬────────┴──────────────────┘           │
│                  │                                        │
│           wp_localize_script                              │
│                  │                                        │
│           window.ValidationAPI                            │
└──────────────────┼────────────────────────────────────────┘
                   │
┌──────────────────┼────────────────────────────────────────┐
│                  ▼            JS (Client)                  │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Block        │  │ Meta         │  │ Editor       │    │
│  │ Runner       │  │ Runner       │  │ Runner       │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │             │
│         └────────┬────────┴──────────────────┘             │
│                  │                                          │
│          ┌───────┴────────┐                                │
│          │ Data Store     │                                │
│          │ (validation-   │                                │
│          │  api)          │                                │
│          └───────┬────────┘                                │
│                  │                                          │
│     ┌────────────┼────────────┐                            │
│     │            │            │                            │
│  ┌──┴───┐  ┌────┴────┐  ┌───┴──────┐                     │
│  │Block │  │Sidebar  │  │Publish   │                     │
│  │Indic.│  │Panel    │  │Lock      │                     │
│  └──────┘  └─────────┘  └──────────┘                     │
└────────────────────────────────────────────────────────────┘
```

## PHP Layer

### Plugin Initialization

The entry point is `validation_api_init_plugin()`, called on `init`. This bootstraps the `ValidationAPI\Core\Plugin` class, which:

1. Instantiates the three registries (Block, Meta, Editor) as singletons
2. Initializes the `Assets` class for script/style loading
3. Registers the REST API controller
4. Fires `validation_api_ready` (with Block Registry) and `validation_api_editor_checks_ready` (with Editor Registry) actions
5. Fires `validation_api_initialized` when setup is complete

### Registries

Each registry is a singleton that stores check definitions:

- **`ValidationAPI\Block\Registry`** — Keyed by `block_type → check_name → config`
- **`ValidationAPI\Meta\Registry`** — Keyed by `post_type → meta_key → check_name → config`
- **`ValidationAPI\Editor\Registry`** — Keyed by `post_type → check_name → config`

All three follow the same patterns:
- Registration methods that validate input and fire `should_register_*` / `check_args` filters
- Get methods for retrieving checks by type, name, or all at once
- `get_effective_*_level()` methods that apply the `validation_api_check_level` filter

### PluginContext

The `PluginContext` class tracks which plugin is currently registering checks. When `validation_api_register_plugin()` is called, it:

1. Sets the context (`PluginContext::set()`)
2. Executes the callback or CheckProvider classes
3. Clears the context (`PluginContext::clear()`)

Checks registered during the callback automatically get a `_plugin` attribute with the plugin's name. This attribution appears in the REST API response and is used by the companion settings package.

### Assets

The `ValidationAPI\Core\Assets` class handles:

- Enqueuing the editor JavaScript bundle via `enqueue_block_editor_assets`
- Exporting check data via `wp_localize_script` to `window.ValidationAPI`
- Editor context detection (post editor, site editor, template editing)

### REST API

The `ValidationAPI\Rest\ChecksController` registers `GET /validation-api/v1/checks`. It requires `manage_options` capability and returns all registered checks across all three scopes, including `_plugin` attribution.

### Traits

Two shared traits used by registry classes:

- **`Logger`** — Debug logging via `error_log()` when `WP_DEBUG` is enabled
- **`EditorDetection`** — Determines the current editor context for asset loading

## JavaScript Layer

### Validation Runners

Three runners, one per scope. Each subscribes to relevant store changes and re-runs validation when data changes:

- **Block Runner** (`validateBlock.js`) — Watches for block attribute changes. For each block with registered checks, fires the `validation_api_validate_block` filter.
- **Meta Runner** (`validateMeta.js`) — Watches for post meta changes. For each meta key with registered checks, fires the `validation_api_validate_meta` filter.
- **Editor Runner** (`validateEditor.js`) — Watches for block list changes. Fires the `validation_api_validate_editor` filter with the full blocks array.

### Data Store

All validation state is centralized in a custom `@wordpress/data` store registered under the `validation-api` namespace. This eliminates duplicate computation and gives all consumers reactive access via selectors.

**Producers:**

- **ValidationProvider** — Renderless component that calls the three validation hooks and dispatches results into the store. This is the single place where block, meta, and editor validation is computed.
- **withErrorHandling HOC** — Dispatches per-block validation results into the store's `blockValidation` slice for CSS class application.

**State shape:**

```js
{
  blocks: [],           // Invalid block results from GetInvalidBlocks
  meta: [],             // Invalid meta results from GetInvalidMeta
  editor: [],           // Editor check issues from GetInvalidEditorChecks
  blockValidation: {},  // Per-block results keyed by clientId
}
```

**Selectors:**

| Selector | Returns |
|----------|---------|
| `getInvalidBlocks()` | All invalid block validation results |
| `getInvalidMeta()` | All invalid meta validation results |
| `getInvalidEditorChecks()` | All editor-level validation issues |
| `getBlockValidation(clientId)` | Per-block validation result |
| `hasErrors()` | True if any error exists across all types |
| `hasWarnings()` | True if any warning exists (and no errors) |

Consumers can query the store from the browser console:

```js
wp.data.select('validation-api').getInvalidBlocks()
wp.data.select('validation-api').hasErrors()
```

### Coordinator

The `ValidationAPI` component reads from the data store and manages publish locking:

- If any check fails at `error` level → `wp.data.dispatch('core/editor').lockPostSaving('validation-api')`
- When all errors resolve → `wp.data.dispatch('core/editor').unlockPostSaving('validation-api')`

### UI Components

- **withErrorHandling** — Higher-order component (via `editor.BlockEdit` filter) that runs per-block validation and renders a toolbar button when issues exist
- **withBlockValidationClasses** — Higher-order component (via `editor.BlockListBlock` filter) that reads per-block validation from the store and applies CSS classes for red/yellow borders
- **ValidationSidebar** — PluginSidebar panel that reads from the store and lists all issues, grouped by severity, with click-to-navigate to the offending block
- **Meta Field Components** — UI elements for displaying meta validation status

### Registration

The JS entry point (`register.js`) renders:
- `ValidationProvider` — Computes validation and populates the data store
- `ValidationAPI` — Reads from the store and manages save locking and body classes
- `ValidationSidebar` — Reads from the store and renders the sidebar UI

## Key Design Properties

### No Storage

The core plugin has no `wp_options`, no custom tables, no settings pages. Check definitions live in PHP memory (populated on each request), exported to JS via `wp_localize_script`. The `validation_api_check_level` filter is the extension point for runtime configuration.

### Filter-First Architecture

Every significant behavior passes through a filter:
- Check args can be modified before registration (`validation_api_check_args`)
- Checks can be prevented from registering (`validation_api_should_register_check`)
- Severity is overridable at runtime (`validation_api_check_level`)
- Validation results come from JS filters (`validation_api_validate_block`, etc.)

### Multi-Context Support

The plugin detects the editor context (`editorContext` in the localized data) and works in:
- Post editor (standard editing)
- Post editor in template mode
- Site editor (full site editing)

### Debouncing

Validation doesn't run on every keystroke. The JS runners debounce validation to avoid performance issues during rapid editing. The debounce timing is managed by the framework — integrating plugins don't need to handle this.

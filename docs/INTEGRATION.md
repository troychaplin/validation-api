# Gutenberg Integration Strategy

This document analyzes how the Validation API plugin maps to Gutenberg's architecture and outlines a strategy for proposing this framework upstream. The plugin's naming and API surface have already been aligned with Gutenberg conventions to minimize the diff when contributing upstream.

## Gutenberg's Current Validation Landscape

Gutenberg has no unified validation framework. Validation-related functionality exists as disconnected, scope-specific primitives.

### Block Markup Validation

`validateBlock(block, blockTypeOrName)` in `@wordpress/blocks` compares a block's `originalContent` against the output of `getSaveContent()`. It uses `isEquivalentHTML()` for fuzzy HTML matching and returns a `[boolean, Array<LoggerItem>]` tuple. This detects save function mismatches and triggers deprecation fallbacks -- it has nothing to do with content quality validation and is not extensible via hooks.

### Save Locking

`lockPostSaving(lockName)` and `unlockPostSaving(lockName)` in the `core/editor` store manage a `postSavingLock` state object (`{ [lockName]: true }`). The `isPostSavingLocked()` selector returns `true` if any locks exist. The post publish button disables when `isPostSavingLocked` is true. This is a binary mechanism -- no severity levels, no error messaging, no attribution of why the lock exists.

### Pre-Save Hook

`savePost()` in the `core/editor` store calls `applyFiltersAsync('editor.preSavePost', edits, options)` before the REST API call. Throwing from this filter blocks the save, but there is no structured way to report the reason to the user.

### Pre-Publish UI

`PluginPrePublishPanel` provides a slot/fill pattern for third-party panels in the pre-publish flow. It renders content via `PanelBody` with `title`, `initialOpen`, `icon`, and `className` props. It displays information only -- it does not block publication.

### Saveable / Publishable Checks

`isEditedPostSaveable()` checks if the post has a title, excerpt, or non-empty content. `isEditedPostPublishable()` checks dirty state and publication status. Neither is extensible for custom validation.

### What's Missing

- No declarative check registration
- No real-time validation feedback pattern
- No severity model beyond binary lock/unlock
- No standardized UI for validation results
- No coordination between multiple plugins doing validation
- No state management for validation results

## Component Mapping

How the Validation API's components map to Gutenberg's architecture:

### Direct Alignment (Works Today)

| Validation API | Gutenberg | Notes |
|---|---|---|
| `lockPostSaving('validation')` | `core/editor` action | Already uses the Gutenberg API directly |
| `unlockPostSaving('validation')` | `core/editor` action | Already uses the Gutenberg API directly |
| `disablePublishSidebar()` | `core/editor` action | Already uses the Gutenberg API directly |
| `@wordpress/hooks` filters | `@wordpress/hooks` package | `addFilter`/`applyFilters` used for all validation execution |
| `PluginSidebar` usage | `@wordpress/editor` slot/fill | Sidebar renders via standard slot system |
| `editor.BlockEdit` filter | `@wordpress/block-editor` filter | Used for per-block toolbar validation button |
| `editor.BlockListBlock` filter | `@wordpress/block-editor` filter | Used for per-block CSS class injection |
| `useSelect` / `useDispatch` | `@wordpress/data` hooks | Store reads/writes use standard data APIs |

### Already Aligned with Core Conventions

These items were adapted from plugin conventions to core conventions and are now complete:

| Component | Status | Details |
|---|---|---|
| Store name `core/validation` | Done | Renamed from `validation-api` |
| Editor settings config | Done | Replaced `window.ValidationAPI` with `block_editor_settings_all` filter |
| `namespace` field in check args | Done | Replaced `PluginContext` / `validation_api_register_plugin()` |
| PHP singleton registries | Done | Follows `WP_Block_Type_Registry` pattern |
| Function names `wp_register_*_validation_check()` | Done | Renamed from `validation_api_*` prefix |
| JS filter names `editor.validate*` | Done | Renamed from `validation_api_validate_*` |
| camelCase-only issue model in JS | Done | Removed dual camelCase/snake_case compatibility layer |
| REST endpoint `wp-validation/v1/checks` | Done | Plugin-owned namespace; core-PR will negotiate final location (`wp/v2/validation-checks` or `wp-block-editor/v1/*`) |

### New to Gutenberg (No Equivalent)

| Component | Purpose |
|---|---|
| `core/validation` store | Centralized validation state |
| `ValidationProvider` | Single computation point for all validation |
| `ValidationAPI` | Side-effect manager (locks, CSS classes) |
| `ValidationSidebar` | Consolidated validation results panel |
| `ValidationToolbarButton` | Per-block validation toolbar UI |
| Block/Meta/Editor registries | Declarative check registration |
| `wp_validation_check_level` filter | Runtime severity override |
| REST `wp-validation/v1/checks` | Check introspection for admin tooling |

## Packages Affected

### `@wordpress/editor` (Primary)

This is where the bulk of the integration lives:

- **Store**: Register `core/validation` store alongside `core/editor`
- **Components**: `ValidationProvider`, `ValidationSidebar`, `ValidationAPI` integrated into editor initialization via `ExperimentalEditorProvider`
- **Editor settings**: Validation config passed from PHP through the settings object that `setupEditor()` receives, via the `block_editor_settings_all` filter

### `@wordpress/block-editor`

- **`editor.BlockListBlock` filter**: Used for CSS class injection (`validation-block-error`, `validation-block-warning`)
- **`editor.BlockEdit` filter**: Used for per-block validation toolbar button
- No store changes needed -- per-block validation state lives in `core/validation`, not `core/block-editor`

### `@wordpress/blocks`

- No changes needed initially
- Future: could extend `registerBlockType()` to accept validation config in `block.json`

### `@wordpress/hooks`

- No changes needed. Validation filters use existing `addFilter`/`applyFilters` infrastructure

### PHP Side

- New file (e.g., `wp-includes/validation.php`) or extend `wp-includes/blocks.php`
- Registration functions: `wp_register_block_validation_check()`, `wp_register_meta_validation_check()`, `wp_register_editor_validation_check()`
- Registry classes following the `WP_Block_Type_Registry` singleton pattern
- Config export integrated into the editor settings bootstrap via `block_editor_settings_all`

## Current State and Upstream Strategy

The naming alignment refactor is complete. The plugin now uses core-style names for all public API surfaces. The remaining work is the actual Gutenberg contribution, structured as follows:

### Phase 1: RFC and Data Foundation

**Goal**: Establish alignment on the concept and land the state layer.

**Deliverables**:
- Gutenberg GitHub discussion / RFC post
- `core/validation` store added to `@wordpress/editor`
  - Reducer: `blocks`, `meta`, `editor`, `blockValidation` slices
  - Actions: `setInvalidBlocks`, `setInvalidMeta`, `setInvalidEditorChecks`, `setBlockValidation`, `clearBlockValidation`
  - Selectors: `getInvalidBlocks`, `getInvalidMeta`, `getInvalidEditorChecks`, `getBlockValidation`, `hasErrors`, `hasWarnings`
- Wiring: when `hasErrors()` is true, automatically call `lockPostSaving('validation')` and `disablePublishSidebar()`

**Why first**: The store is a small, isolated addition with no UI impact. It establishes the state contract that everything else builds on. Other Gutenberg features and plugins can start dispatching validation results immediately.

**Scope**: Small PR. Adds one store file, wires two existing actions.

### Phase 2: PHP Registration API

**Goal**: Land the server-side check registration system.

**Deliverables**:
- `wp_register_block_validation_check( $block_type, $args )` -- Register checks for block attributes
- `wp_register_meta_validation_check( $post_type, $args )` -- Register checks for post meta
- `wp_register_editor_validation_check( $post_type, $args )` -- Register checks for document state
- `wp_validation_check_level` filter for runtime severity override
- `wp_validation_check_args` filter for check modification before registration
- Validation config passed to JS via `block_editor_settings_all` filter

**Check args structure**:
```php
[
    'namespace'   => 'my-plugin',        // Required: attribution
    'name'        => 'alt_text',         // Required: unique within scope
    'level'       => 'error',            // 'error', 'warning', 'none'
    'error_msg'   => 'Alt text required',
    'warning_msg' => 'Alt text recommended',
    'description' => 'Human-readable description',
    'priority'    => 10,
    'enabled'     => true,
]
```

**Why second**: This is the developer-facing API. Community feedback on the shape matters most here. It needs the store from Phase 1 so config can flow to the client.

**Scope**: Medium PR. PHP functions, filters, editor settings integration.

### Phase 3: JavaScript Validation Runtime

**Goal**: Make validation functional.

**Deliverables**:
- JS filter hooks: `editor.validateBlock`, `editor.validateMeta`, `editor.validateEditor`
- `ValidationProvider` integrated into `ExperimentalEditorProvider`
- Per-block validation via `editor.BlockEdit` and `editor.BlockListBlock` filters
- Debounced validation (300ms) to prevent performance issues

**Why third**: This is where the system becomes usable. Depends on both the store (Phase 1) and config from PHP (Phase 2).

**Scope**: Large PR. May split into sub-PRs per scope (block, meta, editor).

### Phase 4: UI Components

**Goal**: Standardized validation UI in the editor.

**Deliverables**:
- Validation sidebar panel (consolidated issue list, click-to-select blocks)
- Block-level CSS class indicators via `editor.BlockListBlock`
- Per-block toolbar button via `editor.BlockEdit`
- Accessible announcements for validation state changes

**Why last**: UI is the most visible and debated. Landing it after the runtime is stable allows iteration without blocking the API.

**Scope**: Medium PR. Component-focused.

### Post-Core (Plugin Territory)

- Specific validation checks (alt text, heading hierarchy, SEO, etc.)
- Admin settings UI for severity overrides
- Async validation support
- `block.json` declarative validation rules
- Default check bundles

## Completed API Alignment

The following naming changes have been applied throughout the codebase. These reflect the current state of the plugin and the names that will be used in the Gutenberg PR.

### PHP

| Old (Plugin) | Current |
|---|---|
| `validation_api_register_plugin()` | Removed; `namespace` field in check args |
| `validation_api_register_block_check()` | `wp_register_block_validation_check()` |
| `validation_api_register_meta_check()` | `wp_register_meta_validation_check()` |
| `validation_api_register_editor_check()` | `wp_register_editor_validation_check()` |
| `validation_api_check_level` filter | `wp_validation_check_level` |
| `validation_api_check_args` filter | `wp_validation_check_args` |

### JavaScript

| Old (Plugin) | Current |
|---|---|
| `validation_api_validate_block` filter | `editor.validateBlock` |
| `validation_api_validate_meta` filter | `editor.validateMeta` |
| `validation_api_validate_editor` filter | `editor.validateEditor` |
| Store: `validation-api` | `core/validation` |
| `window.ValidationAPI` | Config via `block_editor_settings_all` filter / editor settings |

### REST API

| Old (Plugin) | Current |
|---|---|
| `validation-api/v1/checks` | `wp-validation/v1/checks` |

### Structural

1. **`PluginContext` / `validation_api_register_plugin()` removed** -- Replaced with a required `namespace` field in check registration args. Simpler, matches block registration pattern.

2. **`CheckProvider` interface dropped from public API** -- Useful for plugin organization but not needed in core API surface. Plugins can structure their own code.

3. **Issue model standardized** -- snake_case in PHP, camelCase in JS. No dual-format compatibility layer.

4. **`window.ValidationAPI` global removed** -- Config passed through editor settings via the `block_editor_settings_all` filter, which Gutenberg already handles via `ExperimentalEditorProvider`.

## Risks

1. **Performance at scale** -- Validating every block change in posts with hundreds of blocks needs benchmarking. The current debouncing (300ms) and `ValidationProvider` single-computation pattern help, but core demands higher standards.

2. **API permanence** -- Once filter names and function signatures land in core, they cannot change without deprecation cycles. The current naming has been chosen to align with existing core conventions.

3. **Scope creep** -- Discussions may pull in content linting, accessibility auditing, or editorial workflows. The framework/rules boundary must hold.

4. **Field API overlap** -- The DataViews/DataForm Field API (#71500) has its own validation model. If that pattern expands to the block editor, coordination is needed to avoid duplication.

5. **Site editor gap** -- The current implementation excludes the site editor. Template validation and global styles validation are larger problems that would need separate discussion.

## Open Questions

1. **New package or extend existing?** -- Should `core/validation` live in a new `@wordpress/validation` package or within `@wordpress/editor`?

2. **Block.json integration** -- Should simple validations (required attributes, patterns) be declarable in `block.json`?

3. **Async validation** -- Should the framework support async validators from day one, or add it later?

4. **Server-side enforcement** -- Should core provide a `Validator` helper bridging client and server validation for meta fields, or leave server-side to the REST API layer?

5. **Default checks** -- Should WordPress ship with any validation checks enabled by default?

6. **Relationship to `editor.preSavePost`** -- How does real-time validation relate to save-time validation? Separate concerns or unified framework?

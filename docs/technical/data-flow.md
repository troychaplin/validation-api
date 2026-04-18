# Data Flow

This document traces how a registered check moves from PHP registration through to JavaScript validation and UI rendering.

## Registration Phase (PHP, on `init`)

### 1. External plugin registers checks

```php
add_action( 'init', function() {
    wp_register_block_validation_check( 'core/image', [
        'namespace' => 'my-rules',
        'name'      => 'alt_text',
        'level'     => 'error',
        'error_msg' => 'Missing alt text.',
    ] );
} );
```

### 2. Normalization (shared across scopes)

The global function dispatches to `BlockRegistry::get_instance()->register_check()`. The concrete registry calls `AbstractRegistry::normalize_args()`, which:

- Merges defaults into the args (`priority: 10`, `enabled: true`, `configurable: true`, etc.)
- Requires `error_msg` (logs + returns `false` if missing)
- Falls back `warning_msg` to `error_msg`
- Validates `level` against `['error', 'warning', 'none']`
- Coerces non-numeric `priority` to `10`

### 3. Pre-registration filters

Two filters fire before storage (scope-specific names; block scope shown):

- `wp_validation_check_args` — allows modifying the check config
- `wp_validation_should_register_check` — allows preventing registration

### 4. Namespace attribution

`AbstractRegistry::stamp_namespace()` moves the public `namespace` arg to the internal `_namespace` key. All checks sharing the same `_namespace` are grouped together in the REST API response and in the companion settings UI.

### 5. Registry storage

The check lands in the registry's internal array:

```php
// Block Registry
$this->checks['core/image']['alt_text'] = [
    'error_msg'   => 'Missing alt text.',
    'warning_msg' => 'Missing alt text.',
    'level'       => 'error',
    'priority'    => 10,
    'enabled'     => true,
    'description' => '',
    'configurable'=> true,
    '_namespace'  => 'my-rules',
];
```

The registry calls `sort_by_priority()` to keep the entries in ascending priority order.

### 6. Post-registration action

After storage, the scope-specific action fires (e.g. `wp_validation_check_registered` for blocks). External plugins can hook it if they need to know when checks land.

## Export Phase (PHP → JS)

### 7. Effective-level resolution

When `Assets::inject_editor_settings()` runs on `block_editor_settings_all`, each check's registered level passes through `AbstractRegistry::apply_level_filter()`:

```php
$effective_level = apply_filters(
    'wp_validation_check_level',
    $registered_level,
    [
        'scope'      => 'block',           // or 'meta' / 'editor'
        'block_type' => 'core/image',
        'check_name' => 'alt_text',
    ]
);
```

Level `'none'` short-circuits — the filter does not fire and the check is skipped entirely in the export.

If the companion settings package (or any filter) overrides the level, the exported data reflects the override.

### 8. Editor settings via `block_editor_settings_all`

The Assets class exports all registry data to editor settings, accessible via `select('core/editor').getEditorSettings().validationApi`:

```javascript
// editorSettings.validationApi
{
    editorContext: 'post-editor',

    validationRules: {
        'core/image': {
            alt_text: {
                error_msg:   'Missing alt text.',
                warning_msg: 'Missing alt text.',
                level:       'error',    // effective level after filters
                priority:    10,
                enabled:     true,
                description: '',
            }
        }
    },

    metaValidationRules:   { /* post_type → meta_key → check_name → config */ },
    editorValidationRules: { /* post_type → check_name → config */ },
    registeredBlockTypes:  [ 'core/image' ],
}
```

This is a one-time export on editor load. The JS layer reads this data and uses it for the entire editing session.

## Validation Phase (JS, in the editor)

### 9. Source hooks compute invalid results

Three utility hooks each compute their scope's invalid results on demand:

- **`useInvalidBlocks()`** — Subscribes to `core/block-editor`. Recursively walks the block tree (or the `core/post-content` block's inner blocks in template mode), calls `validateBlock()` on each, returns the failed results.
- **`useInvalidMeta()`** — Subscribes to `core/editor` for the current post's meta. Calls `validateAllMetaChecks()` per meta key with registered rules.
- **`useInvalidEditorChecks()`** — Subscribes to `core/block-editor` for the block list and to `core/editor` for post type + title. Calls `validateEditor()` with the post type and blocks.

Each hook internally applies the scope-specific filter (`editor.validateBlock`, `editor.validateMeta`, `editor.validateEditor`) through its `validate-*` utility:

```javascript
// utils/validate-block.js (simplified)
const isValid = applyFilters(
    'editor.validateBlock',
    true,                    // default: valid
    blockType,
    attributes,
    checkName,
    block
);

if ( ! isValid ) {
    issues.push( createIssue( checkConfig, checkName ) );
}
```

### 10. Sync to the store

`useValidationSync()` (called from the `<ValidationSync />` sibling component under `ValidationPlugin`) calls the three source hooks and dispatches their results into the `core/validation` store via three separate `useEffect` blocks:

```javascript
// src/hooks/use-validation-sync.js
const invalidBlocks        = useInvalidBlocks();
const invalidMeta          = useInvalidMeta();
const invalidEditorChecks  = useInvalidEditorChecks();

const { setInvalidBlocks, setInvalidMeta, setInvalidEditorChecks }
    = useDispatch( 'core/validation' );

useEffect( () => setInvalidBlocks( invalidBlocks ),            [ invalidBlocks ] );
useEffect( () => setInvalidMeta( invalidMeta ),                [ invalidMeta ] );
useEffect( () => setInvalidEditorChecks( invalidEditorChecks ),[ invalidEditorChecks ] );
```

Separately, the `validate-block.js` side-effect module runs per-block validation in a `withErrorHandling` HOC (wired via the `editor.BlockEdit` filter) and dispatches per-block results to the store's `blockValidation` slice via `setBlockValidation(clientId, result)`.

## UI Phase (JS → DOM)

All UI-producing components read from the `core/validation` store — never from the source hooks directly. This eliminates duplicate computation and keeps renders predictable.

### 11. Save locking

`useValidationLifecycle()` (called from the `<ValidationLifecycle />` sibling) reads aggregate state via `useValidationIssues()` and toggles save-related locks in a `useEffect`:

```javascript
if ( hasBlockErrors || hasMetaErrors || hasEditorErrors ) {
    lockPostSaving( 'core/validation' );
    lockPostAutosaving( 'core/validation' );
    disablePublishSidebar();
} else {
    unlockPostSaving( 'core/validation' );
    unlockPostAutosaving( 'core/validation' );
    enablePublishSidebar();
}
```

A second `useEffect` in the same hook toggles body classes `has-validation-errors` / `has-validation-warnings` for theme/plugin styling hooks.

### 12. Save-time safety net (`editor.preSavePost`)

The `pre-save-validation.js` side-effect module adds a second gate at save time:

```javascript
addFilter( 'editor.preSavePost', 'validation-api/pre-save-gate', async edits => {
    if ( select( 'core/validation' ).hasErrors() ) {
        throw new Error( 'Validation errors must be resolved before saving.' );
    }
    return edits;
} );
```

If `lockPostSaving` is correctly in effect, this never fires. It's a belt-and-suspenders for race conditions or non-standard save paths.

### 13. Block indicators

Two side-effect modules cooperate for per-block feedback:

- **`validate-block.js`** (via `editor.BlockEdit` filter, HOC `withErrorHandling`) — Runs per-block validation with 300ms debouncing, dispatches results to the store, and renders a `<BlockControls>` toolbar button when issues exist.
- **`block-validation-classes.js`** (via `editor.BlockListBlock` filter) — Reads per-block validation from the store via `useSelect` and applies CSS classes to `wrapperProps.className`:
  - `validation-api-block-error` → at least one error-level failure
  - `validation-api-block-warning` → warning-level failures only (no errors)
  - No class → all checks pass

### 14. Sidebar panel

`<ValidationSidebar />` (rendered as the third sibling in `ValidationPlugin`) reads aggregate state via `useValidationIssues()` and renders:

- Grouped by severity (errors first, then warnings)
- Within each group, separated by scope (blocks, meta fields, editor checks)
- Click-to-navigate: clicking a block issue selects and scrolls to the offending block
- Deduplicated: multiple blocks with the same issue show once with an `(x3)` count suffix

## Summary — the full path

```
PHP registration
  → AbstractRegistry::normalize_args (defaults, level validation, required-field check)
  → wp_validation_check_args filter (scope-specific name)
  → wp_validation_should_register_check filter (scope-specific name)
  → AbstractRegistry::stamp_namespace (`namespace` → `_namespace`)
  → Registry storage + sort_by_priority
  → wp_validation_check_registered action (scope-specific name)

PHP → JS export (once, on editor load)
  → AbstractRegistry::apply_level_filter (wp_validation_check_level)
  → block_editor_settings_all → editorSettings.validationApi

JS validation (continuous, in the editor)
  → useInvalidBlocks / useInvalidMeta / useInvalidEditorChecks subscribe to
    core/block-editor and core/editor stores
  → editor.validateBlock / .validateMeta / .validateEditor filters fire
  → useValidationSync dispatches to core/validation store
  → validate-block side-effect dispatches per-block results to blockValidation slice

UI rendering (all read from core/validation store)
  → useValidationLifecycle: lockPostSaving + body CSS classes
  → pre-save-validation: editor.preSavePost gate (belt-and-suspenders)
  → block-validation-classes: per-block border CSS
  → ValidationSidebar: issue list panel
```

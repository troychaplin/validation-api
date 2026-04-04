# Data Flow

This document traces how a registered check moves from PHP registration through to JavaScript validation and UI rendering.

## Registration Phase (PHP, on `init`)

### 1. External Plugin Registers Checks

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

### 2. Namespace Attribution

The `namespace` field in the check args identifies which plugin registered the check. All checks sharing the same `namespace` are grouped together in the REST API and companion settings.

### 3. Registry Storage

The Block Registry stores the check definition:

```php
$this->checks['core/image']['alt_text'] = [
    'error_msg'   => 'Missing alt text.',
    'warning_msg' => 'Missing alt text.',  // defaults to error_msg
    'level'       => 'error',
    'priority'    => 10,
    'enabled'     => true,
    'description' => '',
    '_namespace'  => 'my-rules',
];
```

Before storage, two filters fire:
- `wp_validation_check_args` — allows modifying the check config
- `wp_validation_should_register_check` — allows preventing registration

After storage, the `wp_validation_check_registered` action fires.

### 4. Effective Level Resolution

When the Assets class exports data, each check's level is resolved through:

```php
$effective_level = apply_filters(
    'wp_validation_check_level',
    $registered_level,
    [
        'scope'      => 'block',
        'block_type' => 'core/image',
        'check_name' => 'alt_text',
    ]
);
```

If the companion settings package (or any filter) overrides the level, the exported data reflects the override.

## Export Phase (PHP → JS)

### 5. Editor Settings via block_editor_settings_all

On `block_editor_settings_all`, the Assets class exports all registry data to editor settings, accessible via `select('core/editor').getEditorSettings().validationApi`:

```javascript
// editorSettings.validationApi
{
    editorContext: 'post-editor',

    validationRules: {
        'core/image': {
            'alt_text': {
                errorMsg: 'Missing alt text.',
                warningMsg: 'Missing alt text.',
                level: 'error',         // effective level after filters
                priority: 10,
                enabled: true,
                description: '',
            }
        }
    },

    metaValidationRules: { /* post_type → meta_key → check_name → config */ },
    editorValidationRules: { /* post_type → check_name → config */ },
    registeredBlockTypes: [ 'core/image' ],
}
```

This is a one-time export. The JS layer reads this data and uses it for the entire editing session.

## Validation Phase (JS, in the editor)

### 6. Runner Initialization

When the editor loads, each runner reads its rules from the editor settings:

- Block Runner reads `validationRules`
- Meta Runner reads `metaValidationRules`
- Editor Runner reads `editorValidationRules`

### 7. Change Detection

Runners subscribe to `wp.data` store changes:

- **Block Runner** — Watches `core/block-editor` for block attribute changes
- **Meta Runner** — Watches `core/editor` for post meta changes
- **Editor Runner** — Watches `core/block-editor` for block list changes

### 8. Filter Execution

When a change is detected, the runner iterates over registered checks and fires the appropriate filter:

```javascript
// Block Runner (simplified)
for ( const [ checkName, rule ] of Object.entries( checks ) ) {
    if ( rule.level === 'none' || ! rule.enabled ) continue;

    const isValid = applyFilters(
        'editor.validateBlock',
        true,           // default: valid
        blockType,      // e.g., 'core/image'
        attributes,     // block's current attributes
        checkName,      // e.g., 'alt_text'
        block           // full block object
    );

    // Store result
}
```

### 9. Data Store Dispatch

The `ValidationProvider` component calls all three validation hooks and dispatches results into the `core/validation` data store:

```javascript
const invalidBlocks = GetInvalidBlocks();
dispatch( 'core/validation' ).setInvalidBlocks( invalidBlocks );
```

This is the single place where validation is computed. All downstream consumers read from the store via selectors, eliminating duplicate computation.

Additionally, the `withErrorHandling` HOC dispatches per-block validation results into the store's `blockValidation` slice for CSS class application on individual blocks.

## UI Phase (JS → DOM)

### 10. Publish Locking

The `ValidationAPI` component reads from the store and manages save locking:

```javascript
const hasBlockErrors = select( 'core/validation' ).hasErrors();

if ( hasBlockErrors ) {
    dispatch( 'core/editor' ).lockPostSaving( 'core-validation' );
} else {
    dispatch( 'core/editor' ).unlockPostSaving( 'core-validation' );
}
```

### 11. Block Indicators

Two HOCs work together for block-level feedback:

- **`withErrorHandling`** (via `editor.BlockEdit` filter) — Runs per-block validation with debouncing, dispatches results to the store, and renders a toolbar button when issues exist
- **`withBlockValidationClasses`** (via `editor.BlockListBlock` filter) — Reads per-block validation from the store via `useSelect` and applies CSS classes:
  - `validation-api-block-error` → at least one error-level failure
  - `validation-api-block-warning` → warning-level failures only (no errors)
  - No class → all checks pass

### 12. Sidebar Panel

The `ValidationSidebar` reads from the store and renders:
- Issues grouped by severity (errors first, then warnings)
- Each issue shows the message from `errorMsg` or `warningMsg` based on level
- Click-to-navigate: clicking an issue selects and scrolls to the block

## Summary: The Full Path

```
PHP registration
  → wp_validation_check_args filter
  → wp_validation_should_register_check filter
  → Registry storage
  → wp_validation_check_level filter (on export)
  → block_editor_settings_all → editorSettings.validationApi

JS validation
  → wp.data change detection
  → editor.validateBlock filter (or .validateMeta / .validateEditor)
  → ValidationProvider dispatches to core/validation store

UI rendering (all read from the store)
  → ValidationAPI: lockPostSaving / unlockPostSaving, body classes
  → withBlockValidationClasses: block border indicators
  → ValidationSidebar: sidebar panel
```

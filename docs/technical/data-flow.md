# Data Flow

This document traces how a registered check moves from PHP registration through to JavaScript validation and UI rendering.

## Registration Phase (PHP, on `init`)

### 1. External Plugin Registers Checks

```php
add_action( 'init', function() {
    validation_api_register_plugin(
        [ 'name' => 'My Rules' ],
        function() {
            validation_api_register_block_check( 'core/image', [
                'name'      => 'alt_text',
                'level'     => 'error',
                'error_msg' => 'Missing alt text.',
            ] );
        }
    );
} );
```

### 2. PluginContext Scoping

`validation_api_register_plugin()` wraps the callback in a context scope:

```
PluginContext::set( [ 'name' => 'My Rules' ] )
  → callback executes
  → validation_api_register_block_check() called
PluginContext::clear()
```

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
    '_plugin'     => [ 'name' => 'My Rules' ],
];
```

Before storage, two filters fire:
- `validation_api_check_args` — allows modifying the check config
- `validation_api_should_register_check` — allows preventing registration

After storage, the `validation_api_check_registered` action fires.

### 4. Effective Level Resolution

When the Assets class exports data, each check's level is resolved through:

```php
$effective_level = apply_filters(
    'validation_api_check_level',
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

### 5. wp_localize_script

On `enqueue_block_editor_assets`, the Assets class exports all registry data to `window.ValidationAPI`:

```javascript
window.ValidationAPI = {
    editorContext: 'post-editor',

    validationRules: {
        'core/image': {
            'alt_text': {
                error_msg: 'Missing alt text.',
                warning_msg: 'Missing alt text.',
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
};
```

This is a one-time export. The JS layer reads this data and uses it for the entire editing session.

## Validation Phase (JS, in the editor)

### 6. Runner Initialization

When the editor loads, each runner reads its rules from `window.ValidationAPI`:

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
        'validation_api_validate_block',
        true,           // default: valid
        blockType,      // e.g., 'core/image'
        attributes,     // block's current attributes
        checkName,      // e.g., 'alt_text'
        block           // full block object
    );

    // Store result
}
```

### 9. Result Aggregation

The Coordinator collects results from all three runners and determines:
- Which blocks have issues (and at what severity)
- Whether any error-level failures exist
- The complete list of issues for the sidebar

## UI Phase (JS → DOM)

### 10. Publish Locking

```javascript
if ( hasErrors ) {
    dispatch( 'core/editor' ).lockPostSaving( 'validation-api' );
} else {
    dispatch( 'core/editor' ).unlockPostSaving( 'validation-api' );
}
```

### 11. Block Indicators

The `withErrorHandling` HOC (registered via `editor.BlockEdit` filter) wraps each block's edit component. It reads the validation state for the block's `clientId` and renders a colored border:

- Red border → at least one error-level failure
- Yellow border → warning-level failures only (no errors)
- No border → all checks pass

### 12. Sidebar Panel

The ValidationSidebar reads the aggregated results and renders:
- Issues grouped by severity (errors first, then warnings)
- Each issue shows the message from `error_msg` or `warning_msg` based on level
- Click-to-navigate: clicking an issue selects and scrolls to the block

## Summary: The Full Path

```
PHP registration
  → validation_api_check_args filter
  → validation_api_should_register_check filter
  → Registry storage
  → validation_api_check_level filter (on export)
  → wp_localize_script → window.ValidationAPI

JS validation
  → wp.data change detection
  → validation_api_validate_block filter (or _meta / _editor)
  → Result aggregation

UI rendering
  → lockPostSaving / unlockPostSaving
  → Block border indicators
  → Sidebar panel
```

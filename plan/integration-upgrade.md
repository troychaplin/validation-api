# Integration Upgrade Guide

This document describes how to upgrade an existing integration plugin from the old Block Accessibility Checks API to the new Validation API. Use this as a checklist when updating an integration plugin.

## What Changed

The Validation API is a complete rewrite. The old plugin has been stripped down to a pure framework with a new identity, new hooks, and a simplified severity model. Here's what's different:

| Area | Old | New |
|---|---|---|
| Plugin name | Block Accessibility Checks | Validation API |
| PHP hook prefix | `ba11yc_*` | `validation_api_*` |
| JS filter prefix | `ba11yc_*` | `validation_api_*` |
| PHP namespace | `BlockAccessibility\*` | `ValidationAPI\*` |
| JS global | `window.BlockAccessibilityChecks` | `window.ValidationAPI` |
| Text domain | `block-accessibility-checks` | `validation-api` |
| Check `type` param | `settings`, `error`, `warning`, `none` | Removed. Use `level` instead. |
| Check `category` param | `accessibility`, `validation` | Removed entirely. |
| Plugin detection | Automatic via `debug_backtrace()` | Manual via `validation_api_register_plugin()` |
| Settings page | Built into the core plugin | Separate companion package |
| Registration method | `$registry->register_check()` or `$registry->register_block_check()` | Global functions: `validation_api_register_block_check()`, `validation_api_register_meta_check()`, `validation_api_register_editor_check()` wrapped in `validation_api_register_plugin()` |

## Step-by-Step Upgrade

### 1. Add the function_exists Guard

The integration must not break if the Validation API plugin is deactivated. Wrap all registration code:

```php
add_action( 'init', function() {
    if ( ! function_exists( 'validation_api_register_plugin' ) ) {
        return;
    }

    // Registration code goes here.
} );
```

### 2. Replace the Registration Hook

**Old:**
```php
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_check( ... );
} );
```

**New:**
```php
add_action( 'init', function() {
    if ( ! function_exists( 'validation_api_register_plugin' ) ) {
        return;
    }

    validation_api_register_plugin(
        [ 'name' => 'Your Plugin Name' ],
        function() {
            // Register checks here.
        }
    );
} );
```

The `validation_api_register_plugin()` wrapper declares your plugin identity once. All checks registered inside the callback are automatically attributed to your plugin in the settings companion.

### 3. Replace Check Registration Calls

**Old — Block checks:**
```php
$registry->register_check( 'my-plugin/card-block', 'card_title_required', [
    'error_msg'   => __( 'Card title is required.', 'my-plugin' ),
    'warning_msg' => __( 'Card title is recommended.', 'my-plugin' ),
    'type'        => 'settings',
    'category'    => 'validation',
] );
```

**New — Block checks:**
```php
validation_api_register_block_check( 'my-plugin/card-block', [
    'name'        => 'card_title_required',
    'level'       => 'error',
    'description' => __( 'Validates that cards have a title.', 'my-plugin' ),
    'error_msg'   => __( 'Card title is required.', 'my-plugin' ),
    'warning_msg' => __( 'Card title is recommended.', 'my-plugin' ),
] );
```

Key changes:
- `check_name` is now inside the args array as `name`, not a separate parameter
- `type` is replaced by `level` (`error`, `warning`, or `none`)
- `category` is removed entirely
- `description` is new and recommended (shown in the settings companion)

**Old — Meta checks:**
```php
$registry->register_check( 'my_meta_key', [
    'error_msg'  => __( 'Field is required.', 'my-plugin' ),
    'post_types' => [ 'post', 'page' ],
    'type'       => 'settings',
] );
```

**New — Meta checks:**
```php
validation_api_register_meta_check( 'post', [
    'name'        => 'required',
    'meta_key'    => 'my_meta_key',
    'level'       => 'error',
    'description' => __( 'My meta field is required.', 'my-plugin' ),
    'error_msg'   => __( 'This field is required.', 'my-plugin' ),
    'warning_msg' => __( 'Consider filling in this field.', 'my-plugin' ),
] );
```

Key changes:
- Post type is the first parameter, not inside the args array
- `meta_key` is now inside the args array
- Register separately per post type (or loop)

**Old — Editor checks:**
```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check( 'post', 'title_required', [
        'error_msg' => __( 'A title is required.', 'my-plugin' ),
        'type'      => 'error',
    ] );
} );
```

**New — Editor checks:**
```php
validation_api_register_editor_check( 'post', [
    'name'        => 'title_required',
    'level'       => 'error',
    'description' => __( 'Posts must have a title.', 'my-plugin' ),
    'error_msg'   => __( 'A title is required.', 'my-plugin' ),
    'warning_msg' => __( 'Consider adding a title.', 'my-plugin' ),
] );
```

### 4. Update JavaScript Filters

**Old:**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_block',
    'my-plugin/validation',
    ( isValid, blockType, attributes, checkName, block ) => {
        // validation logic
        return isValid;
    }
);
```

**New:**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'validation_api_validate_block',
    'my-plugin/validation',
    ( isValid, blockType, attributes, checkName, block ) => {
        // validation logic — same signature, just renamed filter
        return isValid;
    }
);
```

The JS filter signatures are identical — only the prefix changed:

| Old Filter | New Filter |
|---|---|
| `ba11yc_validate_block` | `validation_api_validate_block` |
| `ba11yc_validate_meta` | `validation_api_validate_meta` |
| `ba11yc_validate_editor` | `validation_api_validate_editor` |

### 5. Remove Old References

Search your integration plugin for these patterns and remove or replace them:

- `ba11yc_ready` hook references
- `ba11yc_editor_checks_ready` hook references
- `ba11yc_register_checks` hook references
- `$registry->register_check()` calls
- `$registry->register_block_check()` calls
- `$registry->register_editor_check()` calls
- `'type' => 'settings'` in check args
- `'category' => 'accessibility'` or `'category' => 'validation'` in check args
- Any references to `BlockAccessibilityChecks` or `block-accessibility-checks`
- Any references to `window.BlockAccessibilityChecks` in JavaScript

### 6. Drop the type/category Params

The `type` parameter (which had values `settings`, `error`, `warning`, `none`) is replaced by `level`:

| Old `type` | New `level` | Behavior |
|---|---|---|
| `'settings'` | `'error'` (or `'warning'`) | All checks are filterable by default via `validation_api_check_level`. No need to declare "settings" — that's now implicit. |
| `'error'` | `'error'` | Prevents saving. |
| `'warning'` | `'warning'` | Shows feedback, allows saving. |
| `'none'` | `'none'` | Check disabled. |

The `category` parameter (`accessibility`, `validation`) is removed entirely. It was only used for grouping in the old settings page.

## Severity Model

The new severity model has three levels:

```
'error'   → Prevents saving. Filter fires, can be overridden.
'warning' → Shows feedback, allows saving. Filter fires, can be overridden.
'none'    → Check disabled. Filter does NOT fire. Skipped entirely.
(omitted) → Defaults to 'error'. Filter fires, can be overridden.
```

Every active check passes through the `validation_api_check_level` filter. This means any check's severity can be overridden at runtime by another plugin or the companion settings package — without the registering plugin doing anything special.

## Complete Upgrade Example

**Old integration:**
```php
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_check( 'my-plugin/card-block', 'card_title_required', [
        'error_msg'   => __( 'Card title is required.', 'my-plugin' ),
        'warning_msg' => __( 'Card title is recommended.', 'my-plugin' ),
        'type'        => 'settings',
        'category'    => 'validation',
    ] );

    $registry->register_check( 'my-plugin/card-block', 'card_image_alt', [
        'error_msg'   => __( 'Card image needs alt text.', 'my-plugin' ),
        'warning_msg' => __( 'Consider adding alt text.', 'my-plugin' ),
        'type'        => 'settings',
        'category'    => 'accessibility',
    ] );
} );
```

**New integration:**
```php
add_action( 'init', function() {
    if ( ! function_exists( 'validation_api_register_plugin' ) ) {
        return;
    }

    validation_api_register_plugin(
        [ 'name' => 'My Card Plugin' ],
        function() {
            validation_api_register_block_check( 'my-plugin/card-block', [
                'name'        => 'card_title_required',
                'level'       => 'error',
                'description' => __( 'Validates that cards have a title.', 'my-plugin' ),
                'error_msg'   => __( 'Card title is required.', 'my-plugin' ),
                'warning_msg' => __( 'Card title is recommended.', 'my-plugin' ),
            ] );

            validation_api_register_block_check( 'my-plugin/card-block', [
                'name'        => 'card_image_alt',
                'level'       => 'error',
                'description' => __( 'Card images must have alt text.', 'my-plugin' ),
                'error_msg'   => __( 'Card image needs alt text.', 'my-plugin' ),
                'warning_msg' => __( 'Consider adding alt text.', 'my-plugin' ),
            ] );
        }
    );
} );
```

**Old JavaScript:**
```javascript
addFilter( 'ba11yc_validate_block', 'my-plugin/validation', ( isValid, blockType, attributes, checkName ) => {
    if ( blockType !== 'my-plugin/card-block' ) return isValid;
    if ( checkName === 'card_title_required' ) return !! ( attributes.title && attributes.title.trim() );
    if ( checkName === 'card_image_alt' ) return !! ( attributes.imageAlt && attributes.imageAlt.trim() );
    return isValid;
} );
```

**New JavaScript:**
```javascript
addFilter( 'validation_api_validate_block', 'my-plugin/validation', ( isValid, blockType, attributes, checkName ) => {
    if ( blockType !== 'my-plugin/card-block' ) return isValid;
    if ( checkName === 'card_title_required' ) return !! ( attributes.title && attributes.title.trim() );
    if ( checkName === 'card_image_alt' ) return !! ( attributes.imageAlt && attributes.imageAlt.trim() );
    return isValid;
} );
```

## Enterprise Pattern (Optional)

For larger integrations, use the CheckProvider interface to organize checks across files:

```php
use ValidationAPI\Contracts\CheckProvider;

class CardBlockChecks implements CheckProvider {
    public function register(): void {
        validation_api_register_block_check( 'my-plugin/card-block', [
            'name'        => 'card_title_required',
            'level'       => 'error',
            'description' => __( 'Validates that cards have a title.', 'my-plugin' ),
            'error_msg'   => __( 'Card title is required.', 'my-plugin' ),
            'warning_msg' => __( 'Card title is recommended.', 'my-plugin' ),
        ] );
    }
}

// In your plugin bootstrap:
add_action( 'init', function() {
    if ( ! function_exists( 'validation_api_register_plugin' ) ) {
        return;
    }

    validation_api_register_plugin(
        [ 'name' => 'My Card Plugin' ],
        [ CardBlockChecks::class ]
    );
} );
```

## Verification Checklist

After upgrading, verify:

- [ ] Plugin activates without errors when Validation API is active
- [ ] Plugin activates without errors when Validation API is **not** active (function_exists guard)
- [ ] Checks appear in the editor with correct error/warning indicators
- [ ] Publish locking works for error-level checks
- [ ] Warnings show feedback but allow saving
- [ ] `wp.apiFetch({ path: '/validation-api/v1/checks' })` in the browser console shows your registered checks with `_plugin` attribution
- [ ] No references to `ba11yc_*`, `BlockAccessibility`, or `block-accessibility-checks` remain

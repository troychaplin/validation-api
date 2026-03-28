# Block Checks

Block checks validate the attributes of individual blocks. If a `core/image` is missing alt text, if a `core/button` has no link, if a custom block is missing a required field — these are block checks.

## Registration (PHP)

Register a block check inside your `validation_api_register_plugin()` callback:

```php
validation_api_register_block_check( 'core/image', [
    'name'        => 'alt_text',
    'level'       => 'error',
    'description' => 'Images must have alt text',
    'error_msg'   => 'This image is missing alt text.',
    'warning_msg' => 'Consider adding alt text to this image.',
] );
```

### Parameters

The first argument is the block type name (e.g., `core/image`, `my-plugin/card`).

The second argument is an array of check configuration:

| Key | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `string` | Yes | — | Unique identifier for this check within the block type |
| `error_msg` | `string` | Yes | — | Message shown when the check fails at error level |
| `warning_msg` | `string` | No | Same as `error_msg` | Message shown when the check fails at warning level |
| `level` | `string` | No | `'error'` | Severity: `'error'`, `'warning'`, or `'none'` |
| `description` | `string` | No | `''` | Human-readable description (shown in companion settings) |
| `priority` | `int` | No | `10` | Execution order (lower runs first) |
| `enabled` | `bool` | No | `true` | Whether the check is active |

### Multiple Checks Per Block

Register as many checks as needed for a single block type:

```php
validation_api_register_block_check( 'core/image', [
    'name'        => 'alt_text',
    'level'       => 'error',
    'error_msg'   => 'This image is missing alt text.',
] );

validation_api_register_block_check( 'core/image', [
    'name'        => 'decorative_flag',
    'level'       => 'warning',
    'error_msg'   => 'Decorative images should be marked as decorative.',
    'warning_msg' => 'Consider marking this image as decorative if it has no informational value.',
] );
```

Each check needs a unique `name` within the block type.

## Validation Logic (JavaScript)

PHP registration tells the API *what* to check. JavaScript tells it *how* to check. Use the `validation_api_validate_block` filter:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'validation_api_validate_block',
    'my-plugin/image-alt',
    ( isValid, blockType, attributes, checkName, block ) => {
        if ( blockType === 'core/image' && checkName === 'alt_text' ) {
            return !! attributes.alt && attributes.alt.trim().length > 0;
        }
        return isValid;
    }
);
```

### Filter Parameters

| Parameter | Type | Description |
|---|---|---|
| `isValid` | `boolean` | Current validation state (default: `true`) |
| `blockType` | `string` | Block type name (e.g., `'core/image'`) |
| `attributes` | `object` | The block's current attributes |
| `checkName` | `string` | The check's `name` from PHP registration |
| `block` | `object` | The full block object (includes `clientId`, `innerBlocks`, etc.) |

### Return Value

Return `true` if the block passes validation, `false` if it fails. The API uses the registered `error_msg` or `warning_msg` based on the effective severity level.

### Handling Multiple Checks in One Filter

You can handle all checks for a block type in a single filter callback:

```javascript
addFilter(
    'validation_api_validate_block',
    'my-plugin/image-checks',
    ( isValid, blockType, attributes, checkName ) => {
        if ( blockType !== 'core/image' ) {
            return isValid;
        }

        switch ( checkName ) {
            case 'alt_text':
                return !! attributes.alt && attributes.alt.trim().length > 0;
            case 'decorative_flag':
                // If no alt text, should be marked decorative
                if ( ! attributes.alt || ! attributes.alt.trim() ) {
                    return !! attributes.isDecorative;
                }
                return true;
            default:
                return isValid;
        }
    }
);
```

### Always Return isValid for Unknown Checks

If your filter doesn't handle a particular `blockType`/`checkName` combination, return `isValid` unchanged. Other plugins may be providing validation for those checks.

## Enqueuing Your JavaScript

Your validation script must load in the block editor. Use the `enqueue_block_editor_assets` hook:

```php
add_action( 'enqueue_block_editor_assets', function() {
    wp_enqueue_script(
        'my-plugin-validation',
        plugins_url( 'build/validation.js', __FILE__ ),
        [ 'wp-hooks' ],
        '1.0.0',
        true
    );
} );
```

The `wp-hooks` dependency ensures `@wordpress/hooks` is available.

## The Block Object

The fifth parameter (`block`) gives you access to the full block structure:

```javascript
addFilter(
    'validation_api_validate_block',
    'my-plugin/nested-check',
    ( isValid, blockType, attributes, checkName, block ) => {
        if ( blockType === 'my-plugin/accordion' && checkName === 'has_items' ) {
            // Check that the accordion has at least one inner block
            return block.innerBlocks && block.innerBlocks.length > 0;
        }
        return isValid;
    }
);
```

This is useful for checks that depend on block structure rather than just attributes.

## What Happens at Runtime

1. The user edits a block in the editor
2. The Validation API's block runner iterates over registered checks for that block type
3. For each check, the `validation_api_validate_block` filter fires
4. Your callback returns `true` (pass) or `false` (fail)
5. Failed checks display the appropriate message based on severity
6. Error-level failures lock publishing; warnings show feedback only

The validation runs in real-time as the user edits — there's no "validate" button. Debouncing is handled by the framework.

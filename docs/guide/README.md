# Getting Started

The Validation API is a framework for the WordPress block editor. It provides registries, hooks, and UI components — you provide the rules. This guide shows you how to register checks from your own plugin.

## The Pattern

Every integration follows the same structure:

1. **Guard** — Check that the Validation API is active
2. **Register** — Declare your checks with a `namespace` field (PHP)
3. **Validate** — Implement the logic that decides pass/fail (JavaScript)

## Your First Check

This example registers an image alt text check. If a `core/image` block has no alt text, the editor shows a red error indicator and prevents publishing.

### Step 1: Register the Check (PHP)

```php
add_action( 'init', function() {
    if ( ! function_exists( 'wp_register_block_validation_check' ) ) {
        return;
    }

    wp_register_block_validation_check( 'core/image', [
        'namespace'   => 'my-content-rules',
        'name'        => 'alt_text',
        'level'       => 'error',
        'description' => 'Images must have alt text',
        'error_msg'   => 'This image is missing alt text.',
        'warning_msg' => 'Consider adding alt text to this image.',
    ] );
} );
```

### Step 2: Add Validation Logic (JavaScript)

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'editor.validateBlock',
    'my-plugin/image-alt',
    ( isValid, blockType, attributes, checkName ) => {
        if ( blockType === 'core/image' && checkName === 'alt_text' ) {
            return !! attributes.alt && attributes.alt.trim().length > 0;
        }
        return isValid;
    }
);
```

That's it. The Validation API handles the sidebar panel, block indicators, and publish locking automatically.

## Key Concepts

### The function_exists Guard

Your plugin must not break when the Validation API is deactivated. Always wrap registration in:

```php
if ( ! function_exists( 'wp_register_block_validation_check' ) ) {
    return;
}
```

This is the only dependency check you need. If `wp_register_block_validation_check` exists, the entire API is available.

### The namespace Field

The `namespace` field in the check args declares your plugin identity and scopes your checks:

```php
wp_register_block_validation_check( 'core/image', [
    'namespace' => 'my-plugin',
    'name'      => 'alt_text',
    'error_msg' => 'Alt text required.',
] );
```

- `namespace` — A string identifier for your plugin. This name appears in the REST API and the companion settings page.

All checks with the same `namespace` are grouped together as belonging to the same plugin.

### Three Scopes

The Validation API has three registries, each for a different kind of check:

| Scope | Function | What It Validates |
|---|---|---|
| Block | `wp_register_block_validation_check()` | Block attributes (alt text, links, required fields) |
| Meta | `wp_register_meta_validation_check()` | Post meta fields (SEO description, custom fields) |
| Editor | `wp_register_editor_validation_check()` | Document-level concerns (heading hierarchy, content structure) |

Each has its own PHP registration function and JS validation filter. See the dedicated guides:

- [Block Checks](block-checks.md)
- [Meta Checks](meta-checks.md)
- [Editor Checks](editor-checks.md)

### Severity Levels

Every check has a `level` that controls its behavior:

| Level | Behavior |
|---|---|
| `error` | Prevents publishing. Red indicator. |
| `warning` | Shows feedback. Yellow indicator. Allows saving. |
| `none` | Check is disabled. Skipped entirely. |
| *(omitted)* | Defaults to `error`. |

Every active check passes through the `wp_validation_check_level` filter, so any check's severity can be overridden at runtime — without modifying the registering plugin. See [Severity Model](severity.md) for details.

## What the API Provides

When you register checks, the Validation API automatically handles:

- **Real-time validation** — Checks run as users edit, not just on save
- **Block indicators** — Red (error) and yellow (warning) borders on blocks with issues
- **Validation sidebar** — All issues grouped by severity, with click-to-navigate
- **Publish locking** — Error-level checks prevent publishing via `lockPostSaving`/`unlockPostSaving`
- **REST API** — Registered checks exposed at `GET /wp-validation/v1/checks`
- **Multi-context** — Works in both the post editor and the site editor

You only write the registration and the validation logic. Everything else is handled.

## Next Steps

- [Block Checks](block-checks.md) — Most common starting point
- [Severity Model](severity.md) — Understand the filter system
- [Examples](examples.md) — Complete plugin integration examples

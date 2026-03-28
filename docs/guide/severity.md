# Severity Model

Every check in the Validation API has a severity level that controls its behavior. This page explains the three levels, how defaults work, and how to override severity at runtime using filters.

## The Three Levels

| Level | Publish | Indicator | Filter Fires |
|---|---|---|---|
| `error` | Blocked | Red border | Yes |
| `warning` | Allowed | Yellow border | Yes |
| `none` | — | — | No (check skipped) |

### error

The default level. When a check fails at `error` level, the block gets a red border, the issue appears in the sidebar, and publishing is locked via `lockPostSaving()`. The user must resolve the issue before saving.

### warning

Advisory feedback. When a check fails at `warning` level, the block gets a yellow border and the issue appears in the sidebar, but the user can still publish. Use warnings for best practices and recommendations.

### none

The check is disabled. It is skipped entirely — no validation runs, no filter fires. Use this to turn off a check without unregistering it.

### Omitted (Default)

If you don't declare a `level`, it defaults to `error`:

```php
// These are equivalent:
validation_api_register_block_check( 'core/image', [
    'name'      => 'alt_text',
    'level'     => 'error',
    'error_msg' => 'Alt text is required.',
] );

validation_api_register_block_check( 'core/image', [
    'name'      => 'alt_text',
    'error_msg' => 'Alt text is required.',
] );
```

## The validation_api_check_level Filter

This is the central mechanism for severity configuration. Every active check (level is not `none`) passes through this filter before validation runs:

```php
$effective_level = apply_filters(
    'validation_api_check_level',
    $registered_level,
    $context
);
```

### Context Parameter

The `$context` array varies by scope:

**Block checks:**
```php
[
    'scope'      => 'block',
    'block_type' => 'core/image',
    'check_name' => 'alt_text',
]
```

**Meta checks:**
```php
[
    'scope'      => 'meta',
    'post_type'  => 'post',
    'meta_key'   => 'seo_description',
    'check_name' => 'required',
]
```

**Editor checks:**
```php
[
    'scope'      => 'editor',
    'post_type'  => 'post',
    'check_name' => 'heading_hierarchy',
]
```

### Why This Matters

The filter means **every check is configurable without the registering plugin doing anything**. A plugin registers `alt_text` at `error` level, and a site admin (via the companion settings package or a custom filter) can downgrade it to `warning` or disable it with `none` — no code changes needed in the original plugin.

This is the core architectural decision: the Validation API has no settings storage. The filter is the settings mechanism.

## Overriding Severity

### Override a Specific Check

```php
add_filter( 'validation_api_check_level', function( $level, $context ) {
    // Downgrade image alt text from error to warning
    if ( $context['scope'] === 'block'
        && $context['block_type'] === 'core/image'
        && $context['check_name'] === 'alt_text'
    ) {
        return 'warning';
    }
    return $level;
}, 10, 2 );
```

### Disable a Check

```php
add_filter( 'validation_api_check_level', function( $level, $context ) {
    // Disable heading hierarchy check entirely
    if ( $context['check_name'] === 'heading_hierarchy' ) {
        return 'none';
    }
    return $level;
}, 10, 2 );
```

### Override All Checks from a Scope

```php
add_filter( 'validation_api_check_level', function( $level, $context ) {
    // Make all editor checks warnings instead of errors
    if ( $context['scope'] === 'editor' && $level === 'error' ) {
        return 'warning';
    }
    return $level;
}, 10, 2 );
```

### Override Based on Environment

```php
add_filter( 'validation_api_check_level', function( $level, $context ) {
    // In staging, downgrade all errors to warnings
    if ( wp_get_environment_type() === 'staging' && $level === 'error' ) {
        return 'warning';
    }
    return $level;
}, 10, 2 );
```

## How the Companion Settings Package Uses This

The [validation-api-settings](https://github.com/troychaplin/validation-api-settings) companion plugin provides an admin UI for overriding check severity. Under the hood, it stores overrides in `wp_options` and hooks into `validation_api_check_level`:

```php
// This is what the companion does internally:
add_filter( 'validation_api_check_level', function( $level, $context ) {
    $options = get_option( 'validation_api_settings', [] );
    $key     = $context['block_type'] . '_' . $context['check_name'];
    return $options[ $key ] ?? $level;
}, 10, 2 );
```

The core plugin has no knowledge of this. It fires the filter; the companion (or any plugin) can hook in. This separation is what makes the Validation API suitable for WordPress core — zero storage opinions in the framework.

## Best Practices

**Default to error for required checks.** If the check catches a real problem (broken accessibility, missing required content), use `error`. Reserve `warning` for recommendations and best practices.

**Always provide both messages.** Since severity can be overridden, always include both `error_msg` and `warning_msg`. If the admin downgrades your error to a warning, the warning message will be shown instead.

**Don't fight the filter.** If a site overrides your check's severity, that's by design. Your plugin should work correctly regardless of what the effective level is.

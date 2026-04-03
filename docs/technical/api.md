# API Reference

All public functions, registry methods, and contracts.

## Global Functions

### validation_api_register_plugin()

Register a plugin and its validation checks with the Validation API.

```php
validation_api_register_plugin( array $plugin_info, callable|array $checks ): void
```

| Parameter | Type | Description |
|---|---|---|
| `$plugin_info` | `array` | Plugin metadata. Required key: `'name'` (string). |
| `$checks` | `callable\|array` | A callable that registers checks, or an array of fully qualified `CheckProvider` class names. |

Sets up the plugin context, executes check registration, then clears the context. All checks registered inside the callback or providers are attributed to the plugin.

Triggers `_doing_it_wrong()` if:
- `$plugin_info` is missing the `'name'` key
- `$checks` is neither callable nor array
- A CheckProvider class doesn't exist
- A class doesn't implement `CheckProvider`

### validation_api_register_block_check()

Register a validation check for a block type.

```php
validation_api_register_block_check( string $block_type, array $args ): void
```

| Parameter | Type | Description |
|---|---|---|
| `$block_type` | `string` | Block type name (e.g., `'core/image'`). |
| `$args` | `array` | Check configuration (see [Check Arguments](#check-arguments)). |

Must be called within a `validation_api_register_plugin()` context.

### validation_api_register_meta_check()

Register a validation check for a post meta field.

```php
validation_api_register_meta_check( string $post_type, array $args ): void
```

| Parameter | Type | Description |
|---|---|---|
| `$post_type` | `string` | Post type (e.g., `'post'`, `'page'`). |
| `$args` | `array` | Check configuration. Must include `'meta_key'`. See [Check Arguments](#check-arguments). |

Must be called within a `validation_api_register_plugin()` context.

### validation_api_register_editor_check()

Register a validation check for the editor (document-level).

```php
validation_api_register_editor_check( string $post_type, array $args ): void
```

| Parameter | Type | Description |
|---|---|---|
| `$post_type` | `string` | Post type (e.g., `'post'`, `'page'`). |
| `$args` | `array` | Check configuration (see [Check Arguments](#check-arguments)). |

Must be called within a `validation_api_register_plugin()` context.

### validation_api_init_plugin()

Initialize the Validation API plugin. Called internally on `init`. Not intended for external use.

```php
validation_api_init_plugin(): void
```

## Check Arguments

All registration functions accept an `$args` array with the following keys:

| Key | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `string` | Yes | — | Unique identifier for this check within its scope |
| `error_msg` | `string` | Yes | — | Message shown when the check fails at error level |
| `warning_msg` | `string` | No | Same as `error_msg` | Message shown at warning level |
| `level` | `string` | No | `'error'` | Severity: `'error'`, `'warning'`, or `'none'` |
| `description` | `string` | No | `''` | Human-readable description (shown in REST API, companion settings) |
| `priority` | `int` | No | `10` | Execution order (lower runs first) |
| `enabled` | `bool` | No | `true` | Whether the check is active |

**Meta checks only:**

| Key | Type | Required | Description |
|---|---|---|---|
| `meta_key` | `string` | Yes | The post meta key to validate |

## Contracts

### CheckProvider

Interface for class-based check registration.

```php
namespace ValidationAPI\Contracts;

interface CheckProvider {
    /**
     * Register validation checks.
     * Called within a scoped plugin context.
     */
    public function register(): void;
}
```

Implementations call global registration functions (`validation_api_register_block_check()`, etc.) inside `register()`. All checks are attributed to the parent plugin passed to `validation_api_register_plugin()`.

## Registry Classes

These are the internal registry singletons. Most integrations should use the global functions above. Registry methods are documented here for contributors and advanced use cases.

### ValidationAPI\Block\Registry

Singleton. Access via `BlockRegistry::get_instance()`.

```php
register_check( string $block_type, string $check_name, array $check_args ): bool
unregister_check( string $block_type, string $check_name ): bool
set_check_enabled( string $block_type, string $check_name, bool $enabled ): bool
get_checks( string $block_type ): array
get_all_checks(): array
is_check_registered( string $block_type, string $check_name ): bool
get_check_config( string $block_type, string $check_name ): ?array
get_registered_block_types(): array
get_effective_check_level( string $block_type, string $check_name ): string
```

### ValidationAPI\Editor\Registry

Singleton. Access via `EditorRegistry::get_instance()`.

```php
register_editor_check( string $post_type, string $check_name, array $check_args ): bool
register_editor_check_for_post_types( array $post_types, string $check_name, array $check_args ): array
get_editor_checks( string $post_type ): array
get_all_editor_checks(): array
get_editor_check_config( string $post_type, string $check_name ): ?array
get_effective_editor_check_level( string $post_type, string $check_name ): string
```

### ValidationAPI\Meta\Registry

Singleton. Access via `MetaRegistry::get_instance()`.

```php
register_meta_check( string $post_type, string $meta_key, string $check_name, array $check_args ): bool
get_meta_checks( string $post_type ): array
get_all_meta_checks(): array
get_meta_check_config( string $post_type, string $meta_key, string $check_name ): ?array
get_effective_meta_check_level( string $post_type, string $meta_key, string $check_name ): string
```

### ValidationAPI\Meta\Validator

Static helper for server-side meta validation integrated with `register_post_meta()`.

```php
Validator::required( string $post_type, string $meta_key, array $args = [] ): callable
```

| Arg Key | Type | Default | Description |
|---|---|---|---|
| `error_msg` | `string` | `'This field is required.'` | Error message |
| `warning_msg` | `string` | `'This field is recommended.'` | Warning message |
| `level` | `string` | `'error'` | Severity level |
| `check_name` | `string` | `'required'` | Check identifier |
| `description` | `string` | `''` | Human-readable description |

Returns a `callable` for use as the `validate_callback` parameter in `register_post_meta()`. The callback:
- Returns `true` if the check passes or is disabled (`none`)
- Returns `WP_Error` if the check fails at `error` level
- Returns `true` for `warning` level failures (allows save; client-side shows the warning)

## REST API

### GET /validation-api/v1/checks

Returns all registered checks across all three scopes.

**Permission:** `manage_options`

**Response:**

```json
{
    "block": {
        "core/image": {
            "alt_text": {
                "level": "error",
                "description": "Images must have alt text",
                "error_msg": "This image is missing alt text.",
                "warning_msg": "Consider adding alt text.",
                "priority": 10,
                "enabled": true,
                "_plugin": {
                    "name": "My Rules"
                }
            }
        }
    },
    "meta": {
        "post": {
            "seo_description": {
                "required": { ... }
            }
        }
    },
    "editor": {
        "post": {
            "heading_hierarchy": { ... }
        }
    }
}
```

## Constants

### VALIDATION_API_VERSION

```php
define( 'VALIDATION_API_VERSION', '1.0.0' );
```

The current plugin version.

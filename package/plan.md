# Companion Settings Package Plan

## Vision

The `@validation-api/settings` companion package is an optional WordPress plugin that provides an admin settings page for any site using the Validation API. It reads registered checks from all three registries (Block, Meta, Editor), displays them in a modern DataForm table, and lets admins override severity levels globally. It writes to `wp_options` and bridges those values back to the core plugin via the `validation_api_check_level` filter.

The core plugin remains storage-free and settings-free — this package is the opinionated layer that stays in plugin-land forever while the core API targets Gutenberg/core merge.

---

## Core Plugin Additions (Prerequisites)

These changes must be made to the core `validation-api` plugin before the companion can be built. They add no settings UI or storage — they extend the registration API and expose data via REST.

### 1. Scoped Plugin Registration

A new global function `validation_api_register_plugin()` that allows plugin authors to declare their plugin identity once. All checks registered within the scope are automatically attributed.

**Function signature:**

```php
function validation_api_register_plugin( array $plugin_info, callable|array $checks ): void
```

**Parameters:**

- `$plugin_info` — Associative array with plugin metadata:
  - `name` (string, required) — Display name shown in the settings table Plugin column

- `$checks` — Either:
  - A `callable` (closure or function) that registers checks within the scoped context
  - An `array` of fully qualified class names implementing `CheckProvider`

**Simple callback pattern:**

```php
add_action( 'validation_api_ready', function() {
    validation_api_register_plugin(
        [ 'name' => 'My SEO Plugin' ],
        function() {
            validation_api_register_block_check( 'core/image', [
                'name'  => 'alt_text',
                'level' => 'error',
            ] );
            validation_api_register_meta_check( 'post', [
                'name'     => 'seo_desc',
                'meta_key' => '_seo_description',
            ] );
        }
    );
} );
```

**Class-based pattern (enterprise):**

```php
add_action( 'validation_api_ready', function() {
    validation_api_register_plugin(
        [ 'name' => 'Enterprise Content Rules' ],
        [
            ImageChecks::class,
            HeadingChecks::class,
            MetaChecks::class,
            EditorChecks::class,
        ]
    );
} );
```

**How it works internally:**

1. `validation_api_register_plugin()` stores `$plugin_info` in a static context variable
2. If `$checks` is a callable, it invokes the callable
3. If `$checks` is an array, it instantiates each class (must implement `CheckProvider`) and calls `register()`
4. Each `register_*_check()` call checks for an active context and stamps the check with a `_plugin` key
5. After the callable/array completes, the static context is cleared

Checks registered outside of `validation_api_register_plugin()` have no `_plugin` attribution — they display as "—" in the settings table.

### Safe Integration Pattern

Plugin authors should always guard their registration code so their plugin doesn't break if the Validation API is deactivated:

```php
add_action( 'init', function() {
    if ( ! function_exists( 'validation_api_register_plugin' ) ) {
        return;
    }

    validation_api_register_plugin(
        [ 'name' => 'My Plugin' ],
        function() {
            validation_api_register_block_check( 'core/image', [
                'name'  => 'alt_text',
                'level' => 'error',
            ] );
        }
    );
} );
```

This is the recommended integration pattern. The `function_exists` check ensures registration code is silently skipped when the Validation API plugin is not active. This follows standard WordPress conventions for optional plugin dependencies.

### 2. CheckProvider Interface

A contract for class-based check registration. Lives in the core plugin.

```php
namespace ValidationAPI\Contracts;

interface CheckProvider {
    /**
     * Register validation checks.
     *
     * Called within a scoped plugin context — all checks registered
     * here are automatically attributed to the parent plugin.
     */
    public function register(): void;
}
```

**Example implementation:**

```php
namespace MyPlugin\ValidationChecks;

use ValidationAPI\Contracts\CheckProvider;

class ImageChecks implements CheckProvider {
    public function register(): void {
        validation_api_register_block_check( 'core/image', [
            'name'        => 'alt_text',
            'level'       => 'error',
            'description' => 'Images must have alt text',
            'error_msg'   => 'This image is missing alt text.',
            'warning_msg' => 'Consider adding alt text to this image.',
        ] );

        validation_api_register_block_check( 'core/image', [
            'name'        => 'decorative',
            'level'       => 'warning',
            'description' => 'Flag potentially decorative images',
            'error_msg'   => 'Mark decorative images explicitly.',
            'warning_msg' => 'This image may be decorative.',
        ] );
    }
}
```

### 3. REST API Endpoints

The core plugin must expose registered checks via REST for the settings page to consume. These are read-only endpoints — the companion writes via its own endpoints.

**`GET /validation-api/v1/checks`**

Returns all registered checks across all three registries with plugin attribution.

```json
{
  "block": {
    "core/image": {
      "alt_text": {
        "level": "error",
        "description": "Images must have alt text",
        "error_msg": "This image is missing alt text.",
        "warning_msg": "Consider adding alt text to this image.",
        "priority": 10,
        "enabled": true,
        "_plugin": {
          "name": "My SEO Plugin"
        }
      }
    }
  },
  "meta": {
    "post": {
      "_seo_description": {
        "seo_desc": {
          "level": "warning",
          "description": "SEO description field",
          "error_msg": "SEO description is required.",
          "warning_msg": "Consider adding an SEO description.",
          "priority": 10,
          "enabled": true,
          "_plugin": {
            "name": "My SEO Plugin"
          }
        }
      }
    }
  },
  "editor": {
    "post": {
      "title_required": {
        "level": "error",
        "description": "Posts must have a title",
        "error_msg": "A title is required.",
        "warning_msg": "Consider adding a title.",
        "priority": 10,
        "enabled": true,
        "_plugin": null
      }
    }
  }
}
```

**Permissions:** `manage_options` capability required.

### Repository Structure

The companion package lives in its own Git repository, separate from the core `validation-api` plugin. During development, the companion repo is cloned inside the core plugin directory and gitignored — this allows developing both side-by-side while keeping their histories and release cycles independent.

---

## Companion Package

### What It Does

1. Registers a top-level admin menu page
2. Fetches all registered checks from `GET /validation-api/v1/checks`
3. Renders a DataForm table with severity controls
4. Saves overrides to `wp_options` via its own REST endpoint
5. Hooks `validation_api_check_level` to apply saved overrides at runtime

### Admin Page Structure

**Top-level menu:** "Validation API" (with gear icon or similar)

Single page with a DataForm in **table layout** showing all registered checks:

| Column | Source | Editable |
|---|---|---|
| Check | `check_name` | No |
| Description | `description` | No |
| Scope | Registry type + identifier (e.g., "Block: core/image") | No |
| Plugin | `_plugin.name` or "—" | No |
| Level | Current effective level | Yes (select: error / warning / none) |

The Level column uses a custom `Edit` component (`SeveritySelect`) that renders a dropdown with the three options.

### Storage

**Option key:** `validation_api_settings`

**Option value structure:**

```php
[
    'block' => [
        'core/image' => [
            'alt_text' => 'warning',  // overridden from 'error' to 'warning'
        ],
    ],
    'meta' => [
        'post' => [
            '_seo_description' => [
                'seo_desc' => 'none',  // disabled
            ],
        ],
    ],
    'editor' => [
        'post' => [
            'title_required' => 'error',  // explicitly saved
        ],
    ],
]
```

Only overrides are stored — if a check isn't in the options array, the registered default applies.

### Filter Bridge

The companion registers this filter on load:

```php
add_filter( 'validation_api_check_level', function( $level, $context ) {
    $options = get_option( 'validation_api_settings', [] );
    $scope   = $context['scope']; // 'block', 'meta', or 'editor'

    switch ( $scope ) {
        case 'block':
            $override = $options['block'][ $context['block_type'] ][ $context['check_name'] ] ?? null;
            break;
        case 'meta':
            $override = $options['meta'][ $context['post_type'] ][ $context['meta_key'] ][ $context['check_name'] ] ?? null;
            break;
        case 'editor':
            $override = $options['editor'][ $context['post_type'] ][ $context['check_name'] ] ?? null;
            break;
        default:
            $override = null;
    }

    return $override ?? $level;
}, 10, 2 );
```

This filter runs at default priority (10). Other plugins can hook at higher priority to override companion settings if needed.

### Companion REST Endpoints

**`GET /validation-api/v1/settings`**

Returns the current settings from `wp_options`.

```json
{
  "block": {
    "core/image": {
      "alt_text": "warning"
    }
  },
  "meta": {},
  "editor": {}
}
```

**`POST /validation-api/v1/settings`**

Saves settings. Accepts the full settings object (replaces the option).

**Permissions:** `manage_options` for both endpoints.

### DataForm Integration

Built on `@wordpress/dataviews` DataForm component (available in WordPress 6.9+).

**Field configuration:**

```javascript
const fields = [
    {
        id: 'check_name',
        label: __( 'Check', 'validation-api' ),
        enableGlobalSearch: true,
        enableSorting: true,
    },
    {
        id: 'description',
        label: __( 'Description', 'validation-api' ),
        enableGlobalSearch: true,
    },
    {
        id: 'scope',
        label: __( 'Scope', 'validation-api' ),
        enableSorting: true,
        elements: [
            { value: 'block', label: 'Block' },
            { value: 'meta', label: 'Meta' },
            { value: 'editor', label: 'Editor' },
        ],
    },
    {
        id: 'plugin_name',
        label: __( 'Plugin', 'validation-api' ),
        enableSorting: true,
    },
    {
        id: 'level',
        label: __( 'Level', 'validation-api' ),
        Edit: SeveritySelect,
        elements: [
            { value: 'error', label: 'Error' },
            { value: 'warning', label: 'Warning' },
            { value: 'none', label: 'Disabled' },
        ],
    },
];
```

**Data transformation:** The REST response (nested by scope/type) is flattened into a row-per-check array for DataForm consumption. Each row gets a composite `id` built from scope + identifiers (e.g., `block__core/image__alt_text`).

---

## Future Features (Not v1)

### WP-CLI Command

```bash
# Install the companion package
wp validation-api settings install

# List all registered checks and their current levels
wp validation-api settings list

# Override a check level
wp validation-api settings set block core/image alt_text warning

# Reset a check to its registered default
wp validation-api settings reset block core/image alt_text

# Export/import settings
wp validation-api settings export > settings.json
wp validation-api settings import < settings.json
```

### Per-Plugin Subpages

If a site has many plugins registering checks, the single table may become unwieldy. A future version could add subpages under the top-level menu — one per registered plugin. The `_plugin.name` attribution already supports this grouping.

### Bulk Operations

DataForm supports bulk actions. A future version could add:
- "Set all to warning" for a selected group
- "Reset to defaults" for selected checks
- "Disable all checks from [plugin]"

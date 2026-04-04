# Companion Settings Package

The Validation API is a pure framework — no settings UI, no storage, no opinions. The **[validation-api-settings](https://github.com/troychaplin/validation-api-settings)** companion plugin provides the admin layer. This document describes the two-layer architecture and why it's split this way.

## The Two Layers

### Layer 1: Validation API (core plugin)

- Three registries (Block, Meta, Editor)
- Registration functions and hooks
- JS validation runners and UI components
- `wp_validation_check_level` filter as the configuration extension point
- No `wp_options`, no settings page, no storage

### Layer 2: Settings Companion (separate plugin)

- Admin settings page built on WordPress DataForm
- Reads registered checks from the REST API
- Writes severity overrides to `wp_options`
- Hooks into `wp_validation_check_level` to apply overrides

The core plugin has no knowledge of the companion. It fires the filter; the companion hooks in. Any plugin could replace the companion with a different settings implementation.

## How the Companion Works

### Discovery

The companion reads all registered checks via the REST API:

```
GET /wp/v2/validation-checks
```

This returns every check across all scopes, including `_namespace` attribution. The companion uses this to build its settings form dynamically — no hardcoded check list.

### DataForm Integration

The companion generates a [DataForm](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/) configuration from the registered checks:

```javascript
const fields = registeredChecks.map( check => ({
    id: `${ check.blockType }_${ check.name }`,
    type: 'text',
    label: check.description,
    Edit: SeveritySelect,   // Custom component: error | warning | none
    isValid: ({ item }) => [ 'error', 'warning', 'none' ].includes( item[ check.id ] ),
}));
```

DataForm is the modern WordPress settings pattern (`@wordpress/dataviews`, available in WordPress 6.9+). Using it signals alignment with the direction the Gutenberg team is investing in.

### Storage

Severity overrides are stored in `wp_options`:

```php
// Stored as:
update_option( 'validation_api_settings', [
    'core/image_alt_text'         => 'warning',
    'core/button_has_link'        => 'none',
    'post_heading_hierarchy'      => 'error',
] );
```

### The Filter Bridge

The companion registers one filter that bridges `wp_options` to the check level system:

```php
add_filter( 'wp_validation_check_level', function( $level, $context ) {
    $options = get_option( 'validation_api_settings', [] );
    $key     = $context['block_type'] . '_' . $context['check_name'];
    return $options[ $key ] ?? $level;
}, 10, 2 );
```

This is the entire integration surface. The core plugin fires the filter on every check; the companion returns the admin-configured level if one exists, otherwise returns the registered default.

## Why This Split Matters

### For Core Merge

WordPress core will not accept:
- Admin settings pages in a validation framework (that's plugin territory)
- Hardcoded `get_option()` calls in framework code (storage opinions)
- UI components that don't use standard WordPress patterns

WordPress core will accept:
- Clean registries with hooks and filters
- A severity model overridable via filters
- Standard `block_editor_settings_all` data flow
- UI components using existing SlotFills

The split ensures the core plugin is mergeable while the settings layer stays in plugin-land.

### For Extensibility

Because the core plugin uses a filter instead of a settings page:
- The companion is optional — the API works without it
- Any plugin can override severity without the companion
- Multiple settings implementations could coexist (per-site, per-network, etc.)
- Enterprise plugins can implement their own severity logic

### For Testing

The core plugin can be tested without any storage layer. Check registration, filter execution, and validation all work in isolation. The companion only needs to test its own filter callback and DataForm rendering.

## Installation

The companion is a separate WordPress plugin:

```bash
# As a plugin
git clone https://github.com/troychaplin/validation-api-settings wp-content/plugins/validation-api-settings

# Or via Composer
composer require validation-api/settings
```

Future plans include a WP-CLI scaffolding command:

```bash
wp validation-api settings install
```

## DataForm Field Mapping

| Check Property | DataForm Field |
|---|---|
| `check_name` + `block_type` | `id` |
| `description` | `label` |
| `error_msg` | Shown in severity=error state |
| `warning_msg` | Shown in severity=warning state |
| Severity select (error/warning/none) | Custom `Edit` component |

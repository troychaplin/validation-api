# Architecture Proposal: Modular Validation API

## Vision

A two-layer architecture designed for WordPress core/Gutenberg merge:

1. **`validation-api` plugin** (the canonical/feature plugin) - Pure framework. Zero opinions. Ships the registries, hooks, JS validation runners, UI components, and post-locking. This is what merges into Gutenberg.

2. **`@validation-api/settings` companion package** - Optional, installable via CLI. Generates a modern settings page using WordPress DataForm (`@wordpress/dataviews`). This stays in plugin-land forever.

## Layer 1: The Validation API Plugin

This is the lean core. It provides:

### PHP
- 3 registries (Block, Meta, Editor) with registration + hook system
- `Meta\Validator` helper for `register_post_meta()` integration
- Asset loading + `wp_localize_script` data export
- i18n, logging, editor detection traits

### JavaScript
- 3 validation runners (block, meta, editor) that execute `@wordpress/hooks` filters
- `ValidationAPI` coordinator with `lockPostSaving` / `unlockPostSaving`
- UI: ValidationSidebar, BlockIndicator, meta field components
- Shared utils: debouncing, issue helpers

### Severity Model (simplified)

```
'error'   → Always prevents saving
'warning' → Shows feedback, allows saving
'none'    → Check disabled
```

Drop `type: 'settings'` from the core API entirely. Instead, provide a filter:

```php
// Any plugin can override severity at runtime
apply_filters( 'validation_api_check_level', $registered_level, $context );
```

Where `$context` varies by scope:
- Block: `[ 'block_type' => 'core/image', 'check_name' => 'alt_text' ]`
- Meta: `[ 'post_type' => 'post', 'meta_key' => 'seo_desc', 'check_name' => 'required' ]`
- Editor: `[ 'post_type' => 'post', 'check_name' => 'title_required' ]`

This is Option B from the earlier discussion, and it's the cleanest path for core merge -- the framework has zero storage opinions.

## Layer 2: Settings Companion (future package)

### What it does

An optional companion that any plugin using the Validation API can install to get an admin settings page for their registered checks. Built on DataForm.

### Why DataForm

DataForm from `@wordpress/dataviews` is the modern WordPress way to build settings. It's:
- Already in WordPress core (6.9+, with enhancements in 7.0)
- Declarative (field config, not component trees)
- Has built-in validation (`isValid`, pattern matching, min/max, required)
- Supports multiple layouts (panel, regular, inline)
- The direction the Gutenberg team is actively investing in

Using DataForm signals to the core team that this plugin follows modern WP patterns -- it's not inventing its own settings paradigm.

### How it works

The companion reads registered checks from the Validation API registries and auto-generates a DataForm configuration:

```javascript
// The companion auto-discovers registered checks and builds this:
const fields = registeredChecks.map( check => ({
    id: `${check.blockType}_${check.name}`,
    type: 'text', // rendered as select via custom Edit
    label: check.description,
    Edit: SeveritySelect, // custom component: error | warning | none
    isValid: ({ item }) => ['error', 'warning', 'none'].includes(item[check.id]),
}));
```

### Storage

The companion writes to `wp_options` using the REST API. The core plugin's `validation_api_check_level` filter reads from those options:

```php
// The companion registers this filter automatically
add_filter( 'validation_api_check_level', function( $level, $context ) {
    $options = get_option( 'validation_api_settings', [] );
    $key = $context['block_type'] . '_' . $context['check_name'];
    return $options[ $key ] ?? $level;
}, 10, 2 );
```

### Installation

```bash
# WP-CLI command (ships with the companion package)
wp validation-api settings install

# Or Composer
composer require validation-api/settings
```

The CLI command could:
1. Install the companion as a mu-plugin or into a known path
2. Register the filter that bridges settings storage to the API
3. Generate the admin menu page

### DataForm field mapping

| Check property | DataForm field |
|---|---|
| `check_name` + `block_type` | `id` |
| `description` | `label` |
| `error_msg` | Shown in severity=error state |
| `warning_msg` | Shown in severity=warning state |
| Severity select (error/warning/none) | Custom `Edit` component |

## Why this split matters for core merge

The WordPress core team will not accept:
- Admin settings pages in a validation framework (that's plugin territory)
- Hardcoded `get_option()` calls in framework code (storage opinions)
- `debug_backtrace()` for plugin detection (fragile, perf concern)

They *will* accept:
- Clean registries with hooks and filters
- A severity model that's overridable via filters
- Standard `wp_localize_script` data flow
- UI components using existing SlotFills
- DataForm-based companion that stays outside core

## Decisions this resolves

| Question | Answer |
|---|---|
| #6: Settings type behavior | Drop `type: 'settings'`. Use `validation_api_check_level` filter. |
| #7: Plugin detection | Remove from core. Companion can reimplement if needed. |
| Option storage | Not in the core plugin. Companion handles it. |
| Settings UI | Not in the core plugin. Companion generates via DataForm. |

## Implementation order

1. **Now**: Refactor the plugin to pure API (Phase 1-4 from refactor-plan.md)
2. **Now**: Implement the `validation_api_check_level` filter system
3. **Later**: Build the `@validation-api/settings` companion package
4. **Later**: Add WP-CLI scaffolding command
5. **Ongoing**: Align the API surface with Gutenberg conventions for core merge

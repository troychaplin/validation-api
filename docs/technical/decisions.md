# Design Decisions

All resolved design decisions for the Validation API. This is a new identity and a clean break — no backwards compatibility concerns with the predecessor plugin.

## #1 — Hook Prefix

**Decision: `validation_api_*`**

All PHP actions/filters and JS filters use the `validation_api_` prefix. The old `ba11yc_` prefix tied the plugin to "Block Accessibility Checks", which was too narrow for a general validation framework.

The prefix is descriptive, follows WordPress conventions (`{plugin_slug}_*`), and signals that this is a general-purpose validation API — not an accessibility-specific tool.

## #2 — PHP Namespace

**Decision: `ValidationAPI\*`**

All PHP classes use the `ValidationAPI` namespace. The old `BlockAccessibility` namespace had the same narrowness problem as the hook prefix.

Namespace structure:
- `ValidationAPI\Core\*` — Plugin bootstrap, assets, traits
- `ValidationAPI\Block\*` — Block registry
- `ValidationAPI\Editor\*` — Editor registry
- `ValidationAPI\Meta\*` — Meta registry and validator
- `ValidationAPI\Contracts\*` — Interfaces (CheckProvider)
- `ValidationAPI\Rest\*` — REST API controllers

## #3 — Global JS Object

**Decision: `window.ValidationAPI`**

The `wp_localize_script` data is exposed as `window.ValidationAPI`. The old `window.BlockAccessibilityChecks` was both verbose and identity-specific.

## #4 — Severity Model

**Decision: Three levels. No `type: 'settings'`. Every check is filterable.**

The old model had four explicit types: `error`, `warning`, `settings`, `none`. The `settings` type existed to mark checks as "configurable via the settings page."

The insight: **every check is inherently configurable** because every check passes through `validation_api_check_level`. You don't need to declare something as "configurable" — that's just the default behavior. The `settings` type was redundant.

New model:

| Level | Behavior |
|---|---|
| `error` | Prevents saving. Filter fires, can override. |
| `warning` | Shows feedback, allows saving. Filter fires, can override. |
| `none` | Check disabled. Filter does **not** fire. Skipped entirely. |
| *(omitted)* | Defaults to `error`. Filter fires, can override. |

The `validation_api_check_level` filter is the settings mechanism:

```php
apply_filters( 'validation_api_check_level', $registered_level, $context );
```

The companion settings package hooks into this filter and reads from `wp_options`. The core plugin has no storage — it just fires the filter. This is the Gutenberg-merge-friendly pattern: zero storage opinions in the framework.

## #5 — Plugin Detection

**Decision: Removed entirely.**

The old plugin used `debug_backtrace()` to auto-detect which plugin registered a check. This was:
- A performance concern (stack inspection on every registration)
- Fragile (sensitive to call stack depth, mu-plugins, closures)
- Only useful for grouping in the settings UI

The replacement is `validation_api_register_plugin()`, which requires plugins to declare their identity explicitly. This is cleaner, faster, and more reliable. The `_plugin` attribution appears in the REST API and companion settings.

## #6 — Text Domain

**Decision: `validation-api`**

Changed from `block-accessibility-checks`. Matches the new plugin slug and identity.

## #7 — Version Number

**Decision: Reset to `1.0.0`**

This is a new identity, not an upgrade path from the old plugin. Starting at `1.0.0` sets the right expectations for API stability and semver.

## #8 — Registration Pattern

**Decision: Global functions wrapped in `validation_api_register_plugin()`**

The old pattern required hooking into `ba11yc_ready` and calling registry methods directly:

```php
// Old
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_check( 'core/image', 'alt_text', [ ... ] );
} );
```

The new pattern uses global functions within a plugin scope:

```php
// New
validation_api_register_plugin( [ 'name' => 'My Plugin' ], function() {
    validation_api_register_block_check( 'core/image', [ ... ] );
} );
```

Benefits:
- Plugin identity is declared once, not inferred
- No need to know about registry instances
- The `function_exists` guard is clean and obvious
- CheckProvider classes can call the same global functions

## #9 — Category Parameter

**Decision: Removed entirely.**

The old `category` parameter (`'accessibility'`, `'validation'`) was only used for grouping in the settings UI. With the settings UI moved to the companion package, the core API has no need for categories. The companion can implement its own grouping logic (by plugin name, by scope, etc.) without the core API being aware of it.

## Summary

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Hook prefix | `validation_api_*` | General-purpose identity |
| 2 | PHP namespace | `ValidationAPI\*` | Matches new identity |
| 3 | JS global | `window.ValidationAPI` | Concise, matches identity |
| 4 | Severity model | 3 levels, filter-first | All checks are configurable by default |
| 5 | Plugin detection | Removed | Explicit `register_plugin()` is cleaner |
| 6 | Text domain | `validation-api` | Matches plugin slug |
| 7 | Version | `1.0.0` | Clean break, new identity |
| 8 | Registration | Global functions + plugin scope | No registry knowledge needed |
| 9 | Category param | Removed | Companion handles grouping |

# Design Decisions

All resolved design decisions for the Validation API. This is a new identity and a clean break — no backwards compatibility concerns with the predecessor plugin.

## #1 — Hook Prefix

**Decision: `validation_api_*` in the standalone plugin; `wp_*` at core merge.**

All PHP actions/filters use the `validation_api_` prefix in the standalone plugin. JS filters use `editor.*` namespacing (already core-style; no rename needed at merge). The old `ba11yc_` prefix tied the plugin to "Block Accessibility Checks", which was too narrow for a general validation framework.

The prefix history: originally chosen as `validation_api_*`. During the Gutenberg alignment refactor, hooks were renamed to the core-style `wp_*` prefix so the names would match what core would use post-merge. Submitting to the WordPress.org plugin directory then required reverting to `validation_api_*` because `wp_*` is reserved for core. The `wp_*` names will be restored as a mechanical find-and-replace at core-merge time — see [../gutenberg-alignment/core-pr-migration.md](../gutenberg-alignment/core-pr-migration.md).

## #2 — PHP Namespace

**Decision: `ValidationAPI\*`**

All PHP classes use the `ValidationAPI` namespace. The old `BlockAccessibility` namespace had the same narrowness problem as the hook prefix.

Namespace structure:
- `ValidationAPI\Core\*` — Plugin bootstrap, assets, traits
- `ValidationAPI\Block\*` — Block registry
- `ValidationAPI\Editor\*` — Editor registry
- `ValidationAPI\Meta\*` — Meta registry
- `ValidationAPI\Rest\*` — REST API controllers

## #3 — Data Export Mechanism

**Decision: `block_editor_settings_all` filter → `editorSettings.validationApi`**

Check data is exported to the editor via the `block_editor_settings_all` filter, accessible through `select('core/editor').getEditorSettings().validationApi`. This replaces the previous `wp_localize_script` / `window.ValidationAPI` approach and aligns with how WordPress core delivers editor configuration.

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

**Decision: Replaced with `namespace` field.**

The old plugin used `debug_backtrace()` to auto-detect which plugin registered a check. This was:
- A performance concern (stack inspection on every registration)
- Fragile (sensitive to call stack depth, mu-plugins, closures)
- Only useful for grouping in the settings UI

The replacement is the `namespace` field in check args, which requires plugins to declare their identity explicitly. This is cleaner, faster, and more reliable. The `_namespace` attribution appears in the REST API and companion settings.

## #6 — Text Domain

**Decision: `validation-api`**

Changed from `block-accessibility-checks`. Matches the new plugin slug and identity.

## #7 — Version Number

**Decision: Reset to `1.0.0`**

This is a new identity, not an upgrade path from the old plugin. Starting at `1.0.0` sets the right expectations for API stability and semver.

## #8 — Registration Pattern

**Decision: Flat global functions with `namespace` field**

The old pattern required hooking into `ba11yc_ready` and calling registry methods directly:

```php
// Old
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_check( 'core/image', 'alt_text', [ ... ] );
} );
```

The new pattern uses flat global functions with a `namespace` field:

```php
// New
validation_api_register_block_check( 'core/image', [
    'namespace' => 'my-plugin',
    'name'      => 'alt_text',
    'error_msg' => 'Alt text required.',
] );
```

Benefits:
- Plugin identity is declared per-check via `namespace`, not inferred
- No need to know about registry instances
- The `function_exists` guard is clean and obvious

## #9 — Category Parameter

**Decision: Removed entirely.**

The old `category` parameter (`'accessibility'`, `'validation'`) was only used for grouping in the settings UI. With the settings UI moved to the companion package, the core API has no need for categories. The companion can implement its own grouping logic (by namespace, by scope, etc.) without the core API being aware of it.

## Summary

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Hook prefix | `validation_api_*` (PHP, standalone) → `wp_*` at core merge; `editor.*` (JS, no rename) | Plugin-directory compliance now; core naming at merge |
| 2 | PHP namespace | `ValidationAPI\*` | Matches new identity |
| 3 | Data export | `block_editor_settings_all` filter | Core-aligned pattern |
| 4 | Severity model | 3 levels, filter-first | All checks are configurable by default |
| 5 | Plugin detection | `namespace` field | Explicit declaration is cleaner |
| 6 | Text domain | `validation-api` | Matches plugin slug |
| 7 | Version | `1.0.0` | Clean break, new identity |
| 8 | Registration | Flat global functions + `namespace` | No wrapper function needed |
| 9 | Category param | Removed | Companion handles grouping |

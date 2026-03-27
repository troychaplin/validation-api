# Decisions Log

All open questions from `refactor-plan.md` resolved. No backwards compatibility concerns -- this is a clean break, a new identity.

---

## #1 — Hook prefix

**Decision: Rename to `validation_api_*`**

All PHP actions and filters currently prefixed `ba11yc_` will become `validation_api_*`.

| Old | New |
|---|---|
| `ba11yc_ready` | `validation_api_ready` |
| `ba11yc_editor_checks_ready` | `validation_api_editor_checks_ready` |
| `ba11yc_plugin_initialized` | `validation_api_initialized` |
| `ba11yc_check_registered` | `validation_api_check_registered` |
| `ba11yc_check_unregistered` | `validation_api_check_unregistered` |
| `ba11yc_check_toggled` | `validation_api_check_toggled` |
| `ba11yc_editor_check_registered` | `validation_api_editor_check_registered` |
| `ba11yc_meta_check_registered` | `validation_api_meta_check_registered` |
| `ba11yc_register_default_checks` | `validation_api_register_default_checks` |
| `ba11yc_check_args` | `validation_api_check_args` |
| `ba11yc_editor_check_args` | `validation_api_editor_check_args` |
| `ba11yc_meta_check_args` | `validation_api_meta_check_args` |
| `ba11yc_should_register_check` | `validation_api_should_register_check` |
| `ba11yc_should_register_editor_check` | `validation_api_should_register_editor_check` |
| `ba11yc_should_register_meta_check` | `validation_api_should_register_meta_check` |
| `ba11yc_validate_meta` | `validation_api_validate_meta` |

**JS filters (WordPress `@wordpress/hooks`):**

| Old | New |
|---|---|
| `ba11yc_validate_block` | `validation_api_validate_block` |
| `ba11yc_validate_meta` | `validation_api_validate_meta` |
| `ba11yc_validate_editor` | `validation_api_validate_editor` |

---

## #2 — PHP Namespace

**Decision: Rename to `ValidationAPI\*`**

All PHP classes currently namespaced under `BlockAccessibility\*` become `ValidationAPI\*`.

| Old | New |
|---|---|
| `BlockAccessibility\Core\Plugin` | `ValidationAPI\Core\Plugin` |
| `BlockAccessibility\Core\Assets` | `ValidationAPI\Core\Assets` |
| `BlockAccessibility\Core\I18n` | `ValidationAPI\Core\I18n` |
| `BlockAccessibility\Core\Traits\Logger` | `ValidationAPI\Core\Traits\Logger` |
| `BlockAccessibility\Core\Traits\EditorDetection` | `ValidationAPI\Core\Traits\EditorDetection` |
| `BlockAccessibility\Block\Registry` | `ValidationAPI\Block\Registry` |
| `BlockAccessibility\Editor\Registry` | `ValidationAPI\Editor\Registry` |
| `BlockAccessibility\Meta\Registry` | `ValidationAPI\Meta\Registry` |
| `BlockAccessibility\Meta\Validator` | `ValidationAPI\Meta\Validator` |

Update `composer.json` autoload PSR-4 map accordingly.

---

## #3 — Global JS Object

**Decision: Rename to `window.ValidationAPI`**

The `wp_localize_script` data object currently exposed as `window.BlockAccessibilityChecks` becomes `window.ValidationAPI`.

---

## #4 — Severity Model (no explicit `type: 'settings'`)

**Decision: `'settings'` is removed as a declared type. Configurable behavior is the implicit default.**

The old severity model had 4 explicit types: `error`, `warning`, `settings`, `none`.

The new model has 3 explicit levels -- and the key insight is that **you don't need to declare something as "configurable", that's just what the default is**. Every registered check goes through `validation_api_check_level`, so every check is inherently overridable.

### New severity model

| Declared `level` | Behavior |
|---|---|
| *(omitted / not declared)* | Defaults to `'error'` as the filter fallback. The `validation_api_check_level` filter fires and can override. |
| `'error'` | Registered default is `error`. Filter fires and can override. |
| `'warning'` | Registered default is `warning`. Filter fires and can override. |
| `'none'` | Check is disabled. Filter does **not** fire. Check is skipped entirely. |

### The filter is the settings mechanism

```php
// The core API fires this for every active check:
$effective_level = apply_filters(
    'validation_api_check_level',
    $registered_level, // 'error', 'warning', or 'error' if omitted
    $context           // [ 'scope' => 'block', 'block_type' => 'core/image', 'check_name' => 'alt_text' ]
);
```

The companion settings package hooks into this filter and reads from `wp_options`. The core plugin has no storage -- it just fires the filter. Any plugin can hook in. This is the correct Gutenberg-merge-friendly pattern.

### Registration examples

```php
// Explicit error -- locked, but filter can still override
validation_api_register_block_check( 'core/image', [
    'name'  => 'alt_text',
    'level' => 'error',
] );

// Explicit warning
validation_api_register_block_check( 'core/image', [
    'name'  => 'alt_text',
    'level' => 'warning',
] );

// No level declared -- same as 'error' by default, fully overridable via filter
validation_api_register_block_check( 'core/image', [
    'name' => 'alt_text',
] );

// Disabled
validation_api_register_block_check( 'core/image', [
    'name'  => 'alt_text',
    'level' => 'none',
] );
```

---

## #5 — Plugin Detection

**Decision: Remove entirely.**

The `detect_plugin_info()` / `find_main_plugin_file()` methods in `Block\Registry` that use `debug_backtrace()` to auto-detect which plugin registered a check are removed. This was only useful for auto-grouping in the settings UI.

External integrations that want grouping in their own settings pages are responsible for tracking that themselves when they register checks.

---

## #6 — Text Domain

**Decision: Change to `validation-api`**

The text domain `block-accessibility-checks` becomes `validation-api` everywhere: PHP `load_plugin_textdomain()`, `plugin header`, and all `__()`, `_e()`, `esc_html__()` calls.

---

## #7 — Version Number

**Decision: Reset to `1.0.0`**

This is a new identity, not an upgrade path. Starting at `1.0.0` is correct and sets the right expectations for consumers of this API going forward.

---

## Summary table

| # | Question | Decision |
|---|---|---|
| 1 | Hook prefix | `validation_api_*` |
| 2 | PHP namespace | `ValidationAPI\*` |
| 3 | JS global | `window.ValidationAPI` |
| 4 | `type: 'settings'` | Removed. All checks are filterable by default via `validation_api_check_level`. |
| 5 | Plugin detection | Removed entirely. |
| 6 | Text domain | `validation-api` |
| 7 | Version | Reset to `1.0.0` |

# Refactor Plan: Validation API Plugin

## Goal

Strip this plugin down to a pure **Validation API framework** that provides the 3 validation scopes (block attributes, post meta, block editor) with zero built-in checks, zero settings UI, and zero accessibility-specific code. The plugin becomes infrastructure only -- external plugins provide the rules.

## What stays (the API framework)

### PHP

1. **3 Registries** (singleton pattern, hooks, filters)
   - `Block\Registry` - `register_check()`, `register_block_check()`, `get_effective_check_level()`
   - `Meta\Registry` - `register_meta_check()`, `get_effective_meta_check_level()`
   - `Editor\Registry` - `register_editor_check()`, `get_effective_editor_check_level()`

2. **Meta\Validator** - Static helper for `register_post_meta()` integration

3. **Core\Plugin** - Initialization orchestrator (simplified)

4. **Core\Assets** - Script/style enqueue + `wp_localize_script` data export

5. **Core\I18n** - Text domain

6. **Traits** - Logger, EditorDetection

### JavaScript

1. **Validation runners** - `validateBlock.js`, `validateMeta.js`, `validateEditor.js`
2. **ValidationAPI.js** - Coordinator + post locking
3. **UI components** - ValidationSidebar, BlockIndicator
4. **Meta hooks** - useMetaField, useMetaValidation
5. **Shared utils** - getInvalidBlocks, getInvalidMeta, getInvalidEditorChecks, issueHelpers, useDebouncedValidation
6. **HOC** - withErrorHandling

### Hooks (the public API surface)

**PHP Actions:**
- `ba11yc_ready` (or renamed) - Register block checks
- `ba11yc_editor_checks_ready` (or renamed) - Register editor checks
- `ba11yc_plugin_initialized`
- `ba11yc_check_registered`, `ba11yc_check_unregistered`, `ba11yc_check_toggled`
- `ba11yc_editor_check_registered`
- `ba11yc_meta_check_registered`

**PHP Filters:**
- `ba11yc_register_default_checks`
- `ba11yc_check_args`, `ba11yc_editor_check_args`, `ba11yc_meta_check_args`
- `ba11yc_should_register_check`, `ba11yc_should_register_editor_check`, `ba11yc_should_register_meta_check`
- `ba11yc_validate_meta` (server-side)

**JS Filters:**
- `ba11yc_validate_block`
- `ba11yc_validate_meta`
- `ba11yc_validate_editor`

## What gets removed

### PHP
- `Core\Settings.php` - Entire admin settings page system
- `Core\SettingsAPI.php` - REST API for settings
- `Block\CoreChecks.php` - Built-in core block check definitions
- `Block\HeadingLevels.php` - Heading level restriction feature
- `Editor\CoreChecks.php` - Built-in editor check definitions

### JavaScript
- `src/admin/*` - All settings page React apps (CoreBlocks, EditorValidation, ExternalPlugins)
- `src/editor/validation/blocks/validators/*` - button.js, image.js, heading.js, table.js, headingListener.js
- `src/editor/validation/editor/validators/*` - postTitle.js
- `src/editor/modifications/imageAttributes.js`
- `src/shared/utils/isValidUrl.js`

### Build
- Webpack entries for settings pages (`settings-core-blocks`, `settings-editor-validation`, `settings-external-plugins`)
- Admin CSS (`block-admin.css`, `settings.scss`, `admin.scss`)

## Execution phases

### Phase 1: Clean PHP
1. Remove `Block\CoreChecks.php`
2. Remove `Block\HeadingLevels.php`
3. Remove `Editor\CoreChecks.php`
4. Remove `Core\Settings.php`
5. Remove `Core\SettingsAPI.php`
6. Update `Core\Plugin.php` - Remove heading levels init, settings init, core checks init
7. Update `Block\Registry.php` - Remove `init_core_block_checks()` from constructor
8. Update `Core\Assets.php` - Remove admin styles, simplify

### Phase 2: Clean JavaScript
1. Remove `src/admin/` directory entirely
2. Remove `src/editor/validation/blocks/validators/` directory
3. Remove `src/editor/validation/editor/validators/` directory
4. Remove `src/editor/modifications/imageAttributes.js`
5. Remove `src/shared/utils/isValidUrl.js`
6. Update imports in index files

### Phase 3: Clean build config
1. Update `webpack.config.js` - Remove settings entry points
2. Update `package.json` - name, description

### Phase 4: Rebrand
1. Update `validation-api.php` - Plugin header, version → `1.0.0`, text domain → `validation-api`, constants
2. Update all PHP namespaces from `BlockAccessibility\*` → `ValidationAPI\*`
3. Update all hook prefixes from `ba11yc_` → `validation_api_`
4. Update `wp_localize_script` object name → `window.ValidationAPI`
5. Update `composer.json` PSR-4 autoload map
6. Update text domain in all `__()`, `_e()`, `esc_html__()` calls

### Phase 5: Clean up registries
1. `Block\Registry` - Remove `detect_plugin_info()` / `find_main_plugin_file()` (plugin detection gone)
2. `Block\Registry` - Replace `get_effective_check_level()` `get_option()` lookup with `validation_api_check_level` filter
3. `Meta\Registry` - Same: replace settings lookup with `validation_api_check_level` filter
4. `Editor\Registry` - Same: replace settings lookup with `validation_api_check_level` filter
5. All registries - Remove `type: 'settings'` handling; treat omitted `level` as `'error'` default passed to filter

## Decisions

All open questions have been resolved. See `decisions.md` for the full log. Summary:

1. **Hook prefix** → `validation_api_*` (all `ba11yc_*` hooks renamed)
2. **PHP namespace** → `ValidationAPI\*` (all `BlockAccessibility\*` renamed)
3. **JS global** → `window.ValidationAPI` (was `window.BlockAccessibilityChecks`)
4. **Severity model** → `type: 'settings'` removed. 3 levels: `error`, `warning`, `none`. All checks are filterable via `validation_api_check_level`. Omitting `level` defaults to `'error'`. See below.
5. **Plugin detection** → Removed entirely (`debug_backtrace()` approach gone)
6. **Text domain** → `validation-api`
7. **Version** → Reset to `1.0.0`

### New severity model

```
'error'   → Prevents saving. Filter fires, can be overridden.
'warning' → Shows feedback, allows saving. Filter fires, can be overridden.
'none'    → Check disabled. Filter does NOT fire.
(omitted) → Same as 'error'. Filter fires, can be overridden.
```

The `validation_api_check_level` filter is the entire settings mechanism. The core plugin has no storage. Any plugin (or the future companion package) hooks in to provide admin-configurable levels:

```php
apply_filters(
    'validation_api_check_level',
    $registered_level,  // 'error' | 'warning' | 'error' (default if omitted)
    $context            // array with scope, identifiers
);
```

# Refactor Todo

Checklist, verifications, and manual tests per phase. Check off as you go.

---

## Phase 1: Clean PHP

### Tasks
- [x] Delete `includes/Block/CoreChecks.php`
- [x] Delete `includes/Block/HeadingLevels.php`
- [x] Delete `includes/Editor/CoreChecks.php`
- [x] Delete `includes/Core/Settings.php`
- [x] Delete `includes/Core/SettingsAPI.php`
- [x] `includes/Core/Plugin.php` — Remove `use BlockAccessibility\\Block\\HeadingLevels`
- [x] `includes/Core/Plugin.php` — Remove `use BlockAccessibility\\Editor\\CoreChecks as EditorCoreChecks`
- [x] `includes/Core/Plugin.php` — Remove `init_heading_levels()` method and its constructor call
- [x] `includes/Core/Plugin.php` — Remove `init_settings_page()` method and its call in `init()`
- [x] `includes/Core/Plugin.php` — Remove `use Settings` and `use SettingsAPI` from `init_settings_page()`
- [x] `includes/Core/Plugin.php` — Remove `$editor_core_checks` instantiation from `init_editor_checks_registry()`
- [x] `includes/Core/Plugin.php` — Remove `get_heading_levels()` accessor method
- [x] `includes/Core/Plugin.php` — Update `display_initialization_error()` text domain (completed in Phase 4)
- [x] `includes/Core/Assets.php` — Remove `private const ADMIN_STYLE_PATH`
- [x] `includes/Core/Assets.php` — Remove `enqueue_admin_assets()` method
- [x] `includes/Core/Assets.php` — Remove `enqueue_admin_styles()` method (enqueues `block-admin.css`)
- [x] `includes/Core/Assets.php` — Remove `get_option('block_checks_options')` call in `enqueue_block_scripts()`
- [x] `includes/Core/Assets.php` — Remove `get_option('block_checks_site_editor_options')` call
- [x] `includes/Core/Assets.php` — Remove `blockChecksOptions` and `siteEditorOptions` from `wp_localize_script` array
- [x] `includes/Core/Plugin.php` — Remove `admin_enqueue_scripts` hook for `enqueue_admin_assets` from `setup_hooks()`
- [x] `includes/Block/Registry.php` — Remove `init_core_block_checks()` method and its constructor call
- [x] `includes/Block/Registry.php` — Remove `$core_block_checks` property
- [x] `includes/Block/Registry.php` — Remove `use BlockAccessibility\\Block\\CoreChecks` (if present as use statement)

### Verify
- [x] No remaining references to `CoreChecks`, `HeadingLevels`, `Settings`, `SettingsAPI` anywhere in `includes/`
- [x] `Plugin.php` constructor no longer calls `init_heading_levels()`
- [x] `Plugin.php::init()` no longer calls `init_settings_page()`
- [x] `Plugin.php::setup_hooks()` no longer hooks `admin_enqueue_scripts`
- [x] `Assets.php` has no `get_option()` calls
- [x] `Assets.php` `wp_localize_script` array contains only: `editorContext`, `validationRules`, `metaValidationRules`, `editorValidationRules`, `registeredBlockTypes`
- [x] `Block/Registry.php` constructor is empty or minimal (no `init_core_block_checks()`)
- [x] Plugin activates without PHP fatal errors

### Manual Tests
- [x] Activate plugin in wp-env — no fatal errors, no PHP warnings in debug log
- [x] Open a post in the block editor — no JS errors in console
- [x] Confirm no "Block Accessibility Checks Settings" menu item appears in wp-admin
- [x] Confirm no REST API routes for settings are registered (`/wp-json/` should not have old settings routes)

---

## Phase 2: Clean JavaScript

### Tasks
- [x] Delete `src/admin/` directory entirely (all 13 files)
- [x] Delete `src/admin.js` (settings entry point)
- [x] Delete `src/editor/validation/blocks/validators/button.js`
- [x] Delete `src/editor/validation/blocks/validators/heading.js`
- [x] Delete `src/editor/validation/blocks/validators/headingListener.js`
- [x] Delete `src/editor/validation/blocks/validators/image.js`
- [x] Delete `src/editor/validation/blocks/validators/table.js`
- [x] Delete `src/editor/validation/blocks/validators/index.js`
- [x] Delete `src/editor/validation/editor/validators/postTitle.js`
- [x] Delete `src/editor/validation/editor/validators/index.js`
- [x] Delete `src/editor/modifications/imageAttributes.js`
- [x] Delete `src/editor/modifications/index.js`
- [x] Delete `src/shared/utils/isValidUrl.js`
- [x] `src/editor/validation/blocks/index.js` — Remove imports of deleted validators
- [x] `src/editor/validation/editor/index.js` — Remove imports of deleted validators
- [x] `src/editor/index.js` — Remove import of `modifications`
- [x] `src/shared/utils/index.js` — Remove export of `isValidUrl`
- [x] `src/editor/register.js` — Audit for any admin/settings imports to remove
- [x] `src/script.js` — Audit for any admin/settings imports to remove

### Verify
- [x] No remaining imports of `isValidUrl` anywhere in `src/`
- [x] No remaining imports of `imageAttributes` anywhere in `src/`
- [x] No remaining imports from `src/admin/` anywhere in `src/`
- [x] No remaining imports from `validators/` (blocks or editor) anywhere in `src/`
- [x] `src/editor/modifications/` directory no longer exists
- [x] `src/editor/validation/blocks/validators/` directory no longer exists
- [x] `src/editor/validation/editor/validators/` directory no longer exists
- [x] `npm run build` completes with zero errors

### Manual Tests
- [x] Build succeeds: `npm run build`
- [x] No orphaned JS errors in browser console related to missing validator modules
- [x] Runners still load — confirm `window.ValidationAPI` is defined in browser console
- [x] Block editor loads without JS errors

---

## Phase 3: Clean Build Config

### Tasks
- [x] `webpack.config.js` — Already clean, only `validation-api` entry. Settings entries were auto-discovered by `@wordpress/scripts` from source files deleted in Phase 2.
- [x] `package.json` — `name` already `validation-api`, description already updated
- [x] Stale build artifacts — `build/` already clean after Phase 2 `npm run build`

### Verify
- [x] `webpack.config.js` entry points match only the scripts the plugin still ships
- [x] `npm run build` produces no output files for removed entry points
- [x] No `.asset.php` files in `build/` for removed entries
- [x] `package.json` `name` is `validation-api`

### Manual Tests
- [x] `npm run build` — clean run, no errors, no unexpected output files
- [x] `npm run start` (dev mode) — no errors related to missing source files

---

## Phase 4: Rebrand

### Tasks
- [x] `validation-api.php` — Plugin header: `Plugin Name`, `Description`, `Text Domain: validation-api`
- [x] `validation-api.php` — Version constant: rename `BA11YC_VERSION` → `VALIDATION_API_VERSION` and set to `1.0.0`
- [x] `validation-api.php` — Plugin path constant: rename `BA11YC_PLUGIN_FILE` → `VALIDATION_API_PLUGIN_FILE` (or equivalent)
- [x] `validation-api.php` — Update any other `BA11YC_*` constants
- [x] All PHP files — Rename namespace `BlockAccessibility\\` → `ValidationAPI\\` (all `namespace` and `use` statements)
- [x] `includes/Core/Assets.php` — Rename `SCRIPT_HANDLE` constant value from `block-accessibility-script` → `validation-api-script`
- [x] `includes/Core/Assets.php` — Rename `wp_localize_script` object from `BlockAccessibilityChecks` → `ValidationAPI`
- [x] `includes/Core/Assets.php` — Update `BA11YC_VERSION` → `VALIDATION_API_VERSION` in all `wp_enqueue_script` / `wp_enqueue_style` version args
- [x] `includes/Core/Assets.php` — Update style handle `validation-api-style` → `validation-api-style`
- [x] All PHP files — Replace every `__( '...', 'block-accessibility-checks' )` with `__( '...', 'validation-api' )`
- [x] All PHP files — Replace every `_e( '...', 'block-accessibility-checks' )` with `_e( '...', 'validation-api' )`
- [x] All PHP files — Replace every `esc_html__( '...', 'block-accessibility-checks' )` with `esc_html__( '...', 'validation-api' )`
- [x] `composer.json` — Update PSR-4 autoload key from `BlockAccessibility\\\\` → `ValidationAPI\\\\`
- [x] `composer.json` — Update `name` field
- [x] Run `composer dump-autoload` after updating `composer.json`
- [x] All PHP hook calls — Rename all `ba11yc_*` to `validation_api_*` (actions and filters)
- [x] `src/editor/validation/ValidationAPI.js` — Update global reference from `BlockAccessibilityChecks` → `ValidationAPI`
- [x] All JS files — Update any `window.BlockAccessibilityChecks` references → `window.ValidationAPI`
- [x] All JS files — Update any `ba11yc_validate_*` filter names → `validation_api_validate_*`

### Verify
- [x] Zero remaining occurrences of `BlockAccessibility` in `includes/` (grep check)
- [x] Zero remaining occurrences of `BA11YC_` in `includes/` and `validation-api.php` (grep check)
- [x] Zero remaining occurrences of `ba11yc_` in `includes/` (grep check)
- [x] Zero remaining occurrences of `block-accessibility-checks` text domain in `includes/` (grep check)
- [x] Zero remaining occurrences of `BlockAccessibilityChecks` in `src/` (grep check)
- [x] Zero remaining occurrences of `ba11yc_` in `src/` (grep check)
- [x] `composer.json` autoload maps `ValidationAPI\\\\` to `includes/`
- [x] `validation-api.php` plugin header version shows `1.0.0`
- [x] `validation-api.php` text domain header shows `validation-api`
- [x] `npm run build` — no errors

### Manual Tests
- [x] Activate plugin — no fatal errors
- [x] In browser console: `window.ValidationAPI` is defined and has expected keys (`validationRules`, `editorContext`, etc.)
- [x] `window.BlockAccessibilityChecks` is **undefined** (old global is gone)
- [x] PHP error log is clean (no undefined constant or class not found errors)
- [x] Register a test block check via `validation_api_ready` hook and confirm it appears in `window.ValidationAPI.validationRules`
- [x] Register a test editor check via `validation_api_editor_checks_ready` hook and confirm it appears in `window.ValidationAPI.editorValidationRules`

---

## Phase 5: Clean Up Registries

### Tasks

#### `includes/Block/Registry.php`
- [x] Remove `$plugin_info` property
- [x] Remove `$plugin_info_cache` property
- [x] Remove `detect_plugin_info()` method
- [x] Remove `find_main_plugin_file()` method
- [x] Remove `find_plugin_file_in_directory()` method
- [x] Remove `ensure_plugin_data_function()` method
- [x] Remove `extract_plugin_info_from_block_type()` method
- [x] Remove `get_all_plugin_info()` method
- [x] Remove `get_check_level_from_settings()` method
- [x] Remove `get_core_block_setting()` method
- [x] Remove `get_external_block_setting()` method
- [x] Remove `$plugin_info` param from `register_check()` signature and body
- [x] Remove `register_block_check()` wrapper — not present after Phase 1/4 rewrite
- [x] `register_check()` — Rename key `'type'` → `'level'`, default `'error'`
- [x] `register_check()` — Update `$valid_levels` to `[ 'error', 'warning', 'none' ]` (removed `'settings'`)
- [x] `register_check()` — Remove `category` field (companion package will own this via `validation_api_check_args` filter)
- [x] `get_effective_check_level()` — Replace `get_option()` settings lookup with `apply_filters( 'validation_api_check_level', $registered_level, $context )`
- [x] `get_effective_check_level()` — `$context` shape: `[ 'scope' => 'block', 'block_type' => $block_type, 'check_name' => $check_name ]`
- [x] `get_effective_check_level()` — `'none'` short-circuits before filter fires

#### `includes/Meta/Registry.php`
- [x] Remove `get_option()` calls from `get_effective_meta_check_level()`
- [x] Replace with `apply_filters( 'validation_api_check_level', $registered_level, $context )`
- [x] `$context` shape: `[ 'scope' => 'meta', 'post_type' => $post_type, 'meta_key' => $meta_key, 'check_name' => $check_name ]`
- [x] Rename `'type'` → `'level'` key in defaults and registration
- [x] Remove `'settings'` from valid levels

#### `includes/Meta/Validator.php`
- [x] Rename `'type'` → `'level'` in `$defaults` and docblock example

#### `includes/Editor/Registry.php`
- [x] Remove `get_option()` calls from `get_effective_editor_check_level()`
- [x] Replace with `apply_filters( 'validation_api_check_level', $registered_level, $context )`
- [x] `$context` shape: `[ 'scope' => 'editor', 'post_type' => $post_type, 'check_name' => $check_name ]`
- [x] Rename `'type'` → `'level'` key in defaults and registration
- [x] Remove `'settings'` from valid levels

#### `includes/Core/Assets.php`
- [x] Update `prepare_validation_rules_for_js()` — field key `'type'` → `'level'` in JS output, removed `'category'`
- [x] Update `prepare_meta_validation_rules_for_js()` — `'type'` → `'level'`
- [x] Update `prepare_editor_validation_rules_for_js()` — `'type'` → `'level'`

#### `src/shared/utils/validation/issueHelpers.js`
- [x] `createIssue()` — Read `config.level` (not `config.type`) for severity
- [x] `createIssue()` — Remove `category` from issue object

### Verify
- [x] Zero remaining `get_option( 'block_checks' )` calls anywhere in `includes/`
- [x] Zero remaining `debug_backtrace` calls anywhere in `includes/`
- [x] Zero remaining `'settings'` as a valid level value in any registry
- [x] Zero remaining `'type'` field keys in any registry defaults or JS output
- [x] `get_effective_check_level()` in all 3 registries calls `apply_filters( 'validation_api_check_level', ... )`
- [x] `get_effective_check_level()` short-circuits for `'none'` without firing the filter
- [x] `register_check()` accepts `'level'` key (not `'type'`) in all 3 registries
- [x] The JS data object (`window.ValidationAPI`) uses `level` key not `type` for each check rule

### Manual Tests
- [ ] Register a check with no `level` declared → resolves to `'error'` in `window.ValidationAPI.validationRules`
- [ ] Register a check with `'level' => 'warning'` → JS rules show `'warning'`
- [ ] Register a check with `'level' => 'none'` → check does **not** appear in JS rules
- [ ] Register a filter on `validation_api_check_level` that overrides `'error'` → `'warning'` → verify JS rules reflect `'warning'`
- [ ] Register a filter that overrides to `'none'` → check absent from JS rules
- [ ] All 3 scopes (block, meta, editor) confirmed working through the filter system

---

## Cross-Phase Final Checks

### Code Quality
- [x] Run `phpcs` — zero violations
- [x] Run `npm run lint` — zero JS/CSS lint errors
- [x] `composer dump-autoload` — no autoload errors
- [x] No `TODO` or `FIXME` comments left from refactor work

### Grep Audit
- [x] `grep -r "BlockAccessibility" includes/` → 0 results
- [x] `grep -r "BA11YC_" includes/ validation-api.php` → 0 results
- [x] `grep -r "ba11yc_" includes/ src/` → 0 results
- [x] `grep -r "block-accessibility-checks" includes/ src/` → 0 results
- [x] `grep -r "BlockAccessibilityChecks" src/` → 0 results
- [x] `grep -r "block_checks_options" includes/` → 0 results
- [x] `grep -r "debug_backtrace" includes/` → 0 results
- [x] `grep -rn "'type'" includes/` → 0 results (all renamed to `'level'`)
- [x] `grep -r "CoreChecks\|HeadingLevels\|SettingsAPI" includes/` → 0 results

### Final Manual Tests
- [ ] See `plan/final-manual-test.md`

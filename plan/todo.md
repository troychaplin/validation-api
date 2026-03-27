# Refactor Todo

Checklist, verifications, and manual tests per phase. Check off as you go.

---

## Phase 1: Clean PHP

### Tasks
- [ ] Delete `includes/Block/CoreChecks.php`
- [ ] Delete `includes/Block/HeadingLevels.php`
- [ ] Delete `includes/Editor/CoreChecks.php`
- [ ] Delete `includes/Core/Settings.php`
- [ ] Delete `includes/Core/SettingsAPI.php`
- [ ] `includes/Core/Plugin.php` — Remove `use BlockAccessibility\Block\HeadingLevels`
- [ ] `includes/Core/Plugin.php` — Remove `use BlockAccessibility\Editor\CoreChecks as EditorCoreChecks`
- [ ] `includes/Core/Plugin.php` — Remove `init_heading_levels()` method and its constructor call
- [ ] `includes/Core/Plugin.php` — Remove `init_settings_page()` method and its call in `init()`
- [ ] `includes/Core/Plugin.php` — Remove `use Settings` and `use SettingsAPI` from `init_settings_page()`
- [ ] `includes/Core/Plugin.php` — Remove `$editor_core_checks` instantiation from `init_editor_checks_registry()`
- [ ] `includes/Core/Plugin.php` — Remove `get_heading_levels()` accessor method
- [ ] `includes/Core/Plugin.php` — Update `display_initialization_error()` text domain (Phase 4, but flag now)
- [ ] `includes/Core/Assets.php` — Remove `private const ADMIN_STYLE_PATH`
- [ ] `includes/Core/Assets.php` — Remove `enqueue_admin_assets()` method
- [ ] `includes/Core/Assets.php` — Remove `enqueue_admin_styles()` method (enqueues `block-admin.css`)
- [ ] `includes/Core/Assets.php` — Remove `get_option('block_checks_options')` call in `enqueue_block_scripts()`
- [ ] `includes/Core/Assets.php` — Remove `get_option('block_checks_site_editor_options')` call
- [ ] `includes/Core/Assets.php` — Remove `blockChecksOptions` and `siteEditorOptions` from `wp_localize_script` array
- [ ] `includes/Core/Plugin.php` — Remove `admin_enqueue_scripts` hook for `enqueue_admin_assets` from `setup_hooks()`
- [ ] `includes/Block/Registry.php` — Remove `init_core_block_checks()` method and its constructor call
- [ ] `includes/Block/Registry.php` — Remove `$core_block_checks` property
- [ ] `includes/Block/Registry.php` — Remove `use BlockAccessibility\Block\CoreChecks` (if present as use statement)

### Verify
- [ ] No remaining references to `CoreChecks`, `HeadingLevels`, `Settings`, `SettingsAPI` anywhere in `includes/`
- [ ] `Plugin.php` constructor no longer calls `init_heading_levels()`
- [ ] `Plugin.php::init()` no longer calls `init_settings_page()`
- [ ] `Plugin.php::setup_hooks()` no longer hooks `admin_enqueue_scripts`
- [ ] `Assets.php` has no `get_option()` calls
- [ ] `Assets.php` `wp_localize_script` array contains only: `editorContext`, `validationRules`, `metaValidationRules`, `editorValidationRules`, `registeredBlockTypes`
- [ ] `Block/Registry.php` constructor is empty or minimal (no `init_core_block_checks()`)
- [ ] Plugin activates without PHP fatal errors

### Manual Tests
- [ ] Activate plugin in wp-env — no fatal errors, no PHP warnings in debug log
- [ ] Open a post in the block editor — no JS errors in console
- [ ] Confirm no "Block Accessibility Checks Settings" menu item appears in wp-admin
- [ ] Confirm no REST API routes for settings are registered (`/wp-json/` should not have old settings routes)

---

## Phase 2: Clean JavaScript

### Tasks
- [ ] Delete `src/admin/` directory entirely (all 13 files)
- [ ] Delete `src/admin.js` (settings entry point)
- [ ] Delete `src/editor/validation/blocks/validators/button.js`
- [ ] Delete `src/editor/validation/blocks/validators/heading.js`
- [ ] Delete `src/editor/validation/blocks/validators/headingListener.js`
- [ ] Delete `src/editor/validation/blocks/validators/image.js`
- [ ] Delete `src/editor/validation/blocks/validators/table.js`
- [ ] Delete `src/editor/validation/blocks/validators/index.js`
- [ ] Delete `src/editor/validation/editor/validators/postTitle.js`
- [ ] Delete `src/editor/validation/editor/validators/index.js`
- [ ] Delete `src/editor/modifications/imageAttributes.js`
- [ ] Delete `src/editor/modifications/index.js`
- [ ] Delete `src/shared/utils/isValidUrl.js`
- [ ] `src/editor/validation/blocks/index.js` — Remove imports of deleted validators
- [ ] `src/editor/validation/editor/index.js` — Remove imports of deleted validators
- [ ] `src/editor/index.js` — Remove import of `modifications`
- [ ] `src/shared/utils/index.js` — Remove export of `isValidUrl`
- [ ] `src/editor/register.js` — Audit for any admin/settings imports to remove
- [ ] `src/script.js` — Audit for any admin/settings imports to remove

### Verify
- [ ] No remaining imports of `isValidUrl` anywhere in `src/`
- [ ] No remaining imports of `imageAttributes` anywhere in `src/`
- [ ] No remaining imports from `src/admin/` anywhere in `src/`
- [ ] No remaining imports from `validators/` (blocks or editor) anywhere in `src/`
- [ ] `src/editor/modifications/` directory no longer exists
- [ ] `src/editor/validation/blocks/validators/` directory no longer exists
- [ ] `src/editor/validation/editor/validators/` directory no longer exists
- [ ] `npm run build` completes with zero errors

### Manual Tests
- [ ] Build succeeds: `npm run build`
- [ ] No orphaned JS errors in browser console related to missing validator modules
- [ ] `validateBlock.js`, `validateMeta.js`, `validateEditor.js` runners still load (confirm via console or Sources tab)
- [ ] `window.ValidationAPI` (post-Phase 4) or current global is still accessible in browser console
- [ ] Block editor loads without JS errors

---

## Phase 3: Clean Build Config

### Tasks
- [ ] `webpack.config.js` — Remove `settings-core-blocks` entry point
- [ ] `webpack.config.js` — Remove `settings-editor-validation` entry point
- [ ] `webpack.config.js` — Remove `settings-external-plugins` entry point
- [ ] `webpack.config.js` — Remove `block-admin` entry point (if separate from `block-checks`)
- [ ] `package.json` — Update `name` field to `validation-api`
- [ ] `package.json` — Update `description` field
- [ ] Delete stale build artifacts from `/build/`: `settings-core-blocks.*`, `settings-editor-validation.*`, `settings-external-plugins.*`, `block-admin.*`

### Verify
- [ ] `webpack.config.js` entry points match only the scripts the plugin still ships
- [ ] `npm run build` produces no output files for removed entry points
- [ ] No `.asset.php` files in `build/` for removed entries
- [ ] `package.json` `name` is `validation-api`

### Manual Tests
- [ ] `npm run build` — clean run, no errors, no unexpected output files
- [ ] `npm run start` (dev mode) — no errors related to missing source files

---

## Phase 4: Rebrand

### Tasks
- [ ] `validation-api.php` — Plugin header: `Plugin Name`, `Description`, `Text Domain: validation-api`
- [ ] `validation-api.php` — Version constant: rename `BA11YC_VERSION` → `VALIDATION_API_VERSION` and set to `1.0.0`
- [ ] `validation-api.php` — Plugin path constant: rename `BA11YC_PLUGIN_FILE` → `VALIDATION_API_PLUGIN_FILE` (or equivalent)
- [ ] `validation-api.php` — Update any other `BA11YC_*` constants
- [ ] All PHP files — Rename namespace `BlockAccessibility\` → `ValidationAPI\` (all `namespace` and `use` statements)
- [ ] `includes/Core/Assets.php` — Rename `SCRIPT_HANDLE` constant value from `block-accessibility-script` → `validation-api-script`
- [ ] `includes/Core/Assets.php` — Rename `wp_localize_script` object from `BlockAccessibilityChecks` → `ValidationAPI`
- [ ] `includes/Core/Assets.php` — Update `BA11YC_VERSION` → `VALIDATION_API_VERSION` in all `wp_enqueue_script` / `wp_enqueue_style` version args
- [ ] `includes/Core/Assets.php` — Update style handle `block-checks-style` → `validation-api-style`
- [ ] All PHP files — Replace every `__( '...', 'block-accessibility-checks' )` with `__( '...', 'validation-api' )`
- [ ] All PHP files — Replace every `_e( '...', 'block-accessibility-checks' )` with `_e( '...', 'validation-api' )`
- [ ] All PHP files — Replace every `esc_html__( '...', 'block-accessibility-checks' )` with `esc_html__( '...', 'validation-api' )`
- [ ] `composer.json` — Update PSR-4 autoload key from `BlockAccessibility\\` → `ValidationAPI\\`
- [ ] `composer.json` — Update `name` field
- [ ] Run `composer dump-autoload` after updating `composer.json`
- [ ] All PHP hook calls — Rename all `ba11yc_*` to `validation_api_*` (actions and filters)
- [ ] `src/editor/validation/ValidationAPI.js` — Update global reference from `BlockAccessibilityChecks` → `ValidationAPI`
- [ ] All JS files — Update any `window.BlockAccessibilityChecks` references → `window.ValidationAPI`
- [ ] All JS files — Update any `ba11yc_validate_*` filter names → `validation_api_validate_*`

### Verify
- [ ] Zero remaining occurrences of `BlockAccessibility` in `includes/` (grep check)
- [ ] Zero remaining occurrences of `BA11YC_` in `includes/` and `validation-api.php` (grep check)
- [ ] Zero remaining occurrences of `ba11yc_` in `includes/` (grep check)
- [ ] Zero remaining occurrences of `block-accessibility-checks` text domain in `includes/` (grep check)
- [ ] Zero remaining occurrences of `BlockAccessibilityChecks` in `src/` (grep check)
- [ ] Zero remaining occurrences of `ba11yc_` in `src/` (grep check)
- [ ] `composer.json` autoload maps `ValidationAPI\\` to `includes/`
- [ ] `validation-api.php` plugin header version shows `1.0.0`
- [ ] `validation-api.php` text domain header shows `validation-api`
- [ ] `npm run build` — no errors

### Manual Tests
- [ ] Activate plugin — no fatal errors
- [ ] In browser console: `window.ValidationAPI` is defined and has expected keys (`validationRules`, `editorContext`, etc.)
- [ ] `window.BlockAccessibilityChecks` is **undefined** (old global is gone)
- [ ] PHP error log is clean (no undefined constant or class not found errors)
- [ ] Register a test block check via `validation_api_ready` hook and confirm it appears in `window.ValidationAPI.validationRules`
- [ ] Register a test editor check via `validation_api_editor_checks_ready` hook and confirm it appears in `window.ValidationAPI.editorValidationRules`

---

## Phase 5: Clean Up Registries

### Tasks

#### `includes/Block/Registry.php`
- [ ] Remove `$plugin_info` property
- [ ] Remove `$plugin_info_cache` property
- [ ] Remove `detect_plugin_info()` method
- [ ] Remove `find_main_plugin_file()` method
- [ ] Remove `find_plugin_file_in_directory()` method
- [ ] Remove `ensure_plugin_data_function()` method
- [ ] Remove `extract_plugin_info_from_block_type()` method
- [ ] Remove `get_all_plugin_info()` method
- [ ] Remove `get_check_level_from_settings()` method
- [ ] Remove `get_core_block_setting()` method
- [ ] Remove `get_external_block_setting()` method
- [ ] Remove `$plugin_info` param from `register_check()` signature and body
- [ ] Remove `register_block_check()` wrapper (or simplify — it now just calls `register_check()` directly)
- [ ] `register_check()` — Change `'type' => 'settings'` default → `'level' => 'error'` (rename key `type` → `level`)
- [ ] `register_check()` — Update `$valid_types` to `[ 'error', 'warning', 'none' ]` (remove `'settings'`)
- [ ] `register_check()` — Remove `'settings'` from type validation error message
- [ ] `register_check()` — Remove `category` field (accessibility-specific concept) or confirm it should stay
- [ ] `get_effective_check_level()` — Replace `get_option()` settings lookup with `apply_filters( 'validation_api_check_level', $registered_level, $context )`
- [ ] `get_effective_check_level()` — `$context` shape: `[ 'scope' => 'block', 'block_type' => $block_type, 'check_name' => $check_name ]`
- [ ] `get_effective_check_level()` — `'none'` short-circuits before filter fires

#### `includes/Meta/Registry.php`
- [ ] Remove `get_option()` calls from `get_effective_meta_check_level()`
- [ ] Replace with `apply_filters( 'validation_api_check_level', $registered_level, $context )`
- [ ] `$context` shape: `[ 'scope' => 'meta', 'post_type' => $post_type, 'meta_key' => $meta_key, 'check_name' => $check_name ]`
- [ ] Update `'type'` → `'level'` key in defaults and registration if applicable
- [ ] Remove `'settings'` from valid types/levels

#### `includes/Editor/Registry.php`
- [ ] Remove `get_option()` calls from `get_effective_editor_check_level()`
- [ ] Replace with `apply_filters( 'validation_api_check_level', $registered_level, $context )`
- [ ] `$context` shape: `[ 'scope' => 'editor', 'post_type' => $post_type, 'check_name' => $check_name ]`
- [ ] Update `'type'` → `'level'` key in defaults and registration if applicable
- [ ] Remove `'settings'` from valid types/levels

#### `includes/Core/Assets.php`
- [ ] Update `prepare_validation_rules_for_js()` — field key `'type'` → `'level'` in JS output (matches new registry key)
- [ ] Update `prepare_meta_validation_rules_for_js()` — same `type` → `level` key rename
- [ ] Update `prepare_editor_validation_rules_for_js()` — same `type` → `level` key rename

### Verify
- [ ] Zero remaining `get_option( 'block_checks` )` calls anywhere in `includes/`
- [ ] Zero remaining `debug_backtrace` calls anywhere in `includes/`
- [ ] Zero remaining `'settings'` as a valid level value in any registry
- [ ] `get_effective_check_level()` in all 3 registries calls `apply_filters( 'validation_api_check_level', ... )`
- [ ] `get_effective_check_level()` short-circuits for `'none'` without firing the filter
- [ ] `register_check()` accepts `'level'` key (not `'type'`) in all 3 registries
- [ ] The JS data object (`window.ValidationAPI`) uses `level` key not `type` for each check rule

### Manual Tests
- [ ] Register a check with no `level` declared → resolves to `'error'` in JS rules
- [ ] Register a check with `'level' => 'warning'` → JS rules show `'warning'`
- [ ] Register a check with `'level' => 'none'` → check does **not** appear in JS rules
- [ ] Register a filter on `validation_api_check_level` that overrides `'error'` → `'warning'` → verify JS rules reflect `'warning'`
- [ ] Register a filter that overrides to `'none'` → check absent from JS rules
- [ ] `'none'` check: confirm the `validation_api_check_level` filter does **not** fire (add temporary `error_log` to filter to confirm)
- [ ] All 3 scopes (block, meta, editor) verified through the filter system

---

## Cross-Phase Final Checks

### Code Quality
- [ ] Run `phpcs` — zero new violations
- [ ] Run `npm run lint` — zero new JS lint errors
- [ ] `composer dump-autoload` — no autoload errors
- [ ] No `TODO` or `FIXME` comments left from refactor work

### Grep Audit (run before marking complete)
- [ ] `grep -r "BlockAccessibility" includes/` → 0 results
- [ ] `grep -r "BA11YC_" includes/ validation-api.php` → 0 results
- [ ] `grep -r "ba11yc_" includes/ src/` → 0 results
- [ ] `grep -r "block-accessibility-checks" includes/ src/` → 0 results
- [ ] `grep -r "BlockAccessibilityChecks" src/` → 0 results
- [ ] `grep -r "block_checks_options" includes/` → 0 results
- [ ] `grep -r "debug_backtrace" includes/` → 0 results
- [ ] `grep -r "type.*settings" includes/` → 0 results (no 'settings' level remaining)
- [ ] `grep -r "CoreChecks\|HeadingLevels\|SettingsAPI" includes/` → 0 results

### Final Manual Tests
- [ ] Fresh install (deactivate → delete → reinstall) — no errors
- [ ] Block editor (post editor): plugin loads, sidebar renders correctly
- [ ] Site editor: plugin loads, no JS errors
- [ ] Register a custom block check via `validation_api_ready` from a test plugin — check triggers validation in editor
- [ ] Register a custom meta check via `Meta\Registry` — meta field shows validation state
- [ ] Register a custom editor check via `validation_api_editor_checks_ready` — editor-level check fires
- [ ] Post with errors cannot be published (save is locked)
- [ ] Post with only warnings can be published
- [ ] `window.ValidationAPI` in console contains correct structure
- [ ] No references to old `BlockAccessibilityChecks` global anywhere in page source or console

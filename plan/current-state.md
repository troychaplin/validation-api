# Current State Analysis

## What the plugin is today

The plugin is called "Block Accessibility Checks" but is being rebranded to "Validation API". It currently bundles two distinct concerns together:

1. **The Validation API framework** - The registries, hooks, UI components, and post-locking system
2. **Accessibility-specific implementations** - Core block checks (image alt, button text, heading hierarchy, table headers), editor checks (post title), heading level restrictions, and admin settings UI

## Files inventory

### PHP (19 files)

| File | Purpose | KEEP / REMOVE |
|---|---|---|
| `validation-api.php` | Main plugin entry point | KEEP (rename/rebrand) |
| `includes/Core/Plugin.php` | Service locator, initialization orchestrator | KEEP (simplify) |
| `includes/Core/Assets.php` | Script/style enqueue + data export to JS | KEEP (simplify) |
| `includes/Core/I18n.php` | Text domain loading | KEEP |
| `includes/Core/Settings.php` | Admin settings pages (React-based) | REMOVE |
| `includes/Core/SettingsAPI.php` | REST API for settings CRUD | REMOVE |
| `includes/Core/Traits/Logger.php` | Debug logging | KEEP |
| `includes/Core/Traits/EditorDetection.php` | Post editor vs site editor detection | KEEP |
| `includes/Block/Registry.php` | Block checks registry (singleton) | KEEP (clean up) |
| `includes/Block/CoreChecks.php` | Built-in core block check definitions | REMOVE |
| `includes/Block/HeadingLevels.php` | Heading level restriction via settings | REMOVE |
| `includes/Editor/Registry.php` | Editor checks registry (singleton) | KEEP |
| `includes/Editor/CoreChecks.php` | Built-in editor check definitions (post title) | REMOVE |
| `includes/Meta/Registry.php` | Meta checks registry (singleton) | KEEP |
| `includes/Meta/Validator.php` | Helper for `register_post_meta()` integration | KEEP |

### JavaScript (src/)

| Area | Files | KEEP / REMOVE |
|---|---|---|
| `src/editor/validation/blocks/validateBlock.js` | Core block validation runner | KEEP |
| `src/editor/validation/blocks/validators/*.js` | button, image, heading, table, headingListener | REMOVE (implementations) |
| `src/editor/validation/meta/validateMeta.js` | Meta validation runner | KEEP |
| `src/editor/validation/meta/hooks/*` | useMetaField, useMetaValidation | KEEP |
| `src/editor/validation/editor/validateEditor.js` | Editor validation runner | KEEP |
| `src/editor/validation/editor/validators/*` | postTitle validator | REMOVE (implementation) |
| `src/editor/validation/ValidationAPI.js` | Coordinator + post locking | KEEP |
| `src/editor/components/ValidationSidebar.js` | Sidebar UI | KEEP |
| `src/editor/components/BlockIndicator.js` | Block-level indicator UI | KEEP |
| `src/editor/modifications/imageAttributes.js` | Image attribute modification | REMOVE |
| `src/editor/hoc/withErrorHandling.js` | Error boundary HOC | KEEP |
| `src/shared/utils/validation/*` | getInvalidBlocks, getInvalidMeta, getInvalidEditorChecks, issueHelpers | KEEP |
| `src/shared/utils/isValidUrl.js` | URL validation utility | REMOVE (used by button validator) |
| `src/shared/hooks/useDebouncedValidation.js` | Debounce hook | KEEP |
| `src/admin/*` | Settings pages (CoreBlocks, EditorValidation, ExternalPlugins) | REMOVE |

### Build & Config

| File | KEEP / REMOVE |
|---|---|
| `webpack.config.js` | KEEP (simplify entry points) |
| `package.json` | KEEP (update name/description) |
| `composer.json` | KEEP |
| `phpcs.xml.dist` | KEEP |
| `.eslintrc.json` | KEEP |
| `.wp-env.json` | KEEP |

## What "settings" means in this context

The current plugin has a `type: 'settings'` concept where checks can be admin-configurable (error/warning/none). This requires:
- `Settings.php` - Full admin page with React apps
- `SettingsAPI.php` - REST endpoints for saving
- `block_checks_options` wp_option
- Settings data passed to JS

The `type: 'settings'` severity level will remain as a concept in the API (it's part of the severity model), but the plugin will no longer ship its own settings UI. External plugins that use the API can build their own settings pages.

## Key architecture decisions already made well

1. **PHP for config, JS for validation** - Clean separation
2. **Singleton registries** - Consistent access pattern
3. **WordPress hooks throughout** - `ba11yc_validate_block`, `ba11yc_validate_meta`, `ba11yc_validate_editor`
4. **`wp_localize_script` for data export** - Standard WP pattern
5. **Severity model** - error/warning/settings/none is solid
6. **`Meta\Validator` helper** - Elegant integration with `register_post_meta()`

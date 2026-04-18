# Validation API Plugin

A declarative validation framework for the WordPress block editor. Provides infrastructure for registering, executing, and displaying content validation checks — no built-in checks or settings UI.

## Architecture

Three validation scopes, each with a PHP registry and JS filter:

| Scope | PHP Registry | Registration Function | JS Filter |
|---|---|---|---|
| Block attributes | `ValidationAPI\Block\Registry` | `wp_register_block_validation_check()` | `editor.validateBlock` |
| Post meta fields | `ValidationAPI\Meta\Registry` | `wp_register_meta_validation_check()` | `editor.validateMeta` |
| Editor/document | `ValidationAPI\Editor\Registry` | `wp_register_editor_validation_check()` | `editor.validateEditor` |

All registration functions require `namespace`, `name`, and `error_msg` in the `$args` array. Meta checks also require `meta_key`.

### Severity

Three levels: `error` (blocks save), `warning` (shows feedback), `none` (disabled). Filterable at runtime via `wp_validation_check_level`.

### Data Flow

```
PHP Registries
  → block_editor_settings_all filter (Assets.php)
    → select('core/editor').getEditorSettings().validationApi
      → getValidationConfig.js utility functions
        → validateBlock / validateMeta / validateEditor
          → core/validation store (actions/selectors)
            → ValidationAPI component (lockPostSaving, CSS classes)
            → ValidationSidebar component (issue display)
```

### Key PHP Hooks

- `wp_validation_check_level` — Override check severity at runtime
- `wp_validation_check_args` — Modify check config before registration
- `wp_validation_should_register_check` — Prevent specific checks from registering
- `wp_validation_initialized`, `wp_validation_ready`, `wp_validation_editor_checks_ready` — Lifecycle

### JS Store

Store name: `core/validation`

**Selectors:** `getInvalidBlocks()`, `getInvalidMeta()`, `getInvalidEditorChecks()`, `getBlockValidation(clientId)`, `hasErrors()`, `hasWarnings()`

**Actions:** `setInvalidBlocks()`, `setInvalidMeta()`, `setInvalidEditorChecks()`, `setBlockValidation()`, `clearBlockValidation()`

### REST API

`GET /wp/v2/validation-checks` — Returns all registered checks grouped by scope (block, meta, editor). Requires `manage_options`.

## Project Structure

```
includes/
  Block/Registry.php          # Block check registration
  Editor/Registry.php         # Editor check registration
  Meta/Registry.php           # Meta check registration
  Meta/Validator.php          # Server-side meta validation helper
  Core/Plugin.php             # Plugin initialization
  Core/Assets.php             # Script enqueuing + editor settings injection
  Core/I18n.php               # Script translations
  Core/Traits/EditorDetection.php  # Post editor context detection
  Rest/ChecksController.php   # REST endpoint

src/
  script.js                   # Entry point
  editor/
    register.js               # registerPlugin('core-validation', ...)
    store/                    # core/validation Redux store
    components/
      ValidationProvider.js   # Single computation point (renderless)
      ValidationSidebar.js    # Issue display panel
      ValidationToolbarButton.js
    validation/
      ValidationAPI.js        # Side effects: lockPostSaving, CSS classes (renderless)
      blocks/validateBlock.js
      meta/validateMeta.js
      editor/validateEditor.js
      meta/hooks/useMetaField.js
      meta/hooks/useMetaValidation.js
    hoc/
      withErrorHandling.js    # editor.BlockEdit filter
      withBlockValidationClasses.js  # editor.BlockListBlock filter
  shared/
    utils/validation/
      issueHelpers.js         # createIssue, createValidationResult, hasErrors, hasWarnings
      getValidationConfig.js  # Reads from editor settings (replaces window.ValidationAPI)
      getInvalidBlocks.js     # React hook
      getInvalidMeta.js       # React hook
      getInvalidEditorChecks.js  # React hook
    hooks/
      useDebouncedValidation.js
```

## Build

```bash
pnpm build    # wp-scripts build → build/validation-api.js
pnpm start    # wp-scripts start (watch mode)
pnpm lint     # JS + PHP + CSS linting
```

Webpack aliases: `@` → `src/`, `@editor` → `src/editor/`, `@shared` → `src/shared/`

## Companion Plugins (same local wp-content/plugins/)

- **validation-api-integration-example** — Demo plugin with block, meta, and editor checks. Must be rebuilt separately (`npm run build` in its directory) after any JS filter name changes.
- **validation-api-settings** — Admin settings page using WordPress DataForm. Reads checks from REST endpoint, lets admins override severity via `wp_validation_check_level` filter. Must be rebuilt separately.

## Conventions

- PHP registration args use snake_case (`error_msg`, `warning_msg`). JS issue objects use camelCase (`errorMsg`, `warningMsg`). Transformation happens in `createIssue()`.
- Plugin registers as `registerPlugin('core-validation', ...)` in JS.
- Editor context scoping: validation loads in post editor only (not site editor). Detection via `EditorDetection` trait.
- `PluginContext` was removed. Plugin attribution uses a `namespace` field in registration args, stored as `_namespace` internally.
- PHPCS config (`phpcs.xml.dist`) allows `wp_register` and `wp_validation` as global prefixes.

## Integration Pattern

External plugins register checks like this:

```php
add_action( 'init', function() {
    if ( ! function_exists( 'wp_register_block_validation_check' ) ) {
        return;
    }

    wp_register_block_validation_check( 'core/image', [
        'namespace' => 'my-plugin',
        'name'      => 'alt_text',
        'level'     => 'error',
        'error_msg' => __( 'Images must have alt text.', 'my-plugin' ),
    ] );
} );
```

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter( 'editor.validateBlock', 'my-plugin/image-alt-text',
    ( isValid, blockType, attributes, checkName ) => {
        if ( blockType !== 'core/image' || checkName !== 'alt_text' ) return isValid;
        return !! attributes.alt?.trim();
    }
);
```

## Key Docs

- `docs/PROPOSAL.md` — Core merge proposal
- `docs/INTEGRATION.md` — Gutenberg integration strategy
- `docs/TODO.md` — Remaining work (testing, TypeScript, performance, future features)
- `docs/guide/` — Developer integration guides
- `docs/technical/` — Architecture, API reference, hooks reference

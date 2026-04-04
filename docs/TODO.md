# Integration TODO

Work items to make the Validation API plugin more closely align with Gutenberg's architecture before proposing upstream. Ordered by priority.

## Naming Alignment

These changes bring the plugin's public API closer to what core naming conventions would require.

### Rename store to `core/validation`

**Files**: `src/editor/store/constants.js`, all files importing `STORE_NAME`

Change `STORE_NAME` from `'validation-api'` to `'core/validation'`. This matches Gutenberg's convention (`core/editor`, `core/block-editor`, `core/blocks`). Every `useSelect` and `useDispatch` call referencing the store name will need updating.

### Rename JS filter hooks

**Files**: `src/editor/validation/blocks/validateBlock.js`, `src/editor/validation/meta/validateMeta.js`, `src/editor/validation/editor/validateEditor.js`, and any external integration examples

| Current | Target |
|---|---|
| `validation_api_validate_block` | `editor.validateBlock` |
| `validation_api_validate_meta` | `editor.validateMeta` |
| `validation_api_validate_editor` | `editor.validateEditor` |

These are the filters external plugins hook into, so this is a breaking change for integrations. Consider supporting both names during a transition period.

### Rename PHP registration functions

**Files**: `validation-api.php`, all registry classes, documentation

| Current | Target |
|---|---|
| `validation_api_register_plugin()` | See "Drop PluginContext" below |
| `validation_api_register_block_check()` | `wp_register_block_validation_check()` |
| `validation_api_register_meta_check()` | `wp_register_meta_validation_check()` |
| `validation_api_register_editor_check()` | `wp_register_editor_validation_check()` |

### Rename PHP filter/action hooks

**Files**: All registry classes, `Core/Assets.php`, `Core/Plugin.php`

| Current | Target |
|---|---|
| `validation_api_check_level` | `wp_validation_check_level` |
| `validation_api_check_args` | `wp_validation_check_args` |
| `validation_api_should_register_check` | `wp_validation_should_register_check` |
| `validation_api_check_registered` | `wp_validation_check_registered` |
| `validation_api_initialized` | `wp_validation_initialized` |
| `validation_api_ready` | `wp_validation_ready` |
| Similar for all `validation_api_*` hooks | `wp_validation_*` |

## Architecture Alignment

### Replace `wp_localize_script` with editor settings

**Files**: `includes/Core/Assets.php`

Currently, validation config is passed to JS via `wp_localize_script()` as `window.ValidationAPI`. Gutenberg passes server-side config through editor settings via the `ExperimentalEditorProvider` props, stored in the `core/editor` store under `editorSettings`.

The target approach:
1. Hook into the `block_editor_settings_all` filter
2. Add validation config to the settings array under a `validation` key
3. On the JS side, read config from `select('core/editor').getEditorSettings().validation` instead of `window.ValidationAPI`

This eliminates the global object and uses the standard Gutenberg data flow.

### Drop PluginContext / `validation_api_register_plugin()`

**Files**: `validation-api.php`, `includes/Core/PluginContext.php`, all registries that read from `PluginContext`

Replace the wrapping context pattern with a required `namespace` field in check registration args:

```php
// Before
validation_api_register_plugin(
    [ 'name' => 'My Plugin' ],
    function() {
        validation_api_register_block_check( 'core/image', [
            'name' => 'alt_text',
            // ...
        ] );
    }
);

// After
wp_register_block_validation_check( 'core/image', [
    'namespace' => 'my-plugin',
    'name'      => 'alt_text',
    // ...
] );
```

This removes `PluginContext.php` entirely. The `_plugin` stamp on each check becomes the `namespace` field. Simpler API, matches how `registerBlockType` uses namespace prefixes.

Note: `validation_api_register_plugin()` and `CheckProvider` can remain as convenience wrappers in the plugin without being part of the core proposal. They become plugin-level sugar, not core API.

### Standardize issue model (camelCase/snake_case)

**Files**: `src/shared/utils/validation/issueHelpers.js`, `src/editor/validation/blocks/validateBlock.js`, `src/editor/validation/meta/validateMeta.js`, `src/editor/validation/editor/validateEditor.js`

Currently, issue objects contain both `error_msg` and `errorMsg`. Pick one convention:
- PHP registration: snake_case (`error_msg`, `warning_msg`)
- JS runtime: camelCase (`errorMsg`, `warningMsg`)
- Transform at the boundary (when PHP config is read in JS)

Remove the dual-format output from `createIssue()`.

## Data Flow

### Read validation config from editor settings instead of window global

**Files**: `src/editor/validation/blocks/validateBlock.js`, `src/editor/validation/meta/validateMeta.js`, `src/editor/validation/editor/validateEditor.js`, `src/shared/utils/validation/getInvalidBlocks.js`

All validation functions currently read from `window.ValidationAPI.validationRules`, `window.ValidationAPI.metaValidationRules`, etc. Change these to read from the `core/editor` store's editor settings.

This requires passing editor settings into the validation functions (or accessing the store within them), rather than reading a global.

### Pass editor context through store instead of window global

**Files**: `src/editor/validation/ValidationAPI.js`, `src/shared/utils/validation/getInvalidBlocks.js`

`window.ValidationAPI.editorContext` is read directly. Move this to editor settings so it flows through the store like other config.

## TypeScript

### Add type definitions

**Files**: New `.d.ts` files or convert `.js` to `.ts`

Gutenberg packages include TypeScript definitions. At minimum, add type definitions for:
- Store state shape, actions, and selectors
- Check registration args (PHP side documented, JS side needs types)
- Validation result and issue objects
- Public hooks (`useMetaField`, `useMetaValidation`)

This isn't blocking but would be expected for a Gutenberg package.

## Performance

### Benchmark with large posts

Test validation performance with posts containing 200+, 500+, and 1000+ blocks. The current approach validates all blocks when any block changes. Measure:
- Time for `GetInvalidBlocks()` to complete
- Re-render count for `ValidationProvider`
- Memory overhead of `blockValidation` store slice with many entries

If performance is an issue, consider:
- Validating only changed blocks (compare previous/current block lists)
- Lazy validation for off-screen blocks
- Batch dispatching instead of per-block dispatches

### Audit `useEffect` dependency arrays

**Files**: `src/editor/components/ValidationProvider.js`, `src/editor/validation/ValidationAPI.js`

Ensure validation re-computation is triggered only when relevant data changes, not on every render. The `ValidationProvider` dispatches to the store on every effect run -- verify that React's dependency array prevents unnecessary cycles.

## Testing

### Add unit tests for store

**Files**: New test files in `src/editor/store/__tests__/`

Test reducer, actions, and selectors. The store is the foundation -- it should have comprehensive test coverage before proposing upstream.

### Add unit tests for validation functions

**Files**: New test files alongside validation modules

- `validateBlock()` with various block types and check configs
- `validateMeta()` with required, custom, and multi-check scenarios
- `validateEditor()` with various block arrangements
- `issueHelpers` utility functions

### Add integration tests for the full validation flow

Test the end-to-end flow: PHP registration -> config export -> JS validation -> store dispatch -> lock/unlock. This could use `@wordpress/env` and `@wordpress/e2e-test-utils`.

## Documentation

### Update developer guide for renamed APIs

**Files**: All files in `docs/guide/`, `docs/technical/`

Once naming changes are made, all code examples in the documentation need updating to reflect the new function names, filter names, and store name.

### Document the integration example with new API

**Files**: Update the [integration example plugin](https://github.com/troychaplin/validation-api-integration-example)

The example plugin should demonstrate the new `namespace`-based registration pattern without `validation_api_register_plugin()`.

## Future Considerations

These items are not blockers but are worth tracking for the core proposal discussion.

### Block.json validation support

Explore declaring simple validation rules in `block.json`:

```json
{
    "attributes": {
        "alt": {
            "type": "string",
            "validation": {
                "required": true,
                "errorMsg": "Alt text is required"
            }
        }
    }
}
```

This would reduce JS boilerplate for common checks. Complex validation would still use JS filters.

### Async validation support

The current filter hooks are synchronous (`applyFilters`). Some validation needs are inherently async (link checking, server-side content analysis). Explore using `applyFiltersAsync` for validation hooks, with loading states in the UI.

### Site editor support

The plugin currently excludes the site editor. Template validation (required blocks in templates, valid template structure) is a related but distinct problem that would need its own design discussion.

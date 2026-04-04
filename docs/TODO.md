# Integration TODO

Remaining work items to prepare the Validation API plugin for a Gutenberg core proposal. The naming alignment and architectural changes are complete -- these items cover testing, performance, and future enhancements.

## Completed

The following work has been done to align with Gutenberg conventions:

- **Store renamed** to `core/validation` (from `validation-api`)
- **JS filter hooks renamed** to `editor.validateBlock`, `editor.validateMeta`, `editor.validateEditor`
- **`window.ValidationAPI` replaced** with `block_editor_settings_all` filter. Config available via `select('core/editor').getEditorSettings().validationApi`
- **`PluginContext` dropped**. Replaced with required `namespace` field in check registration args
- **PHP functions renamed** to `wp_register_block_validation_check()`, `wp_register_meta_validation_check()`, `wp_register_editor_validation_check()`
- **PHP hooks renamed** from `validation_api_*` to `wp_validation_*`
- **REST endpoint moved** to `wp/v2/validation-checks`
- **Issue model standardized** to camelCase only in JS (`errorMsg`, `warningMsg`). PHP still uses `error_msg`, `warning_msg` -- transformation happens at the boundary in `createIssue()`
- **`window.ValidationAPI.useMetaField` export dropped**. External plugins import directly
- **Documentation updated** across all guide, technical, and root docs
- **Integration example plugin updated** to use new API names

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
- `getValidationConfig` utility functions

### Add integration tests for the full validation flow

Test the end-to-end flow: PHP registration -> editor settings injection -> JS validation -> store dispatch -> lock/unlock. This could use `@wordpress/env` and `@wordpress/e2e-test-utils`.

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

## TypeScript

### Add type definitions

**Files**: New `.d.ts` files or convert `.js` to `.ts`

Gutenberg packages include TypeScript definitions. At minimum, add type definitions for:
- Store state shape, actions, and selectors
- Check registration args (PHP side documented, JS side needs types)
- Validation result and issue objects
- Public hooks (`useMetaField`, `useMetaValidation`)

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

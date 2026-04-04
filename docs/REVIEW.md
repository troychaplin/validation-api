# Code Review — Validation API Plugin

Branch: `fix/wrapping-div`
Date: 2026-04-04

---

## 1. Dead Code / Stale Files

### `src/editor/register.js:23-37` — No-op filter callback

`addBlockValidationCategory()` returns `settings` unchanged. The `addFilter` call on `blocks.registerBlockType` does nothing. Remove the function, the filter registration, and the `addFilter` import if no longer needed.

### `src/editor/hoc/index.js` — Empty barrel file

Contains only comments explaining why nothing is exported. Imported by `src/editor/index.js` via `export * from './hoc'` but contributes nothing. Delete the file and remove the re-export.

### `src/editor/index.js` — Unused barrel file

Re-exports from `./components`, `./hoc`, and `./validation` but no file imports from `src/editor/index.js`. The entry point (`src/script.js`) imports each module directly. Delete this file.

### `src/shared/index.js` — Unused barrel file

Same pattern. All consumers import from specific paths. Delete this file.

### `src/shared/utils/index.js` — Unused barrel file

All consumers import directly from `src/shared/utils/validation`. Delete this file.

### `src/editor/validation/index.js` — Unused barrel file

Never imported. Delete this file.

---

## 2. CSS Variable Mismatch

### `settings.scss` references `--a11y-*` variables that don't exist

`src/styles/_variables.scss` defines variables with the `--validation-api-*` prefix, but `settings.scss` references the old `--a11y-*` prefix throughout. All of these will resolve to nothing at runtime:

- `--a11y-settings-space`
- `--a11y-light-grey`
- `--a11y-black`
- `--a11y-lightest-green`
- `--a11y-green`
- `--a11y-dark-green`
- `--a11y-lightest-grey`
- `--a11y-grey`
- `--a11y-dark-grey`
- `--a11y-font-small`
- `--a11y-dark-red`
- `--a11y-settings-space-mobile` (never defined anywhere under any prefix)

**Fix:** Update all `--a11y-*` references in `settings.scss` to use `--validation-api-*`, and define `--validation-api-settings-space-mobile` if needed.

### `includes/Core/Assets.php:149-163` — Dead inline CSS

`enqueue_block_styles()` injects inline CSS defining `--a11y-red`, `--a11y-light-red`, `--a11y-dark-red`, `--a11y-yellow`, `--a11y-light-yellow`, `--a11y-dark-yellow`, `--a11y-border-width`, `--a11y-warning-icon`, and `--a11y-error-icon`. None of these `--a11y-*` variables are referenced in the editor SCSS files (which use `--validation-api-*`). The SVG icon URLs are injected but never consumed by any CSS rule.

**Fix:** Remove the entire inline CSS block and the SVG URL generation above it (lines 144-165).

### `src/styles/_variables.scss` — Unused variables

These variables are defined but never referenced in any SCSS file that is actually built:

- `--validation-api-light-blue`
- `--validation-api-blue`
- `--validation-api-medium-grey`
- `--validation-api-green`
- `--validation-api-lightest-green`
- `--validation-api-dark-green`
- `--validation-api-border-width`
- `--validation-api-settings-space`
- `--validation-api-font-small`

**Fix:** Remove unused variables. If `settings.scss` is migrated to use `--validation-api-*`, some of these will become used again — audit after that migration.

---

## 3. Orphaned Style Sheets

### `src/admin.scss` and `src/settings.scss` — Not built by any entry point

`webpack.config.js` has a single entry: `src/script.js`. The `styles.scss` imported there includes only the `src/styles/` partials. Neither `admin.scss` nor `settings.scss` is imported by any JS entry point, so they are never compiled into `build/`.

**Fix:** If these are needed for a settings page, add a separate webpack entry point. If they are leftover from a removed feature, delete them.

---

## 4. Inconsistent Colors in JS

### Three different warning yellows

| Location | Value |
|----------|-------|
| `ValidationToolbarButton.js:38` | `#d8c600` |
| `ValidationSidebar.js:209` | `#dbc900` |
| `_variables.scss` | `--validation-api-yellow: #f0dc00` |

**Fix:** Standardize to one value. Both JS files should use the same hex code, ideally matching the CSS variable.

---

## 5. Redundant / Stale JS Code

### `src/shared/utils/validation/getInvalidBlocks.js:144` — Redundant filter

```js
return invalidBlocks.filter(result => !result.isValid);
```

`getInvalidBlocksRecursive` already only pushes results where `!result.isValid`. The `.filter()` is redundant.

### `src/editor/components/ValidationSidebar.js:272-277` — Dead `handleMetaClick`

Empty function with eslint-disable for unused-vars. Never called anywhere. Remove it.

### `src/editor/validation/editor/validateEditor.js:68` — Redundant `checkName` assignment

```js
issue.checkName = checkName;
```

`createIssue()` already sets `checkName` on the returned object. Same issue in `src/editor/validation/meta/validateMeta.js:113`.

### `src/editor/register.js:51-62` — Over-engineered Proxy

The `blockChecksArray` Proxy wraps a simple window property lookup. Since `window.ValidationAPI.validationRules` is set once by `wp_localize_script` before JS executes, the only consumer (`validateBlock.js`) can read it directly:

```js
const checks = window.ValidationAPI?.validationRules?.[blockType] || {};
```

Remove the Proxy export from `register.js` and inline the access in `validateBlock.js`.

---

## 6. Import / Global Consistency

### `src/editor/hoc/withBlockValidationClasses.js:39` — Uses `wp.hooks.addFilter` global

All other files import `addFilter` from `@wordpress/hooks`. This file uses the global `wp.hooks.addFilter` directly. Import it for consistency.

---

## 7. PHP Observations

### Redundant type checks in all three registries

`Block\Registry::register_check()`, `Editor\Registry::register_editor_check()`, and `Meta\Registry::register_meta_check()` all check `! is_string()` and `! is_array()` on parameters that are already type-hinted as `string` and `array` in the method signature. PHP enforces these at call time, making the checks unreachable.

**Files:**
- `includes/Block/Registry.php:68,73,78`
- `includes/Editor/Registry.php:81,86,91`
- `includes/Meta/Registry.php:82,87,92,98`

### `includes/Core/Traits/EditorDetection.php` — Duplicated post type array

`get_editor_context()` (line 40) and `is_site_editor_context()` (line 115) both hardcode `array('wp_template', 'wp_template_part')`. Define once as a class constant.

---

## 8. Naming Inconsistencies

### `has-meta-validation-errors` / `has-meta-validation-warnings` body classes

Set in `ValidationAPI.js:163-176`, these classes reflect errors from blocks, meta, AND editor checks — not just meta. The `meta` prefix is misleading. Consider `has-validation-errors` / `has-validation-warnings`.

### `blockChecksArray` export name

Defined in `register.js:51`. It's a Proxy object, not an array. If kept, rename to `blockChecks`.

### `settings.scss` double-comment lines

Lines 209 and 222 have `// //` prefix — leftover from toggling code blocks. Clean up to single `//`.

---

## 9. Action Summary

| Priority | Action | Files |
|----------|--------|-------|
| High | Fix `--a11y-*` to `--validation-api-*` variable mismatch | `settings.scss` |
| High | Remove dead inline CSS (`--a11y-*` vars + SVG URLs) | `Assets.php` |
| High | Standardize warning yellow color | `ValidationToolbarButton.js`, `ValidationSidebar.js` |
| Med | Delete 6 unused barrel files | `editor/index.js`, `editor/hoc/index.js`, `shared/index.js`, `shared/utils/index.js`, `editor/validation/index.js` |
| Med | Remove no-op `addBlockValidationCategory` + filter | `register.js` |
| Med | Remove unused CSS variables | `_variables.scss` |
| Med | Remove Proxy, inline window access | `register.js`, `validateBlock.js` |
| Med | Remove dead `handleMetaClick` | `ValidationSidebar.js` |
| Med | Remove redundant `.filter()` | `getInvalidBlocks.js` |
| Med | Remove redundant `checkName` re-assignments | `validateEditor.js`, `validateMeta.js` |
| Med | Verify `admin.scss` / `settings.scss` build status | Webpack config |
| Low | Remove redundant PHP type checks | 3 registry files |
| Low | Import `addFilter` in `withBlockValidationClasses.js` | `withBlockValidationClasses.js` |
| Low | Clean up double-comment lines | `settings.scss` |
| Low | Rename misleading body classes | `ValidationAPI.js` |
| Low | Rename `blockChecksArray` | `register.js` |
| Low | Consolidate duplicated site-editor post type array | `EditorDetection.php` |

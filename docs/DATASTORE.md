# Data Store Plan

## Current State

Validation state is computed independently by each consumer. The three core hooks — `GetInvalidBlocks`, `GetInvalidMeta`, and `GetInvalidEditorChecks` — each run their own `useSelect` calls against `core/editor` and `core/block-editor`. Two components call all three hooks:

- **ValidationAPI.js** — locks/unlocks post saving based on errors, manages body classes
- **ValidationSidebar.js** — renders the sidebar UI with deduplicated issues

This means every block edit triggers both components to independently re-derive the full validation state.

Additionally, a lightweight in-memory `Map` exists at `src/editor/store/blockValidationStore.js` that shares per-block validation results between the `editor.BlockEdit` filter (writes) and `editor.BlockListBlock` filter (reads). This is not a `@wordpress/data` store — it's a plain module-scoped Map with no reactivity or selectors.

### Current Consumers and Their Data Sources

| Consumer | Hooks Used | WordPress Selectors |
|----------|-----------|-------------------|
| ValidationAPI.js | GetInvalidBlocks, GetInvalidMeta, GetInvalidEditorChecks | core/editor (dispatch: lock/unlock saving) |
| ValidationSidebar.js | GetInvalidBlocks, GetInvalidMeta, GetInvalidEditorChecks | core/block-editor (dispatch: selectBlock) |
| withErrorHandling.js (HOC) | useDebouncedValidation + validateBlock | core/block-editor (getBlock) |
| useMetaField.js | useMetaValidation | core/editor (getEditedPostAttribute, editPost) |
| useMetaValidation.js | validateAllMetaChecks | core/editor (getCurrentPostType, getEditedPostAttribute) |

### Validation Rules Source

All rules originate from PHP and are exposed via `window.ValidationAPI`:
- `validationRules` — block validation rules by block type
- `metaValidationRules` — meta validation rules by post type
- `editorValidationRules` — editor validation rules by post type
- `editorContext` — current editor context

---

## Problem

1. **Duplicated computation** — `ValidationAPI` and `ValidationSidebar` each independently call the same three hooks, running identical validation logic twice per change.
2. **No shared reactivity** — the `blockValidationStore` Map has no subscription mechanism, so consumers can't react to changes without their own `useSelect` wiring.
3. **Scaling concern** — adding a new consumer (e.g., toolbar badge, status bar) requires importing and re-running the same hooks again.

---

## Proposed Solution: Custom `@wordpress/data` Store

Create a `validation-api` store using `createReduxStore` that centralizes validation state and exposes it through selectors.

### Store Namespace

```
validation-api
```

### State Shape

```js
{
  blocks: [],       // Array of invalid block results
  meta: [],         // Array of invalid meta results
  editor: [],       // Array of editor check issues
}
```

### Selectors

| Selector | Returns | Description |
|----------|---------|-------------|
| `getInvalidBlocks(state)` | `Array` | All invalid block validation results |
| `getInvalidMeta(state)` | `Array` | All invalid meta validation results |
| `getInvalidEditorChecks(state)` | `Array` | All editor-level validation issues |
| `hasErrors(state)` | `boolean` | True if any error exists across all types |
| `hasWarnings(state)` | `boolean` | True if any warning exists (and no errors) |
| `getBlockValidation(state, clientId)` | `Object` | Per-block validation result (replaces Map store) |

### Actions

| Action | Payload | Description |
|--------|---------|-------------|
| `setInvalidBlocks(results)` | `Array` | Update block validation results |
| `setInvalidMeta(results)` | `Array` | Update meta validation results |
| `setInvalidEditorChecks(issues)` | `Array` | Update editor check results |
| `setBlockValidation(clientId, result)` | `string, Object` | Set per-block validation (replaces Map) |
| `clearBlockValidation(clientId)` | `string` | Remove per-block validation |

### File Structure

```
src/editor/store/
  index.js                  // createReduxStore + register, barrel exports
  selectors.js              // All selector functions
  actions.js                // All action creators
  reducer.js                // State reducer
  blockValidationStore.js   // (removed — absorbed into store)
```

---

## Migration Path

### Phase 1: Create the Store

- Create `reducer.js`, `actions.js`, `selectors.js`
- Register the store via `createReduxStore` in `index.js`
- Keep existing hooks working alongside the store

### Phase 2: Write to the Store

- Update `GetInvalidBlocks`, `GetInvalidMeta`, and `GetInvalidEditorChecks` to dispatch results into the store after computing them
- Update `withErrorHandling.js` to use store actions instead of the Map

### Phase 3: Read from the Store

- Refactor `ValidationAPI.js` to read from `select('validation-api')` instead of calling hooks directly
- Refactor `ValidationSidebar.js` to read from `select('validation-api')`
- Only one component (or a top-level provider) needs to drive the validation hooks

### Phase 4: Clean Up

- Remove `blockValidationStore.js` (Map-based store)
- Simplify the three `Get*` hooks into internal update functions rather than public hooks
- Remove duplicate validation calls

---

## Benefits

- **Single computation** — validation runs once, multiple components subscribe
- **Memoized selectors** — `useSelect` bails out when results haven't changed, reducing re-renders
- **Decoupled consumers** — any component can `select('validation-api').hasErrors()` without importing hooks
- **Testable** — selectors and reducers are plain functions
- **Replaces Map store** — per-block validation moves into the same reactive system

## Trade-offs

- Adds boilerplate (reducer, actions, selectors)
- Slightly more complex mental model for a small plugin
- Store registration must happen early enough for all consumers

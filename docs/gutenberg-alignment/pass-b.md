# Pass B — Architectural Review

Review of the Validation API plugin's architectural choices against modern Gutenberg patterns. This pass examines whether the plugin re-implements primitives Gutenberg already provides, and whether the patterns it chose are still the current best practice.

## Status

- [x] Review complete
- [x] Action items folded into Pass A doc (`pass-a.md`) Batch 1
- [ ] Execution (awaits consolidated plan)

## Scope of Pass B

| Area examined | Verdict |
|---|---|
| Renderless components (`ValidationProvider`, `ValidationAPI`) | **Convert to hooks** (B-1) |
| `registerPlugin` for sidebar mount | Keep (standalone); swap at core-PR |
| `PluginSidebar` from `@wordpress/editor` | Keep |
| HOCs via `editor.BlockEdit` + `editor.BlockListBlock` | Keep |
| `lockPostSaving` / autosave / publish-sidebar locking | Keep |
| `editor.preSavePost` as save-time gate | **Add** (B-2) |
| `EditorDetection` trait (PHP) | Keep |
| `block_editor_settings_all` global vs per-context injection | Keep global for now |
| REST permission callback `manage_options` | Keep |
| Store subscription surface | Keep; possible Pass C consolidation |

## Reference sources

- Gutenberg packages sampled: `packages/editor`, `packages/block-editor`, `packages/core-data`, `packages/notices`, `packages/plugins`, `packages/interface`, `packages/components`, `packages/dataviews`
- Gutenberg PHP sampled: `lib/`, `lib/experimental/`, `lib/compat/`
- Key reference files (quoted in findings):
  - `packages/plugins/src/api/index.ts` — `registerPlugin` implementation
  - `packages/editor/src/components/plugin-sidebar/index.js` — `PluginSidebar` as wrapper
  - `packages/interface/src/components/complementary-area/index.js` — `ComplementaryArea`
  - `packages/editor/src/components/provider/use-upload-save-lock.js` — canonical hook-based save lock pattern
  - `packages/editor/src/store/actions.js` — `editor.preSavePost` application, `lockPostSaving` action creators
  - `packages/edit-widgets/src/filters/move-to-widget-area.js` — HOC + BlockControls pattern (modern)
  - `packages/editor/src/hooks/pattern-overrides.js` — HOC with `createHigherOrderComponent`

## Findings

### B-1: Convert renderless components to hooks

**Current state:**

- `src/editor/components/ValidationProvider.js` — renderless component. Calls `GetInvalidBlocks()`, `GetInvalidMeta()`, `GetInvalidEditorChecks()`, then dispatches to `core/validation` store via `useEffect`. Returns `null`.
- `src/editor/validation/ValidationAPI.js` — renderless component. `useSelect`s from `core/validation` store, runs two `useEffect`s (save-locking + body CSS classes). Returns `null`.
- Both mounted as siblings in `registerPlugin`'s render prop alongside `ValidationSidebar`.

**Gutenberg reference:**

`packages/editor/src/components/provider/use-upload-save-lock.js`:

```js
export function useUploadSaveLock() {
  const isUploading = useSelect( /* ... */, [] );
  const { lockPostSaving, unlockPostSaving, lockPostAutosaving, unlockPostAutosaving }
    = useDispatch( editorStore );

  useEffect( () => {
    if ( isUploading ) {
      lockPostSaving( LOCK_NAME );
      lockPostAutosaving( LOCK_NAME );
    } else {
      unlockPostSaving( LOCK_NAME );
      unlockPostAutosaving( LOCK_NAME );
    }
  }, [ isUploading ] );
}
```

This is the direct pattern match for what `ValidationAPI.js` does today. Gutenberg uses a hook, not a renderless component.

Renderless components still exist in `packages/editor` (`global-keyboard-shortcuts`, `unsaved-changes-warning`, `theme-support-check`) but newer side-effect code uses hooks.

**Proposed structure:**

```js
// src/hooks/use-validation-sync.js
export function useValidationSync() {
  const invalidBlocks = useInvalidBlocks();
  const invalidMeta = useInvalidMeta();
  const invalidEditorChecks = useInvalidEditorChecks();
  const { setInvalidBlocks, setInvalidMeta, setInvalidEditorChecks }
    = useDispatch( validationStore );

  useEffect( () => { setInvalidBlocks( invalidBlocks ); }, [ invalidBlocks, setInvalidBlocks ] );
  useEffect( () => { setInvalidMeta( invalidMeta ); }, [ invalidMeta, setInvalidMeta ] );
  useEffect( () => { setInvalidEditorChecks( invalidEditorChecks ); }, [ invalidEditorChecks, setInvalidEditorChecks ] );
}
```

```js
// src/hooks/use-validation-lifecycle.js
export function useValidationLifecycle() {
  const editorContext = getEditorContext();
  const isValidContext = editorContext === 'post-editor' || editorContext === 'post-editor-template';
  const { invalidBlocks, invalidMeta, invalidEditorChecks } = useSelect( /* ... */ );
  const { lockPostSaving, unlockPostSaving, /* ... */ } = useDispatch( editorStore );

  useEffect( () => { /* save-locking logic */ }, [ /* deps */ ] );
  useEffect( () => { /* body CSS class logic */ }, [ /* deps */ ] );
}
```

```js
// src/hooks/register-sidebar.js
import { registerPlugin } from '@wordpress/plugins';
import { useValidationSync } from './use-validation-sync';
import { useValidationLifecycle } from './use-validation-lifecycle';
import ValidationSidebar from '../components/validation-sidebar';

function ValidationPlugin() {
  useValidationSync();
  useValidationLifecycle();
  return <ValidationSidebar />;
}

registerPlugin( 'core-validation', { render: ValidationPlugin } );
```

**Why this works:**

- `ValidationSidebar` already returns `null` when no issues exist. Moving the hooks to `ValidationPlugin` (always rendered) keeps them running regardless of sidebar visibility.
- One root mount point instead of three siblings.
- Each hook is independently testable (no wrapper component needed in tests).
- Matches Gutenberg's `use-upload-save-lock.js` pattern exactly.

**Why not:**

- Behavior is identical either way; this is stylistic alignment, not a bug fix.

**Integration with Batch 1:** Already folded into the Batch 1 checklist in `pass-a.md`. File moves updated to `src/hooks/use-validation-sync.js` and `src/hooks/use-validation-lifecycle.js`.

---

### B-2: Add `editor.preSavePost` as save-time gate

**Current state:** Plugin does not use `editor.preSavePost`. Save-blocking is entirely `lockPostSaving`-based in `ValidationAPI.js`.

**Gutenberg reference:** `packages/editor/src/store/actions.js` applies the filter during save:

```js
try {
  edits = await applyFiltersAsync(
    'editor.preSavePost',
    edits,
    options
  );
} catch ( err ) {
  error = err;
}
```

The filter is stable since WP 6.7 and is async. Throwing aborts the save.

**How `lockPostSaving` and `editor.preSavePost` relate:**

- `lockPostSaving` — guards the `savePost()` action via the `isPostSavingLocked()` selector check. Prevents save attempts from proceeding.
- `editor.preSavePost` — runs inside the save pipeline as an async filter. Can modify `edits` or throw to abort.

They are complementary:
- Lock is the primary mechanism for a reactive, always-on save-gate.
- `preSavePost` is a per-save interception point, useful for:
  - Race-condition safety (lock not yet applied when save fires)
  - Async final validation (e.g., server-side check)
  - Edge paths that don't go through `savePost`-action-as-normal

**Proposed addition:**

New file `src/hooks/pre-save-validation.js`:

```js
import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as validationStore } from '../store';

addFilter(
  'editor.preSavePost',
  'validation-api/pre-save-gate',
  async ( edits ) => {
    if ( select( validationStore ).hasErrors() ) {
      throw new Error(
        __( 'Validation errors must be resolved before saving.', 'validation-api' )
      );
    }
    return edits;
  }
);
```

**Why:**

- Cheap safety net. If the reactive lock is correct, this filter never fires against real errors.
- Matches the designed-in use of `editor.preSavePost`.
- Forward-compatible: if Gutenberg adds non-savePost save paths or plugins dispatch save directly, this catches them.

**Why not:**

- Redundant in the happy path. Skippable if minimal-surface-area is preferred.

**Verdict:** Recommend adding. Low cost, low risk, semantically correct.

**Integration with Batch 1:** Added as a new line item in `pass-a.md` Batch 1 checklist. File path: `src/hooks/pre-save-validation.js`. Imported from `src/hooks/index.js`.

---

## Confirmed aligned — do not change

### `registerPlugin('core-validation', ...)` for sidebar mount

`packages/plugins/src/api/index.ts` confirms `registerPlugin` is designed for third-party plugin authors. Gutenberg's own built-in sidebars (Document, Block) mount `ComplementaryArea` directly in the editor layout — they do NOT use `registerPlugin`. For a third-party plugin, `registerPlugin` is correct.

**Core-PR migration:** At merge time, the sidebar becomes a direct `<ComplementaryArea scope="core" name="validation-sidebar">` inside the editor's render tree, as Gutenberg does internally. Documented in `core-pr-migration.md` (to be written).

### HOC pattern via `editor.BlockEdit` and `editor.BlockListBlock`

Gutenberg's own code actively uses `createHigherOrderComponent` for these filters. Examples:

- `packages/edit-widgets/src/filters/move-to-widget-area.js` — HOC on `editor.BlockEdit` adding `<BlockControls>` fill
- `packages/editor/src/hooks/pattern-overrides.js` — HOC on `editor.BlockEdit` adding conditional controls
- `packages/editor/src/hooks/custom-sources-backwards-compatibility.js` — HOC on `editor.BlockEdit` for attribute shimming

Plugin's `withErrorHandling` already matches this pattern exactly (HOC + `<BlockControls group="block">` fill). `withBlockValidationClasses` matches the `wrapperProps.className` injection pattern Gutenberg uses for `editor.BlockListBlock`. No change.

### `lockPostSaving` / `lockPostAutosaving` / `disablePublishSidebar`

Plugin uses all three with a single named lock (`'core/validation'`), reactive via `useEffect`. This matches `packages/editor/src/components/provider/use-upload-save-lock.js` precisely. No change.

### `EditorDetection` trait (PHP)

Gutenberg does **not** expose an `is_post_editor()` / `is_site_editor()` PHP helper. Features detect context per-feature using:

- `$pagenow`
- `get_current_screen()`
- Request parameters (`post`, `post_type`, `postType`)

The trait's approach is the same. No core helper to adopt. Keep as-is.

**Note:** Pass C may find opportunities to simplify the trait's internals, but its *role* is correct.

### `block_editor_settings_all` global injection

Plugin injects all registered checks (across all post types) into editor settings under `validationApi.*` keys. JS filters to current post type client-side.

**Gutenberg supports per-context injection** via `WP_Block_Editor_Context` and the REST endpoint context parameter. But for a plugin with a small number of checks per post type, global injection is fine. Revisit only if editor settings payload becomes large (e.g., hundreds of checks).

Not changing now. Flagged for Pass C performance consideration.

### REST permission callback `manage_options`

Endpoint: `GET /wp-validation/v1/checks` (post Batch 2).

**Consumer audit result:** The only consumer is `validation-api-settings/src/settings/App.js`. Editor JS receives config via `block_editor_settings_all` injection, not REST. Integration example plugin does not fetch the endpoint.

**Gutenberg pattern:**
- `edit_posts` — editor-facing read config (most of block editor settings controller)
- `manage_options` — admin settings (guidelines, etc.)

Since the sole consumer is the admin settings page (which already requires `manage_options`), the existing capability is correct. If a future feature needs editor-JS consumption, revisit.

### Store subscription pattern

`useSelect` with `[]` deps in `ValidationAPI.js` and `ValidationSidebar.js` is **correct usage** — the deps gate the `mapSelect` identity, not the selectors themselves. Store reactivity is independent. Not a bug.

---

## Action items (added to Pass A Batch 1)

The Pass B changes are *not* separate batches. They fold into Pass A's Batch 1 because they touch the same files Batch 1 is already moving/renaming. Doing them together avoids touching the same files twice.

### Checklist additions to `pass-a.md` Batch 1:

- [x] Rename `ValidationProvider.js` target from `src/validation-provider.js` (renderless) → `src/hooks/use-validation-sync.js` (hook)
- [x] Rename `ValidationAPI.js` target from `src/hooks/validation-lifecycle.js` (renderless) → `src/hooks/use-validation-lifecycle.js` (hook)
- [x] Update `register-sidebar.js` to define `ValidationPlugin` root component that calls both hooks, pass it as `registerPlugin`'s `render`
- [x] Add new file line: `src/hooks/pre-save-validation.js` with `addFilter('editor.preSavePost', ...)` side effect
- [x] Update `src/hooks/index.js` to import `pre-save-validation`; document that `use-validation-*` hooks are NOT imported here

All edits already applied to `pass-a.md`.

---

## Items forwarded to Pass C

### Potential store-subscription consolidation

`ValidationSidebar.js` and `useValidationLifecycle` both `useSelect` the same three selectors (`getInvalidBlocks`, `getInvalidMeta`, `getInvalidEditorChecks`). Each needs the values independently, so this is not a bug. But a shared `useValidationIssues()` hook could consolidate them.

**Action:** Pass C evaluates whether consolidation is worthwhile or premature abstraction.

### `EditorDetection` trait internals

The trait uses `$pagenow`, site-editor post-type checks, and `get_current_screen()` fallbacks. Several branches may be dead code or redundant. Pass C leanness review.

### `getValidationConfig` utility layer

Wraps access to `select('core/editor').getEditorSettings().validationApi`. Whether this indirection earns its file is a Pass C call.

### Global editor settings injection

All checks for all post types always injected. If settings payload becomes a perf concern, use `WP_Block_Editor_Context` to filter per-request. Not a current issue; flagged for Pass C perf review.

---

## Nothing new deferred to core-PR from Pass B

All deferred items (registerPlugin → ComplementaryArea direct mount, etc.) were already captured in Pass A's deferred table. No additions from this pass.

## Notes

- The plugin's architecture is in better shape than a typical 4,000-LOC codebase would suggest. Most concerns raised during planning (renderless vs. hooks being the only notable one) turn out to be trend shifts rather than mistakes.
- `editor.preSavePost` is the one genuinely *missing* integration. Adding it is cheap and aligned.
- The integration example plugin's validation logic is not architecturally concerning — it uses the documented filter names and PHP registration functions. No changes needed there as a result of Pass B.

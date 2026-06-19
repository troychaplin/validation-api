# Validation API — Gutenberg Core Dependency Breakdown

This document maps exactly which pieces of Gutenberg core the Validation API plugin
builds on, why each is used and how, and which capabilities the plugin had to invent
because no core primitive exists for them.

Derived from the plugin's actual `@wordpress/*` imports, data-store usage, JS filters,
and PHP hooks.

---

## 1. Gutenberg core pieces the Validation API depends on

### JavaScript packages (`@wordpress/*`)

| Package | What's pulled in | Role |
|---|---|---|
| `@wordpress/data` | `createReduxStore`, `register`, `select`, `useSelect`, `useDispatch` | Heaviest dependency — the state spine |
| `@wordpress/element` | `useEffect`, `useRef`, `useState` | React runtime |
| `@wordpress/hooks` | `addFilter`, `applyFilters` | The extension backbone |
| `@wordpress/i18n` | `__`, `sprintf` | Translation |
| `@wordpress/components` | `PanelBody`, `PanelRow`, `ToolbarButton`, `Modal`, `TextControl` | UI primitives |
| `@wordpress/plugins` | `registerPlugin` | Single mount point |
| `@wordpress/editor` | `PluginSidebar` | Sidebar slot |
| `@wordpress/compose` | `createHigherOrderComponent` | HOC wrapping |
| `@wordpress/blocks` | `getBlockType` | Block metadata lookup |
| `@wordpress/block-editor` | `BlockControls` | Toolbar slot |

### Gutenberg data stores consumed

- **`core/editor`** — `getEditorSettings`, `getEditedPostAttribute`, `editPost`,
  `lockPostSaving` / `unlockPostSaving`, `isSavingPost`
- **`core/block-editor`** — `getBlocks` (walk the block tree)
- **`core/validation`** — the plugin's **own** registered store (not core)

### Gutenberg filters / SlotFills used as extension points

- `editor.BlockEdit` — inject per-block validation + toolbar button
- `editor.BlockListBlock` — apply per-block CSS classes
- `editor.preSavePost` — async save-time gate (the one validation-adjacent filter core ships)
- `BlockControls` / `PluginSidebar` — SlotFill mount points

### PHP / server side

- `block_editor_settings_all` — inject registry config into editor settings
- `enqueue_block_editor_assets`, `wp_enqueue_script`, `wp_set_script_translations`
- `register_rest_route` + `current_user_can` — the `/wp-validation/v1/checks` endpoint
- `add_filter` / `add_action` / `apply_filters` — the plugin's own hook system

---

## 2. Why and how each is used

**`@wordpress/data` (the spine).**
The whole architecture is store-driven. The plugin calls `createReduxStore` / `register`
to stand up its own `core/validation` store, then uses `useSelect` / `useDispatch` /
`select` to (a) read editor state from `core/editor` and `core/block-editor`, and
(b) push computed validation results into its own store. The
`useValidationSync` → store → `useValidationLifecycle` split exists *because* of how
`@wordpress/data` subscriptions re-render — keeping the dispatcher and the subscriber as
siblings avoids a render loop.

**`@wordpress/hooks` (the extension model).**
The conceptual heart. Every validation check runs through `applyFilters` on
`editor.validateBlock` / `validateMeta` / `validateEditor`. External plugins register
checks purely by calling `addFilter`. The plugin contributes *infrastructure*; the actual
pass/fail logic lives in filter callbacks. This is the WordPress-idiomatic way to make
validation pluggable without a hard dependency.

**`core/editor` store APIs.**
- `getEditorSettings()` — how the PHP registries reach JS: PHP injects `validationApi` into
  editor settings via `block_editor_settings_all`, and JS reads it back here.
- `getEditedPostAttribute` — read meta/content values to validate.
- `editPost` — write meta back for the meta-field integration hook.
- `lockPostSaving` / `unlockPostSaving`, `lockPostAutosaving` / `unlockPostAutosaving`,
  `disablePublishSidebar` / `enablePublishSidebar` — the enforcement mechanism for
  `error`-level checks. See [§2a](#2a-the-save-locking-mechanism-central) — this is the
  central piece of the plugin's enforcement story.

**`core/block-editor` → `getBlocks`.**
Walks the block tree so `useInvalidBlocks` can run every block check against every block
instance.

**`editor.preSavePost`.**
Belt-and-suspenders save gate. Even if the save lock is bypassed, this async filter throws
to abort the save when errors remain.

**`editor.BlockEdit` + `createHigherOrderComponent` + `BlockControls` / `ToolbarButton`.**
Wraps every block's edit component to surface a validation toolbar button without the block
author opting in.

**`editor.BlockListBlock`.**
Adds per-block CSS classes so invalid blocks get visual treatment in the canvas.

**`PluginSidebar` + `registerPlugin` + `PanelBody` / `PanelRow`.**
The grouped issue-list UI. `registerPlugin('core-validation', …)` is the single mount;
`PluginSidebar` provides the panel surface.

**`@wordpress/components` (`Modal`, `TextControl`, etc.).**
Standard UI primitives for the sidebar, inline modal, and the meta-field helper hook.

**`getBlockType` (`@wordpress/blocks`).**
Resolves block metadata/labels for display in issue messages.

**`block_editor_settings_all` (PHP).**
The PHP↔JS bridge. All three registries serialize their registered checks into
`settings.validationApi`, which JS reads via `getEditorSettings()`.

**`register_rest_route` + `current_user_can('manage_options')`.**
Exposes registered checks to the companion settings-admin plugin.

---

## 2a. The save-locking mechanism (central)

Post locking/unlocking is the **core enforcement primitive** of the whole plugin. An
`error`-level check is only meaningful if it can actually stop a save — and core's
`lockPostSaving` family is what makes that possible. The plugin uses it as a
**two-layer defense**.

### Layer 1 — reactive lock (`useValidationLifecycle`)

`src/hooks/use-validation-lifecycle.js` subscribes to aggregate validation state from the
`core/validation` store and, on every change, dispatches against `core/editor` using a
single named lock, `LOCK_NAME = 'core/validation'`. The named lock is important: it scopes
the plugin's lock so it never collides with locks held by other plugins, and it lets the
plugin release exactly its own lock.

When **any** error-level failure exists across blocks, meta, or editor checks, it locks
three things together:

| Dispatch | Effect |
|---|---|
| `lockPostSaving(LOCK_NAME)` | Disables Save/Update — the primary gate |
| `lockPostAutosaving(LOCK_NAME)` | Prevents autosave from persisting invalid content |
| `disablePublishSidebar()` | Forces the pre-publish checklist so the user sees why |

When all error-level failures clear, the mirror calls
(`unlockPostSaving` / `unlockPostAutosaving` / `enablePublishSidebar`) run and saving is
restored. The autosave and publish-sidebar dispatches are feature-detected
(`if (lockPostAutosaving)`) so the plugin degrades gracefully on older core.

Severity matters here: only `mode === 'error'` (blocks), `hasErrors` (meta), and
error-level editor checks drive the lock. `warning`-level failures deliberately do **not**
lock — they only surface feedback and body classes. This is the entire point of the graded
severity model: the lock is the hard stop reserved for `error`.

Scope guard: locking only runs in post-editor contexts (`post-editor` /
`post-editor-template`); the site editor is intentionally excluded.

### Layer 2 — save-time gate (`editor.preSavePost`)

`src/hooks/pre-save-validation.js` is the belt-and-suspenders backstop. The reactive lock
is state-driven and *usually* sufficient, but a lock can race: a direct dispatch, an
in-flight state update, or a programmatic save could slip through before the lock
propagates. So at save time the `editor.preSavePost` async filter re-checks
`select('core/validation').hasErrors()` and **throws** to abort the save if errors remain.

The two layers are complementary, not redundant:

- **Lock** = proactive UX — the Save button is visibly disabled, autosave is paused, the
  publish flow is interrupted. The user is told *before* they try.
- **preSavePost throw** = last line of defense — guarantees an invalid post can't be
  persisted even if the lock state is momentarily wrong.

### Why this is load-bearing

Without `lockPostSaving`, "error" severity would be cosmetic. Core provides the lock
primitive but **nothing that maps a set of declarative checks to it** — the reactive
orchestration, the named-lock scoping, the autosave + publish-sidebar coordination, and the
preSavePost fallback are all plugin-authored glue. That glue is item 8 in the gap list
below.

---

## 3. What the plugin needs that does NOT exist in Gutenberg core

These are the genuine gaps — everything the plugin had to invent because core provides no
primitive for it. This list is essentially the scope of a Gutenberg core PR.

1. **A validation store / data model.** There is no `core/validation` (or equivalent) in
   core. The entire store — invalid-blocks/meta/editor state, `hasErrors` / `hasWarnings`,
   per-block validation records — is bespoke.

2. **Declarative check registration (PHP + JS).** Core has no `register_*_check()` API, no
   `AbstractRegistry`, no concept of a "check" with `namespace` / `name` / `level` /
   `error_msg`. The three registries are pure plugin invention.

3. **A severity model (`error` / `warning` / `none`).** Core's save flow is binary (locked
   or not). The graded severity plus the runtime `validation_api_check_level` override
   filter don't exist in core.

4. **First-class validation filters.** `editor.validateBlock` / `validateMeta` /
   `validateEditor` are plugin-defined filter names. Core ships `editor.preSavePost`
   (which the plugin *reuses*) but nothing for per-block / per-meta / per-document
   validation contracts.

5. **A meta-validation integration layer.** `useMetaField` / `useMetaValidation` (the
   `@wordpress/validation` import path used in the doc examples) — value + onChange + help
   text + error `className` wired to a registered check — has no core equivalent. Core gives
   you `useEntityProp`; it does not give you validated meta fields.

6. **Block-level validation surfacing.** No core primitive ties a validation result to a
   block's canvas treatment or toolbar. The `BlockEdit` / `BlockListBlock` wrapping + CSS
   side-effects reconstruct this manually.

7. **A standardized "where are my checks" REST surface.** `/wp-validation/v1/checks` exists
   only because core has no registry to introspect.

8. **Save-blocking driven by declarative results.** Core has `lockPostSaving` /
   `lockPostAutosaving` / `disablePublishSidebar`, but nothing that *automatically* maps a
   set of registered error-level checks to lock/unlock + a pre-save throw. The
   `useValidationLifecycle` + `pre-save-validation` coordination (see
   [§2a](#2a-the-save-locking-mechanism-central)) is the missing glue — and it is the
   single most central piece of the plugin's enforcement model.

---

## Summary

Core gives the plugin the mounting points, stores, slots, and the one save-gate filter
(`editor.preSavePost`). The validation *concept itself* — registry, checks, severity,
validation filters, the `core/validation` store, REST introspection, and meta/block
surfacing — is entirely the plugin's own contribution.

> Note: the `@wordpress/validation` imports appear only inside `@example` doc comments.
> That is the *intended* core package name (the merge target), not a real dependency today.

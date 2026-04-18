# Proposal: A Block Editor Validation API for WordPress

## Summary

This proposal introduces a **Validation API** for the WordPress block editor -- a declarative framework for registering, executing, and displaying content validation checks in real time. The API enables theme and plugin developers to define validation rules for block attributes, post meta fields, and editor-wide document structure, providing immediate feedback to content creators and optionally preventing publication when critical issues are unresolved.

The [Validation API](https://github.com/troychaplin/validation-api) plugin is a working reference implementation. It demonstrates the full lifecycle -- PHP registration, JavaScript execution via filters, centralized state management through a `@wordpress/data` store, and standardized editor UI -- built entirely on existing WordPress and Gutenberg APIs.

**This proposal advocates for the framework only** -- not specific validation checks, settings UI, or opinionated rules. Those remain the domain of plugins. What belongs in core is the infrastructure that makes declarative content validation possible for the entire ecosystem.

## The Problem

WordPress provides robust tools for creating and editing content in the block editor, but it lacks a unified system for validating that content against quality, accessibility, or editorial standards before publication. Today, developers who want to validate block content must independently solve the same set of problems:

1. **No declarative check registration** -- There is no standard way to declare "this block attribute must meet these criteria" or "this post must contain these elements." Every plugin builds its own registration system.

2. **No real-time validation pattern** -- Providing instant feedback as users edit requires understanding store subscriptions, React rendering, and performance optimization. Each plugin re-invents this.

3. **No standardized validation UI** -- There are no dedicated slots, components, or patterns for displaying validation results in the editor. Plugins create ad-hoc UI using `editor.BlockEdit` HOCs, custom sidebars, or `PluginPrePublishPanel`.

4. **No severity model** -- The existing `lockPostSaving` mechanism is binary (locked or not). There is no built-in concept of warnings vs. errors, configurable severity levels, or admin-controlled thresholds.

5. **Fragmented primitives** -- The building blocks exist (`@wordpress/hooks`, `lockPostSaving`, `editor.BlockEdit`, `PluginPrePublishPanel`, `editor.preSavePost`), but they are disconnected. Every plugin must assemble them into a validation system from scratch.

The result is that most plugins simply don't validate content at all, and those that do create inconsistent, incompatible experiences.

## Existing Primitives in Core

A Validation API would not introduce new low-level mechanisms. Instead, it provides a cohesive layer on top of existing, stable WordPress and Gutenberg APIs:

| Primitive | Current Use | Role in a Validation API |
|---|---|---|
| [`@wordpress/hooks`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-hooks/) | General-purpose JS event system | Execute validation logic via filters |
| [`@wordpress/data`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-data/) | Redux-like state management | Centralized validation state via dedicated store |
| [`lockPostSaving`](https://developer.wordpress.org/block-editor/reference-guides/data/data-core-editor/) | Binary save prevention | Enforce error-level validation failures |
| [`editor.BlockEdit`](https://developer.wordpress.org/block-editor/reference-guides/filters/block-filters/) | Wrap block edit components via HOC | Display per-block validation toolbar and indicators |
| [`editor.BlockListBlock`](https://developer.wordpress.org/block-editor/reference-guides/filters/block-filters/) | Wrap block list items | Apply validation CSS classes to block wrappers |
| [`PluginPrePublishPanel`](https://developer.wordpress.org/block-editor/reference-guides/slotfills/plugin-pre-publish-panel/) | Inject content into pre-publish panel | Show validation summary before publishing |
| [`PluginSidebar`](https://developer.wordpress.org/block-editor/reference-guides/slotfills/plugin-sidebar/) | Custom editor sidebars | Consolidated validation results panel |
| [`editor.preSavePost`](https://github.com/WordPress/gutenberg/pull/64198) | Async save interception (WP 6.7+) | Final validation gate before saving |
| [`register_post_meta`](https://developer.wordpress.org/reference/functions/register_post_meta/) | Meta field registration with REST validation | Server-side meta validation via `validate_callback` |

These are all stable, public APIs. A Validation API standardizes how they are used together for content validation.

## Prior Art and Related Discussions

Several Gutenberg issues and PRs have explored pieces of this problem space over the years, but none have proposed a unified validation framework:

- **[#4063 - Provide an API to validate block input](https://github.com/WordPress/gutenberg/issues/4063)** -- One of the earliest requests (2017) for server-side block attribute validation. Endorsed by core contributors but never implemented as a framework.
- **[#14954 - Server-side block attribute validation](https://github.com/WordPress/gutenberg/issues/14954)** -- Gravity Forms requested capability-based attribute restriction (2019). Resolution was to use `lockPostSaving` as a workaround, highlighting the gap.
- **[#13413 - Third-party save validation](https://github.com/WordPress/gutenberg/issues/13413)** -- ACF team requested validation hooks during save (2019). Led to the `editor.preSavePost` filter (stabilized in WP 6.7), which provides the save-time hook but not the declarative framework.
- **[#7020 - Pre-publish checkup extensibility](https://github.com/WordPress/gutenberg/issues/7020)** -- Led to `lockPostSaving`/`unlockPostSaving` (PR [#10649](https://github.com/WordPress/gutenberg/pull/10649)), but without error messaging or severity levels.
- **[#21703 - Classification of block validation types](https://github.com/WordPress/gutenberg/issues/21703)** -- Proposes a classification system for block validation outcomes, though focused on markup validation rather than content quality.
- **[#71500 - Field API: Validation](https://github.com/WordPress/gutenberg/issues/71500)** -- The DataViews/DataForm Field API introduced validation rules (required, pattern, custom validators). While scoped to the admin Data API, it demonstrates the value of a declarative validation model.

The common thread is that developers have repeatedly asked for a standardized way to validate block editor content. The primitives exist, but the framework does not.

## Proposed Solution: A Validation API

### Design Principles

1. **PHP for registration, JavaScript for validation** -- Follow the existing block API pattern where PHP declares configuration and JavaScript handles runtime behavior.
2. **Declarative check registration** -- Developers register checks with metadata (messages, severity, descriptions). The framework handles execution, UI, and save-locking.
3. **Three validation scopes** -- Block attributes, post meta fields, and editor-wide document state each have distinct registration and execution patterns, but share a unified results model.
4. **Centralized state via `@wordpress/data`** -- All validation results flow through a dedicated Redux store, enabling any component to read validation state without duplicate computation.
5. **Filter-first severity** -- Every check passes through a filter that can override its level at runtime. No storage opinions in the framework.
6. **Extensible via hooks** -- All validation logic runs through WordPress filters, allowing any plugin to add, modify, or override checks.

### Registration Pattern

Checks are registered with a flat function call, using a `namespace` field to attribute them to the registering plugin. A `function_exists` guard ensures integrating plugins work correctly whether or not the Validation API is active:

```php
add_action( 'init', function() {
    if ( ! function_exists( 'wp_register_block_validation_check' ) ) {
        return;
    }

    wp_register_block_validation_check( 'core/image', [
        'namespace' => 'my-content-rules',
        'name'      => 'alt_text',
        'error_msg' => __( 'Images must have alt text.', 'my-plugin' ),
    ] );
} );
```

### The Three Validation Scopes

#### 1. Block Attributes Validation

Validate individual block attributes such as image alt text, heading content, button labels, or custom block fields. Checks are registered per block type.

**PHP Registration:**

```php
wp_register_block_validation_check( 'core/image', [
    'namespace'   => 'my-plugin',
    'name'        => 'alt_text',
    'level'       => 'error',
    'description' => __( 'Ensures images have alt text for screen reader users.', 'my-plugin' ),
    'error_msg'   => __( 'Images must have alternative text for accessibility.', 'my-plugin' ),
    'warning_msg' => __( 'Alternative text is recommended for images.', 'my-plugin' ),
] );
```

**JavaScript Validation:**

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'editor.validateBlock',
    'my-plugin/image-alt-text',
    ( isValid, blockType, attributes, checkName ) => {
        if ( blockType !== 'core/image' || checkName !== 'alt_text' ) {
            return isValid;
        }
        if ( ! attributes.url ) {
            return true; // No image selected yet
        }
        return !! ( attributes.alt && attributes.alt.trim() );
    }
);
```

#### 2. Post Meta Validation

Validate WordPress post meta fields with real-time client-side feedback. The meta field is registered via `register_post_meta()` as usual, and the validation check is registered through the Validation API:

**PHP Registration:**

```php
wp_register_meta_validation_check( 'post', [
    'namespace'   => 'my-plugin',
    'name'        => 'required',
    'meta_key'    => 'seo_description',
    'level'       => 'error',
    'description' => __( 'SEO description is required for all posts.', 'my-plugin' ),
    'error_msg'   => __( 'SEO description is required.', 'my-plugin' ),
    'warning_msg' => __( 'Consider adding an SEO description.', 'my-plugin' ),
] );
```

**JavaScript Validation:**

```javascript
addFilter(
    'editor.validateMeta',
    'my-plugin/seo-description',
    ( isValid, value, postType, metaKey, checkName ) => {
        if ( metaKey !== 'seo_description' || checkName !== 'required' ) {
            return isValid;
        }
        return !! ( value && value.trim() );
    }
);
```

For server-side enforcement on save, use WordPress's native `validate_callback` parameter on `register_post_meta()`. The Validation API handles the client-side UX; server-side enforcement is a separate, complementary concern:

```php
register_post_meta( 'post', 'seo_description', [
    'single'            => true,
    'type'              => 'string',
    'show_in_rest'      => true,
    'sanitize_callback' => 'sanitize_text_field',
    'validate_callback' => static function ( $value ) {
        if ( empty( trim( (string) $value ) ) ) {
            return new WP_Error(
                'seo_description_required',
                __( 'SEO description is required.', 'my-plugin' ),
                [ 'status' => 400 ]
            );
        }
        return true;
    },
] );
```

#### 3. Editor Validation

Validate the overall editor state: block order, document structure, required elements, and cross-block relationships. Checks are registered per post type.

**PHP Registration:**

```php
wp_register_editor_validation_check( 'post', [
    'namespace'   => 'my-plugin',
    'name'        => 'first_block_heading',
    'level'       => 'warning',
    'description' => __( 'Ensures content begins with a heading for structure.', 'my-plugin' ),
    'error_msg'   => __( 'Posts must start with a heading block.', 'my-plugin' ),
    'warning_msg' => __( 'Posts should start with a heading block.', 'my-plugin' ),
] );
```

**JavaScript Validation:**

```javascript
addFilter(
    'editor.validateEditor',
    'my-plugin/first-block-heading',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName !== 'first_block_heading' ) {
            return isValid;
        }
        if ( blocks.length === 0 ) {
            return true;
        }
        return blocks[ 0 ].name === 'core/heading';
    }
);
```

### Severity Model

| Level | Behavior | Use Case |
|---|---|---|
| `error` | Prevents saving/publishing | Critical accessibility or data integrity issues |
| `warning` | Shows feedback, allows saving | Recommendations and best practices |
| `none` | Check is disabled, skipped entirely | Temporarily or permanently inactive checks |

When `level` is omitted, it defaults to `error`.

Every active check passes through a filter that allows any plugin to override its severity at runtime:

```php
apply_filters(
    'wp_validation_check_level',
    $registered_level,
    $context // [ 'scope' => 'block', 'block_type' => 'core/image', 'check_name' => 'alt_text' ]
);
```

This means the framework has **no storage opinions**. The filter is the settings mechanism. A companion plugin can hook in and read from `wp_options`; an enterprise plugin can read from a remote API; a multisite network can enforce overrides globally. The core framework just fires the filter.

When any check fails at the `error` level, the API uses `lockPostSaving` to prevent publication and provides clear messaging about what needs to be resolved.

### State Management

Validation results are managed through a dedicated `@wordpress/data` store. A single `useValidationSync` hook computes all validation and dispatches results to the store. All other consumers read from the store -- no duplicate computation.

**Store structure:**

```javascript
{
    blocks: [],              // Invalid block results
    meta: [],                // Invalid meta results
    editor: [],              // Invalid editor check issues
    blockValidation: {}      // Per-block state: { [clientId]: { mode, issues } }
}
```

**Key selectors:**

- `getInvalidBlocks()` -- All blocks with validation failures
- `getInvalidMeta()` -- All meta fields with validation failures
- `getInvalidEditorChecks()` -- All editor check failures
- `getBlockValidation( clientId )` -- Validation state for a specific block
- `hasErrors()` -- Whether any error-level failures exist
- `hasWarnings()` -- Whether warning-level failures exist (and no errors)

This architecture separates concerns cleanly: `useValidationSync` handles computation, `useValidationLifecycle` handles side effects (save-locking, body CSS classes), and UI components like `ValidationSidebar` handle display. A reactive save-lock (`lockPostSaving`) is layered with an async safety net (`editor.preSavePost` throws if errors exist at save time) for defense in depth.

### Validation Results UI

The framework provides standardized UI patterns:

- **Block-level indicators** -- CSS classes (`validation-api-block-error`, `validation-api-block-warning`) applied to block wrappers via `editor.BlockListBlock`, plus a toolbar button with issue details via `editor.BlockEdit`
- **Consolidated sidebar** -- A unified panel listing all validation issues across blocks, meta, and editor checks, with click-to-select for block issues
- **Debounced per-block validation** -- Validation runs are debounced (300ms default) to prevent performance issues during rapid editing

### Editor Context Scoping

The API detects the current editor context and loads validation only where appropriate:

| Context | Validation Active | Details |
|---|---|---|
| Post editor | Yes | Standard post/page editing |
| Post editor with template | Yes | Validates content blocks within `core/post-content` only |
| Site editor | No | Template/global styles editing -- excluded |

## Reference Implementation

The [Validation API](https://github.com/troychaplin/validation-api) plugin demonstrates this framework. Key implementation details:

### Architecture

- **PHP Registries** — Singleton registries (`Block\Registry`, `Meta\Registry`, `Editor\Registry`) extending a shared `AbstractRegistry` base class. The abstract holds defaults, required-field validation, namespace stamping, priority sort, and `wp_validation_check_level` filter application; the concrete registries differ only in storage shape and scope-specific hook names.
- **`@wordpress/data` Store** — A dedicated Redux store (`core/validation`) centralizes all validation state with actions, selectors, and a reducer.
- **`useValidationSync` hook** — Single computation point. Calls `useInvalidBlocks`/`useInvalidMeta`/`useInvalidEditorChecks`, dispatches the results to the store.
- **`useValidationLifecycle` hook** — Manages editor-wide side effects: `lockPostSaving`/`unlockPostSaving`, `lockPostAutosaving`/`unlockPostAutosaving`, `disablePublishSidebar`/`enablePublishSidebar`, and body CSS classes.
- **Save-time gate** — The `editor.preSavePost` async filter is subscribed as a belt-and-suspenders safety net on top of `lockPostSaving`: if errors exist at save time the filter throws, aborting the save.
- **JavaScript Validation** — Validation logic runs entirely in JavaScript via WordPress filters (`editor.validateBlock`, `editor.validateMeta`, `editor.validateEditor`).
- **Configuration Export** — PHP configuration is passed to JavaScript via the `block_editor_settings_all` filter, delivering validation rules and editor context through editor settings.
- **Plugin Attribution** — The `namespace` field in check registration args attributes checks to the registering plugin, enabling organized settings and REST API attribution.

> Note on terminology: the two hooks above are called from small renderless sibling wrappers (`ValidationSync`, `ValidationLifecycle`) under the root `ValidationPlugin` component. The sibling arrangement is deliberate — putting both hooks in a single parent component causes an infinite render loop because `useValidationLifecycle` subscribes to the store that `useValidationSync` dispatches to. See [docs/technical/README.md](technical/README.md) for the full explanation.

### REST API

A read-only endpoint exposes all registered checks grouped by scope (block, meta, editor). This enables admin tooling and companion packages to read the validation configuration without parsing PHP internals. The reference plugin currently exposes this at `GET /wp-validation/v1/checks`; the final namespace in core is TBD during PR review (candidates: `wp/v2/validation-checks`, `wp-block-editor/v1/validation-checks`).

### External Plugin Integration

Plugins register checks using `wp_register_block_validation_check()` (and related functions) with a `function_exists` guard, and validation logic is added via JavaScript filters:

- [Integration Example Plugin](https://github.com/troychaplin/validation-api-integration-example) -- A complete example demonstrating block, meta, and editor checks.

### Companion Settings Package

The [validation-api-settings](https://github.com/troychaplin/validation-api-settings) companion plugin provides an admin settings page built on WordPress DataForm. It reads registered checks from the REST API and lets admins override severity levels globally via the `wp_validation_check_level` filter.

This separation is intentional: the core framework has no settings UI and no storage, making it suitable for core merge. The companion stays in plugin-land.

## What Would Be Included in Core

The proposal is specifically for the **Validation API framework** -- the infrastructure that enables declarative content validation.

**Included:**

- Check registration system (PHP registries for block, meta, and editor checks)
- Global registration functions (`wp_register_block_validation_check()`, `wp_register_meta_validation_check()`, `wp_register_editor_validation_check()`)
- JavaScript validation filter hooks (`editor.validateBlock`, `editor.validateMeta`, `editor.validateEditor`)
- Dedicated `@wordpress/data` store (`core/validation`) for validation state
- Severity model with runtime override via `wp_validation_check_level` filter
- Validation result model (severity levels, issue reporting, standardized result objects)
- Post-locking integration (automatic `lockPostSaving` based on error-level failures)
- Standardized UI components (block indicators, validation sidebar, toolbar button)
- Editor context scoping (post editor only, content blocks within templates)
- PHP action hooks for lifecycle events (`wp_validation_initialized`, `wp_validation_ready`, `wp_validation_editor_checks_ready`)
- PHP filter hooks for check modification (`wp_validation_check_args`, `wp_validation_should_register_check`, `wp_validation_check_level`)
- REST API endpoint for admin tooling (plugin exposes at `GET /wp-validation/v1/checks`; final namespace in core TBD)

**Not included (remains in plugin territory):**

- Specific validation checks for core blocks (alt text, heading hierarchy, link text, etc.)
- Admin settings page for configuring check severity
- Any particular accessibility or content quality rules
- Opinionated defaults about what content should or should not be validated

The distinction is important: the API provides the *capability* to validate; plugins and themes provide the *rules*.

## Open Questions

1. **Async validation** -- Should the filter hooks support async validation for server-side checks (e.g., link checking, content analysis)?
2. **Block.json integration** -- Could validation rules be declared in `block.json` for simple checks (e.g., `"required": true` on attributes), with JavaScript filters for complex logic?

## Next Steps

1. Gather feedback from the Gutenberg team and broader WordPress community
2. Evaluate whether the API should live in Gutenberg (as a package) or in WordPress core
3. Define a formal API specification based on the patterns proven in the reference implementation
4. Develop a prototype within Gutenberg for testing and iteration

## Resources

- **Plugin:** [Validation API on GitHub](https://github.com/troychaplin/validation-api)
- **Example Integration:** [validation-api-integration-example](https://github.com/troychaplin/validation-api-integration-example)
- **Companion Settings:** [validation-api-settings](https://github.com/troychaplin/validation-api-settings)
- **Developer Documentation:** [docs/guide/README.md](guide/README.md)
- **Technical Reference:** [docs/technical/README.md](technical/README.md)

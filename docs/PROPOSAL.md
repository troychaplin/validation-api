# Proposal: A Block Editor Validation API for WordPress

## Summary

This proposal introduces the concept of a **Validation API** for the WordPress block editor -- a standardized, declarative framework for registering, executing, and displaying content validation checks in real time. The API would enable theme and plugin developers to define validation rules for block attributes, post meta fields, and editor-wide document structure, providing immediate feedback to content creators and optionally preventing publication when critical issues are unresolved.

The [Validation API](https://github.com/troychaplin/validation-api) plugin serves as a working reference implementation of this concept. It demonstrates the full lifecycle of a validation system built entirely on existing WordPress and Gutenberg APIs, with a clean separation between the framework (core-mergeable) and the rules (plugin territory).

**This proposal advocates for the Validation API framework only** -- not specific validation checks, settings UI, or other features. Those remain the domain of plugins. What belongs in core is the underlying system that makes declarative content validation possible for the entire ecosystem.

## The Problem

WordPress provides robust tools for creating and editing content in the block editor, but it lacks a unified system for validating that content against quality, accessibility, or editorial standards before publication. Today, developers who want to validate block content must independently solve the same set of problems:

1. **No declarative check registration** -- There is no standard way to declare "this block attribute must meet these criteria" or "this post must contain these elements." Every plugin builds its own registration system.

2. **No real-time validation pattern** -- Providing instant feedback as users edit requires understanding store subscriptions, React rendering, and performance optimization. Each plugin re-invents this.

3. **No standardized validation UI** -- There are no dedicated slots, components, or patterns for displaying validation results in the editor. Plugins create ad-hoc UI using `editor.BlockEdit` HOCs, custom sidebars, or `PluginPrePublishPanel`.

4. **No severity model** -- The existing `lockPostSaving` mechanism is binary (locked or not). There is no built-in concept of warnings vs. errors, configurable severity levels, or admin-controlled thresholds.

5. **Fragmented primitives** -- The building blocks exist (`@wordpress/hooks`, `lockPostSaving`, `editor.BlockEdit`, `PluginPrePublishPanel`, `editor.preSavePost`), but they are disconnected. Every plugin must assemble them into a validation system from scratch.

The result is that most plugins simply don't validate content at all, and those that do create inconsistent, incompatible experiences.

## Existing Primitives in Core

A Validation API would not introduce new low-level mechanisms. Instead, it would provide a cohesive layer on top of existing, stable WordPress and Gutenberg APIs:

| Primitive | Current Use | Role in a Validation API |
|---|---|---|
| [`@wordpress/hooks`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-hooks/) | General-purpose JS event system | Execute validation logic via filters |
| [`lockPostSaving`](https://developer.wordpress.org/block-editor/reference-guides/data/data-core-editor/) | Binary save prevention | Enforce error-level validation failures |
| [`editor.BlockEdit`](https://developer.wordpress.org/block-editor/reference-guides/filters/block-filters/) | Wrap block edit components via HOC | Display per-block validation indicators |
| [`PluginPrePublishPanel`](https://developer.wordpress.org/block-editor/reference-guides/slotfills/plugin-pre-publish-panel/) | Inject content into pre-publish panel | Show validation summary before publishing |
| [`PluginSidebar`](https://developer.wordpress.org/block-editor/reference-guides/slotfills/plugin-sidebar/) | Custom editor sidebars | Consolidated validation results panel |
| [`editor.preSavePost`](https://github.com/WordPress/gutenberg/pull/64198) | Async save interception (WP 6.7+) | Final validation gate before saving |
| [`register_post_meta`](https://developer.wordpress.org/reference/functions/register_post_meta/) | Meta field registration with REST validation | Server-side meta validation via `validate_callback` |
| `wp_localize_script` / `wp_add_inline_script` | Pass PHP data to JS | Export validation configuration to the editor |

These are all stable, public APIs. A Validation API would standardize how they are used together for content validation.

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
4. **Filter-first severity** -- Every check passes through a filter that can override its level at runtime. No storage opinions in the framework.
5. **Extensible via hooks** -- All validation logic runs through WordPress filters, allowing any plugin to add, modify, or override checks.
6. **Scoped plugin identity** -- Plugins declare their identity once and register checks within that scope, enabling attribution and organized settings.

### Registration Pattern

All checks are registered through a scoped plugin wrapper. This pattern declares the plugin identity, guards against the API being absent, and attributes all checks to the registering plugin:

```php
add_action( 'init', function() {
    if ( ! function_exists( 'validation_api_register_plugin' ) ) {
        return;
    }

    validation_api_register_plugin(
        [ 'name' => 'My Content Rules' ],
        function() {
            // Register checks here -- all are attributed to 'My Content Rules'
        }
    );
} );
```

The `function_exists` guard ensures integrating plugins work correctly whether or not the Validation API is active.

### The Three Validation Scopes

#### 1. Block Attributes Validation

Validate individual block attributes such as image alt text, heading content, button labels, or custom block fields. Checks are registered per block type.

**PHP Registration:**

```php
validation_api_register_block_check( 'core/image', [
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
    'validation_api_validate_block',
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

Validate WordPress post meta fields with real-time client-side feedback. Meta field registration and validation check registration are separate concerns -- the meta field is registered via `register_post_meta()` as usual, and the validation check is registered through the Validation API:

**PHP Registration (meta field):**

```php
register_post_meta( 'post', 'seo_description', [
    'single'            => true,
    'type'              => 'string',
    'show_in_rest'      => true,
    'sanitize_callback' => 'sanitize_text_field',
] );
```

**PHP Registration (validation check):**

```php
validation_api_register_meta_check( 'post', [
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
    'validation_api_validate_meta',
    'my-plugin/seo-description',
    ( isValid, value, postType, metaKey, checkName ) => {
        if ( metaKey !== 'seo_description' || checkName !== 'required' ) {
            return isValid;
        }
        return !! ( value && value.trim() );
    }
);
```

For cases that also need server-side enforcement on save, the API provides a `Validator` helper that registers both the client-side check and a `validate_callback` for `register_post_meta()` in one call:

```php
use ValidationAPI\Meta\Validator;

register_post_meta( 'post', 'seo_description', [
    'single'            => true,
    'type'              => 'string',
    'show_in_rest'      => true,
    'sanitize_callback' => 'sanitize_text_field',
    'validate_callback' => Validator::required( 'post', 'seo_description', [
        'error_msg' => __( 'SEO description is required.', 'my-plugin' ),
        'level'     => 'error',
    ] ),
] );
```

#### 3. Editor Validation

Validate the overall editor state: block order, document structure, required elements, and cross-block relationships. Checks are registered per post type.

**PHP Registration:**

```php
validation_api_register_editor_check( 'post', [
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
    'validation_api_validate_editor',
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
    'validation_api_check_level',
    $registered_level,
    $context // [ 'scope' => 'block', 'block_type' => 'core/image', 'check_name' => 'alt_text' ]
);
```

This means the framework has **no storage opinions**. The filter is the settings mechanism. A companion plugin can hook in and read from `wp_options`; an enterprise plugin can read from a remote API; a multisite network can enforce overrides globally. The core framework just fires the filter.

When any check fails at the `error` level, the API uses `lockPostSaving` to prevent publication and provides clear messaging about what needs to be resolved.

### Enterprise Registration (CheckProvider)

For larger integrations, the API provides a `CheckProvider` interface for class-based registration. Each class handles one concern and is wired together through the plugin scope:

```php
use ValidationAPI\Contracts\CheckProvider;

class ImageChecks implements CheckProvider {
    public function register(): void {
        validation_api_register_block_check( 'core/image', [
            'name'      => 'alt_text',
            'level'     => 'error',
            'error_msg' => __( 'Images must have alt text.', 'my-plugin' ),
        ] );
    }
}

// In the plugin bootstrap:
validation_api_register_plugin(
    [ 'name' => 'Enterprise Content Rules' ],
    [
        ImageChecks::class,
        HeadingChecks::class,
        MetaChecks::class,
    ]
);
```

### Validation Results UI

The framework would provide standardized UI patterns rather than requiring each plugin to build its own:

- **Block-level indicators** -- Visual markers on blocks with validation issues, showing severity and details on interaction
- **Consolidated sidebar** -- A unified panel listing all validation issues across blocks, meta, and editor checks
- **Header summary** -- A toolbar indicator showing the total count of issues

These patterns are already implemented and tested in the reference implementation.

## Reference Implementation

The [Validation API](https://github.com/troychaplin/validation-api) plugin demonstrates this framework in production. Key implementation details:

### Architecture

- **PHP Registries** -- Singleton pattern registries ([`Block\Registry`](https://github.com/troychaplin/validation-api/blob/main/includes/Block/Registry.php), [`Meta\Registry`](https://github.com/troychaplin/validation-api/blob/main/includes/Meta/Registry.php), [`Editor\Registry`](https://github.com/troychaplin/validation-api/blob/main/includes/Editor/Registry.php)) manage check registration, configuration, and data export.
- **JavaScript Validation** -- Validation logic runs entirely in JavaScript via WordPress filters ([`validateBlock.js`](https://github.com/troychaplin/validation-api/blob/main/src/editor/validation/blocks/validateBlock.js), [`validateMeta.js`](https://github.com/troychaplin/validation-api/blob/main/src/editor/validation/meta/validateMeta.js), [`validateEditor.js`](https://github.com/troychaplin/validation-api/blob/main/src/editor/validation/editor/validateEditor.js)).
- **Configuration Export** -- PHP configuration is passed to JavaScript via `wp_localize_script`, creating a global `window.ValidationAPI` object.
- **Post Locking** -- The [`ValidationAPI`](https://github.com/troychaplin/validation-api/blob/main/src/editor/validation/ValidationAPI.js) coordinator component aggregates validation results and manages `lockPostSaving`/`unlockPostSaving`.
- **Plugin Attribution** -- The `PluginContext` system tracks which plugin registers which checks, enabling organized settings and REST API attribution.

### External Plugin Integration

The API is designed for external integration. Plugins register checks using `validation_api_register_plugin()` with a `function_exists` guard, and validation logic is added via JavaScript filters.

- [Integration Example Plugin](https://github.com/troychaplin/validation-api-integration-example) -- A complete example demonstrating block, meta, and editor checks using the CheckProvider pattern.
- [Developer Guide](docs/guide/README.md) -- Getting started with check registration.

### Companion Settings Package

The [validation-api-settings](https://github.com/troychaplin/validation-api-settings) companion plugin provides an admin settings page built on WordPress DataForm. It reads registered checks from the REST API and lets admins override severity levels globally -- no code required. The companion hooks into `validation_api_check_level` and stores overrides in `wp_options`.

This separation is intentional: the core framework has no settings UI and no storage, making it suitable for core merge. The companion stays in plugin-land.

## What Would Be Included in Core

The proposal is specifically for the **Validation API framework** -- the infrastructure that enables declarative content validation. This includes:

**Included:**

- Check registration system (PHP registries for block, meta, and editor checks)
- Global registration functions (`validation_api_register_plugin()`, `validation_api_register_block_check()`, `validation_api_register_meta_check()`, `validation_api_register_editor_check()`)
- CheckProvider interface for class-based registration
- JavaScript validation filter hooks (`validation_api_validate_block`, `validation_api_validate_meta`, `validation_api_validate_editor`)
- Severity model with runtime override via `validation_api_check_level` filter
- Validation result model (severity levels, issue reporting, standardized result objects)
- Post-locking integration (automatic `lockPostSaving` based on error-level failures)
- Standardized UI components (block indicators, validation sidebar)
- Configuration export (PHP-to-JS data flow via `wp_localize_script`)
- PHP action hooks for lifecycle events (`validation_api_initialized`, `validation_api_ready`, `validation_api_editor_checks_ready`)
- PHP filter hooks for check modification (`validation_api_check_args`, `validation_api_should_register_check`, `validation_api_check_level`)
- REST API endpoint (`GET /validation-api/v1/checks`) for admin tooling
- Meta validation helper (`Validator::required()`) for server-side enforcement via `register_post_meta()`

**Not included (remains in plugin territory):**

- Specific validation checks for core blocks (alt text, heading hierarchy, link text, etc.)
- Admin settings page for configuring check severity
- Any particular accessibility or content quality rules
- Opinionated defaults about what content should or should not be validated

The distinction is important: the API provides the *capability* to validate; plugins and themes provide the *rules*.

## Use Cases Enabled

A Validation API in core would enable a wide range of applications beyond accessibility:

- **Accessibility compliance** -- Plugins could enforce WCAG requirements (alt text, heading hierarchy, color contrast, link text quality)
- **Editorial standards** -- Publishers could enforce style guides (content length, required sections, brand guidelines)
- **SEO requirements** -- SEO plugins could validate meta descriptions, heading structure, and content quality
- **Legal compliance** -- Organizations could enforce required disclosures, copyright notices, or content warnings
- **Content governance** -- Enterprise teams could enforce content templates, required fields, and approval workflows
- **Educational platforms** -- Course builders could validate lesson structure, required elements, and content formatting
- **E-commerce** -- Product blocks could enforce required attributes (price, description, images with alt text)

## Benefits to the WordPress Ecosystem

1. **Consistent UX** -- All validation, regardless of source, would use the same UI patterns and severity model. Users learn one system.
2. **Reduced plugin conflicts** -- A standardized API prevents plugins from competing for the same UI space or conflicting with each other's save-locking.
3. **Lower barrier to entry** -- Plugin developers get validation capabilities "for free" through a simple registration API instead of building infrastructure.
4. **Accessibility by default** -- With the infrastructure in core, accessibility-focused plugins become trivial to build, encouraging an ecosystem of content quality tools.
5. **Performance optimization** -- Centralized validation can be optimized once (debouncing, memoization, efficient re-rendering) rather than every plugin solving these problems independently.

## Open Questions

1. **Data store** -- Should validation results live in a dedicated `@wordpress/data` store (e.g., `core/validation`) for better state management and cross-plugin coordination?
2. **Async validation** -- Should the filter hooks support async validation for server-side checks (e.g., link checking, content analysis)?
3. **Block.json integration** -- Could validation rules be declared in `block.json` for simple checks (e.g., `"required": true` on attributes), with JavaScript filters for complex logic?
4. **Core checks** -- Should WordPress ship with any default validation checks (e.g., image alt text), or should all checks come from plugins?

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

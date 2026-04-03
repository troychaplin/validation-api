=== Validation API ===

Contributors: areziaal, mikecorkum
Tags: validation, gutenberg, blocks, developer-tools, publishing
Requires at least: 6.7
Tested up to: 6.9
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

A developer-focused validation framework for the WordPress block editor. Register custom checks for blocks, post meta, and document structure.

== Description ==

Validation API is a pure validation framework for the WordPress block editor. It provides the infrastructure for registering and running custom validation checks across three scopes — blocks, post meta fields, and document-level editor state — without shipping any built-in checks of its own.

The plugin is designed to be extended by integrating plugins that define what valid content looks like for their use case. Whether that's accessibility compliance, SEO requirements, editorial standards, or custom business rules, Validation API provides a consistent registration pattern, a severity model, and real-time editor feedback.

**Three Validation Scopes:**

* **Block validation** — Check individual block attributes (alt text, link targets, heading levels, any attribute) in real-time as content is edited
* **Post meta validation** — Validate required or conditional post meta fields with visual feedback and optional publish prevention
* **Editor validation** — Run document-level checks that analyze the full blocks array (heading hierarchy, content structure, cross-block rules)

**Severity Model:**

Each check has a configurable severity level:

* **Error** — Prevents publishing until resolved; shown with a red indicator
* **Warning** — Advisory only; allows publishing; shown with a yellow indicator
* **None** — Check is disabled; no validation runs

All severity levels are filterable at runtime via `validation_api_check_level`, enabling a companion settings plugin to expose per-check configuration to site administrators without modifying registration code.

**For Developers:**

* Register checks using `validation_api_register_plugin()` with a scoped callback or class-based `CheckProvider` implementations
* Zero built-in checks — the framework ships clean; all checks come from integrating plugins
* `function_exists()` guard pattern for safe integration across plugin load orders
* Full PHP Registry API with singleton access for advanced use cases
* JavaScript validation runs client-side via `@wordpress/hooks` filters for real-time feedback
* REST endpoint at `/validation-api/v1/checks` returns all registered checks for companion tooling

**Integration Example:**

```php
add_action( 'validation_api_register_checks', function() {
    if ( ! function_exists( 'validation_api_register_plugin' ) ) {
        return;
    }

    validation_api_register_plugin(
        [ 'name' => 'My Plugin' ],
        function() {
            validation_api_register_block_check( 'core/image', [
                'name'      => 'alt_text',
                'error_msg' => 'Images must have alt text.',
                'level'     => 'error',
            ] );
        }
    );
} );
```

**Developer Resources:**

See the complete developer documentation in the plugin's `docs/` directory or on <a href="https://github.com/troychaplin/validation-api">GitHub</a>:

* Getting started guide — registration pattern, severity model, guard pattern
* Block, meta, and editor check guides — parameters, JS filters, examples
* API reference — all public functions, Registry methods, REST endpoint
* Architecture overview — PHP/JS data flow, hook system, design decisions

== Installation ==

**From WordPress Admin:**
1. Go to **Plugins → Add New** in your WordPress admin
2. Search for "Validation API"
3. Click "Install Now" and then "Activate"

**Manual Installation:**
1. Download the plugin files and upload to `/wp-content/plugins/validation-api/`
2. Activate the plugin through the **Plugins** menu in WordPress

After activation, the plugin is ready to receive check registrations from integrating plugins. No configuration is required.

To add a settings UI for configuring check severity levels, install a compatible companion settings plugin.

== Getting Involved ==

Source code and issue tracking are available on <a href="https://github.com/troychaplin/validation-api">GitHub</a>. Contributions, bug reports, and feature requests are welcome.

== Frequently Asked Questions ==

= Does this plugin do anything on its own? =

No. Validation API ships with zero built-in checks. After activation, no validation runs until an integrating plugin registers checks via the registration API.

= How do I add validation checks? =

Use `validation_api_register_plugin()` within a `validation_api_register_checks` action hook. See the `docs/guide/` directory for a complete getting started guide and examples.

= Can I control which checks are errors vs. warnings? =

Yes, in two ways. First, the registering plugin sets the default severity level. Second, any plugin can filter severity at runtime via the `validation_api_check_level` filter. This enables a companion settings plugin to let administrators configure severity per check without touching registration code.

= Where are the settings? =

Validation API has no settings UI. It is a framework. A separate companion settings plugin can consume the `validation_api_check_level` filter and the REST API to expose per-check configuration to administrators.

= What are the three validation scopes? =

* **Block** — Validates individual block attributes (e.g., alt text on images, link text on buttons)
* **Meta** — Validates post meta fields with real-time feedback and optional publish prevention
* **Editor** — Validates document-level concerns that require analyzing multiple blocks together (e.g., heading hierarchy)

= Does this work in the site editor? =

Yes. The plugin loads in both the post editor and site editor. The `editorContext` value exposed to JavaScript allows integrating plugins to apply different validation rules per context if needed.

= How do I migrate from Block Accessibility Checks? =

This plugin is the architectural successor to Block Accessibility Checks, rebuilt as a pure framework. The old `ba11yc_*` hooks and registry API are not present. See the integration guide in `docs/guide/` for the current registration pattern.

== Screenshots ==

1. **Validation Sidebar** - A custom sidebar displays error and warning messages that link to blocks in the content area
2. **Validation Popover** - Blocks with issues have an inline indicator that opens an information popover on click
3. **External Plugin Validation** - An external plugin using the Validation API to enforce rules on custom blocks and post meta

== Changelog ==

View the full <a href="https://github.com/troychaplin/validation-api/blob/main/CHANGELOG.md">changelog on GitHub</a>.

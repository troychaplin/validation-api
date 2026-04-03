<img src="assets/icon-256x256.png" alt="Validation API Plugin Banner" style="float: left; margin-right: 1.5em; height: auto; width: 128px;">
  
# Validation API

A pure validation framework for the WordPress block editor. Register validation checks for blocks, post meta fields, and editor-level content structure — with real-time feedback, visual indicators, and publish-locking. Zero built-in checks. Zero settings UI. Zero opinions. Just infrastructure.

Designed for Gutenberg core merge. External plugins provide the rules.

## Features

- **Three-Scope Validation:** Register checks for block attributes, post meta fields, and editor-level concerns (heading hierarchy, content structure, etc.)
- **Real-Time Editor Feedback:** Validation runs as users edit — instant visual indicators with red (error) and yellow (warning) borders on blocks
- **Publish Locking:** Error-level checks prevent publishing. Warnings show feedback but allow saving
- **Validation Sidebar:** All issues displayed in a unified sidebar panel, grouped by severity, with click-to-navigate to the offending block
- **Scoped Plugin Registration:** Declare your plugin identity once via `validation_api_register_plugin()` — all checks registered within the scope are automatically attributed
- **CheckProvider Interface:** Enterprise-scale class-based registration pattern for organizing checks across files and concerns
- **Filterable Severity:** Every check passes through the `validation_api_check_level` filter — any plugin can override severity at runtime
- **REST API:** Registered checks are exposed via `GET /validation-api/v1/checks` for admin tooling and companion packages
- **Multi-Context:** Works in both the post editor and the site editor
- **Extensible:** 20+ PHP actions/filters and 3 JS filters for complete customization

## How It Works

The Validation API provides three registries and a coordinator:

1. **Block Registry** — Validates block attributes (e.g., image alt text, button links)
2. **Meta Registry** — Validates post meta fields (e.g., required SEO description)
3. **Editor Registry** — Validates document-level concerns (e.g., heading hierarchy)

Each registered check has a severity level (`error`, `warning`, or `none`) that determines its behavior. The coordinator locks/unlocks publishing based on whether any errors exist.

The plugin ships no built-in checks — it's a framework. Install a companion plugin or write your own checks.

## Demo

> Recorded against the previous version of this plugin — the UI and plugin name differ, but the core validation behaviour demonstrated is the same.

[![Validation API demo video](https://img.youtube.com/vi/mLsC2tDcdL8/maxresdefault.jpg)](https://www.youtube.com/watch?v=mLsC2tDcdL8)

## Severity Model

| Level | Behavior |
|---|---|
| `error` | Prevents saving. Shows red indicator. Filter can override. |
| `warning` | Shows yellow indicator. Allows saving. Filter can override. |
| `none` | Check is disabled. Skipped entirely. |
| *(omitted)* | Defaults to `error`. Filter can override. |

Every active check passes through the `validation_api_check_level` filter, making all checks configurable without the core plugin needing any storage:

```php
apply_filters(
    'validation_api_check_level',
    $registered_level,
    $context // [ 'scope' => 'block', 'block_type' => 'core/image', 'check_name' => 'alt_text' ]
);
```

## Quick Start

### Register a Plugin with Checks

```php
add_action( 'init', function() {
    if ( ! function_exists( 'validation_api_register_plugin' ) ) {
        return;
    }

    validation_api_register_plugin(
        [ 'name' => 'My Content Rules' ],
        function() {
            validation_api_register_block_check( 'core/image', [
                'name'        => 'alt_text',
                'level'       => 'error',
                'description' => 'Images must have alt text',
                'error_msg'   => 'This image is missing alt text.',
                'warning_msg' => 'Consider adding alt text to this image.',
            ] );
        }
    );
} );
```

### Add JavaScript Validation Logic

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'validation_api_validate_block',
    'my-plugin/image-alt',
    ( isValid, blockType, attributes, checkName ) => {
        if ( blockType === 'core/image' && checkName === 'alt_text' ) {
            return !! attributes.alt && attributes.alt.trim().length > 0;
        }
        return isValid;
    }
);
```

### Enterprise Pattern (Class-Based)

```php
use ValidationAPI\Contracts\CheckProvider;

class ImageChecks implements CheckProvider {
    public function register(): void {
        validation_api_register_block_check( 'core/image', [
            'name'        => 'alt_text',
            'level'       => 'error',
            'description' => 'Images must have alt text',
            'error_msg'   => 'This image is missing alt text.',
            'warning_msg' => 'Consider adding alt text to this image.',
        ] );
    }
}

// In your plugin bootstrap:
add_action( 'init', function() {
    if ( ! function_exists( 'validation_api_register_plugin' ) ) {
        return;
    }

    validation_api_register_plugin(
        [ 'name' => 'Enterprise Content Rules' ],
        [
            ImageChecks::class,
            HeadingChecks::class,
            MetaChecks::class,
        ]
    );
} );
```

## Companion Settings Package

The **[validation-api-settings](https://github.com/troychaplin/validation-api-settings)** companion plugin provides an admin settings page built on WordPress DataForm. It reads all registered checks and lets admins override severity levels globally — no code required.

The core plugin has no settings UI and no storage. The companion bridges admin settings to the `validation_api_check_level` filter via `wp_options`.

## Requirements

- WordPress 6.7 or higher
- PHP 7.0 or higher
- Gutenberg block editor (classic editor not supported)

## Documentation

### Developer Guide

- **[Getting Started](docs/guide/README.md)** — Register your first check in 30 lines
- **[Block Checks](docs/guide/block-checks.md)** — Validate block attributes
- **[Meta Checks](docs/guide/meta-checks.md)** — Validate post meta fields
- **[Editor Checks](docs/guide/editor-checks.md)** — Validate document-level concerns
- **[Severity Model](docs/guide/severity.md)** — Error vs. warning vs. none, and runtime overrides
- **[CheckProvider Pattern](docs/guide/check-providers.md)** — Class-based registration for enterprise plugins
- **[Examples](docs/guide/examples.md)** — Complete integration examples

### Technical Reference

- **[Architecture](docs/technical/README.md)** — System design and internals
- **[Data Flow](docs/technical/data-flow.md)** — PHP → JS pipeline
- **[Hooks Reference](docs/technical/hooks.md)** — All PHP and JS hooks
- **[API Reference](docs/technical/api.md)** — Public functions and contracts
- **[Design Decisions](docs/technical/decisions.md)** — Why the API is shaped this way

## Getting Involved

### Get Started

- Fork this repo
- Create a branch off of `main`
- Clone your fork locally
- Run the following in the repo root:
    - `npm -g i @wordpress/env` — installs wp-env if you don't already have it
    - `pnpm install` — installs project dependencies

### Start Developing

This repo uses [@wordpress/env](https://github.com/WordPress/gutenberg/tree/HEAD/packages/env#readme) for a local WordPress environment via Docker.

- Make sure `Docker Desktop` is running
- Start WordPress: `wp-env start`
- Start watch task: `pnpm start`
- Build assets: `pnpm build`
- Stop WordPress: `wp-env stop`

### Local Site Details

- http://localhost:8888
- User: `admin`
- Password: `password`

### Contributing

1. Ensure your code follows WordPress coding standards
2. Run `pnpm build` to build production assets
3. Test in both the post editor and site editor
4. Create a PR from your branch into the primary repo
5. Provide detailed info in the PR template

## Support

For bug reports, feature requests, or questions:

1. Check the [Documentation](docs/README.md)
2. Search existing GitHub issues before creating new ones
3. Provide detailed reproduction steps for bugs
4. Include WordPress version, PHP version, and block details

## License

This project is licensed under the GPL v2 or later — see the [LICENSE](LICENSE) file for details.

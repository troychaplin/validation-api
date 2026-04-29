# Validation API

A framework for content-validation checks in the WordPress block editor. Plugins register checks declaratively; the framework handles real-time feedback, visual indicators, publish locking, and admin introspection.

No built-in checks. No settings UI. No opinions about what should be validated. The core plugin is infrastructure — your plugin supplies the rules.

Designed for eventual inclusion in Gutenberg core. See [docs/PROPOSAL.md](docs/PROPOSAL.md).

▶ **[Watch the 2-minute demo on YouTube](https://www.youtube.com/watch?v=mLsC2tDcdL8)** (recorded against an earlier version — the UI and plugin name differ, but the behaviour is the same).

## Quick start

Register a validation check in two steps.

**PHP — declare the check** (in your plugin, on `init`):

```php
add_action( 'init', function () {
    if ( ! function_exists( 'validation_api_register_block_check' ) ) {
        return;
    }

    validation_api_register_block_check( 'core/image', [
        'namespace'   => 'my-content-rules',
        'name'        => 'alt_text',
        'level'       => 'error',
        'description' => 'Images must have alt text',
        'error_msg'   => 'This image is missing alt text.',
        'warning_msg' => 'Consider adding alt text to this image.',
    ] );
} );
```

**JS — implement the logic** (in your plugin's editor bundle):

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'editor.validateBlock',
    'my-plugin/image-alt',
    ( isValid, blockType, attributes, checkName ) => {
        if ( blockType === 'core/image' && checkName === 'alt_text' ) {
            return !! attributes.alt?.trim();
        }
        return isValid;
    }
);
```

That's it. The editor now shows a red border on images without alt text, adds an entry to the validation sidebar, and blocks the publish button until the issue is resolved.

See [docs/guide/README.md](docs/guide/README.md) for the full walkthrough and [docs/guide/examples.md](docs/guide/examples.md) for more patterns.

## Three validation scopes

Each registered check falls into one of three scopes, with a matching registration function and JS filter:

| Scope | Validates | PHP | JS filter |
|---|---|---|---|
| **Block** | Attributes on a specific block type | `validation_api_register_block_check()` | `editor.validateBlock` |
| **Meta** | Post meta fields | `validation_api_register_meta_check()` | `editor.validateMeta` |
| **Editor** | Document-level concerns (heading hierarchy, required sections) | `validation_api_register_editor_check()` | `editor.validateEditor` |

All three route through a single `core/validation` `@wordpress/data` store, so UI components subscribe once and see every issue.

## Severity model

| Level | Behaviour |
|---|---|
| `error` | Red indicator. Blocks publishing. |
| `warning` | Yellow indicator. Allows saving. |
| `none` | Skipped entirely. |

Every active check passes through the `validation_api_check_level` filter at runtime. The core plugin has no storage — `wp_options`, admin pages, persistence of any kind are out of scope. Configurability is delegated entirely to the filter:

```php
add_filter( 'validation_api_check_level', function ( $level, $context ) {
    // $context => [ 'scope' => 'block', 'block_type' => 'core/image', 'check_name' => 'alt_text' ]
    if ( 'block' === $context['scope'] && 'alt_text' === $context['check_name'] ) {
        return 'warning'; // soften from error to warning
    }
    return $level;
}, 10, 2 );
```

A companion plugin ([validation-api-settings](https://github.com/troychaplin/validation-api-settings)) hooks this filter and provides an admin UI for the common case — install it if you want a settings page without writing one.

## What you get

- **Real-time editor feedback** — red (error) and yellow (warning) borders on blocks as the user edits
- **Debounced validation** — 300 ms per-block to avoid thrashing on rapid input
- **Validation sidebar** — unified list of issues grouped by severity, with click-to-navigate
- **Publish locking** — errors set `lockPostSaving`; a second gate on `editor.preSavePost` aborts direct save dispatches as a safety net
- **Body CSS classes** — `has-validation-errors` / `has-validation-warnings` on `<body>` for theme/plugin styling
- **Per-block CSS classes** — `validation-api-block-error` / `validation-api-block-warning` on block wrappers for targeted styling
- **Meta-field styling hooks** — `useMetaField` hook returns props to spread onto a `TextControl`, including validation-aware class + help text
- **REST introspection** — `GET /wp-validation/v1/checks` returns every registered check with plugin attribution, keyed by scope
- **Editor-settings integration** — PHP-to-JS config flows through the standard `block_editor_settings_all` filter; no `window.*` globals
- **Extensible** — 20+ PHP actions/filters + 3 JS filters + 1 async pre-save filter for full customisation
- **Post-editor scoped** — validation only runs in the post/page editor, not the site editor (template validation is out of scope)

## Requirements

- WordPress 6.7 or higher
- PHP 7.0 or higher
- The block editor (classic editor not supported)

## Related plugins

- **[validation-api-settings](https://github.com/troychaplin/validation-api-settings)** — Admin UI for overriding check severity. Hooks `validation_api_check_level` and persists overrides in `wp_options`. Install only if you want a settings screen; the core plugin runs fine without it.
- **[validation-api-integration-example](https://github.com/troychaplin/validation-api-integration-example)** — Demo plugin that registers 9 checks (4 block, 3 meta, 2 editor) against a "Band" custom post type. Useful as a reference when writing your own integration.

## Documentation

**For plugin developers**

- [Getting started](docs/guide/README.md)
- [Block checks](docs/guide/block-checks.md)
- [Meta checks](docs/guide/meta-checks.md)
- [Editor checks](docs/guide/editor-checks.md)
- [Severity model](docs/guide/severity.md)
- [Examples](docs/guide/examples.md)
- [Troubleshooting](docs/guide/troubleshooting.md)

**For contributors and core reviewers**

- [Architecture](docs/technical/README.md)
- [Data flow](docs/technical/data-flow.md)
- [Hooks reference](docs/technical/hooks.md)
- [API reference](docs/technical/api.md)
- [Design decisions](docs/technical/decisions.md)

**For the Gutenberg core-merge effort**

- [Proposal](docs/PROPOSAL.md)
- [Integration plan](docs/INTEGRATION.md)
- [PR readiness](docs/PR-READINESS.md)

## Contributing

1. Fork the repo and create a branch off `main`
2. `pnpm install`
3. `pnpm start` for watch-mode development, `pnpm build` for production
4. `pnpm test` runs the Jest suite, `pnpm lint` runs JS/PHP/CSS linting
5. Test in a block editor instance before opening a PR
6. Fill out the PR template with detail

WordPress coding standards are enforced by PHPCS and ESLint. Prettier and phpcbf auto-fix most formatting issues — run `pnpm format` before committing.

## License

GPL v2 or later — see [LICENSE](LICENSE).

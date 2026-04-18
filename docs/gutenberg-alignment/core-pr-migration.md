# Core-PR Migration Guide

Changes that only make sense when cutting the actual Gutenberg core pull request — deferred from the standalone-plugin alignment work. This document is the authoritative checklist for producing a core-ready codebase.

**This document is not active until all five NOW-batches from [consolidated-plan.md](consolidated-plan.md) have shipped.**

For the proposal that sets up this migration, see [docs/PROPOSAL.md](../PROPOSAL.md).

## When to activate this doc

Activate when all of the following are true:
- [ ] Batches 1–5 (consolidated plan) are complete and verified
- [ ] Plugin has been released and is stable in standalone form
- [ ] Gutenberg team has responded favorably to the proposal (or you've decided to submit regardless)
- [ ] Target WordPress version for the merge is known (e.g., WP 6.9)
- [ ] You have a local `gutenberg/` trunk checkout on a fresh PR branch

## Why these are deferred

Each deferred item either:
1. Would break the plugin's standalone functionality (e.g., text domain change breaks localization)
2. Is meaningless until the target WP version is known (e.g., `@since` tags)
3. Requires Gutenberg-core-team input (e.g., final REST namespace, CSS class prefix)
4. Makes the code harder to maintain as a standalone plugin (e.g., PSR-4 → flat WP-core style)

## Migration overview

Five major migrations:

| # | Migration | Blocker until | Est. effort |
|---|---|---|---|
| 1 | PHP architecture: PSR-4 namespaced classes → WP-core flat `class-wp-*.php` | PR branch cut | Large (rewrite PHP tree) |
| 2 | JS package mount: standalone plugin → Gutenberg package inside `packages/validation/` | PR branch cut | Medium |
| 3 | i18n: `'validation-api'` text domain → `'gutenberg'` (plugin) or `'default'` (core) | PR branch cut | Small (find-replace) |
| 4 | Versioning: `@since 1.0.0` → target WP version | WP version known | Small |
| 5 | Naming: CSS classes, namespace keys, tag prefixes | Core review | Small-medium |

## Target PHP architecture

### File tree after migration

```
gutenberg/lib/validation/
├── load.php                                      # require_once chain, hook registrations
├── class-wp-validation-registry.php              # Abstract base (renamed from AbstractRegistry)
├── class-wp-validation-block-registry.php        # from Block\Registry
├── class-wp-validation-meta-registry.php         # from Meta\Registry
├── class-wp-validation-editor-registry.php       # from Editor\Registry
└── class-wp-rest-validation-checks-controller.php # from Rest\ChecksController
```

### Class renaming map

| Current (standalone) | Target (core) |
|---|---|
| `ValidationAPI\AbstractRegistry` | `WP_Validation_Registry` |
| `ValidationAPI\Block\Registry` | `WP_Validation_Block_Registry` |
| `ValidationAPI\Meta\Registry` | `WP_Validation_Meta_Registry` |
| `ValidationAPI\Editor\Registry` | `WP_Validation_Editor_Registry` |
| `ValidationAPI\Rest\ChecksController` | `WP_REST_Validation_Checks_Controller` |
| `ValidationAPI\Core\Plugin` | (removed; replaced by functions in `load.php`) |
| `ValidationAPI\Core\Assets` | (removed; functions in `load.php` or `client-assets.php`) |
| `ValidationAPI\Core\Traits\Logger` | Inlined (WP core doesn't use traits) |
| `ValidationAPI\Core\Traits\EditorDetection` | Inlined or moved to a helper function |

### Global function signatures (unchanged)

These stay identical — they're already core-style:
- `wp_register_block_validation_check( $block_type, $args )`
- `wp_register_meta_validation_check( $post_type, $args )`
- `wp_register_editor_validation_check( $post_type, $args )`

### Autoload change

- **Remove** Composer PSR-4 autoload (`composer.json` goes away or gets stripped)
- **Add** `require_once` chain in `lib/validation/load.php`:
  ```php
  require_once __DIR__ . '/class-wp-validation-registry.php';
  require_once __DIR__ . '/class-wp-validation-block-registry.php';
  require_once __DIR__ . '/class-wp-validation-meta-registry.php';
  require_once __DIR__ . '/class-wp-validation-editor-registry.php';
  require_once __DIR__ . '/class-wp-rest-validation-checks-controller.php';
  ```
- **Include** `lib/validation/load.php` from Gutenberg's main `lib/load.php` or equivalent loader

### Trait migration

- `Logger` trait's `log_error()` and `log_debug()` methods: inline as two standalone functions (likely `_wp_validation_log_error()`, `_wp_validation_log_debug()`) or use the `wp_trigger_error()` / `error_log()` conventions preferred by core. Confirm the current WP core convention at migration time.
- `EditorDetection` trait: collapse the `get_editor_context()` logic into a helper function in `lib/validation/load.php` (e.g., `_wp_validation_get_editor_context()`).

### Singleton preservation

WP core-style singletons still work — the existing pattern (`private __construct` + `static $instance` + `get_instance()`) is fine. `WP_Connector_Registry` in `gutenberg/lib/compat/wordpress-7.0/class-wp-connector-registry.php` is a direct analog and can be referenced.

## Target JS package

### Target location

```
gutenberg/packages/validation/
├── package.json
├── README.md
├── CHANGELOG.md
├── src/
│   ├── index.js
│   ├── store/
│   ├── hooks/
│   ├── components/
│   ├── utils/
│   └── style.scss
└── build/, build-module/, build-types/   # generated
```

### Migration steps

1. `git mv wp-content/plugins/validation-api/src gutenberg/packages/validation/src`
2. Copy `package.json` pattern from an existing Gutenberg package (e.g., `packages/notices/package.json`) and adapt:
   - `name: "@wordpress/validation"`
   - `version: "0.1.0"` or per Gutenberg's versioning policy
   - `sideEffects` declaration as in current standalone `package.json`
   - `wpScript: true`
   - `react-native`, `exports`, `main`, `module`, `types` fields per Gutenberg convention
3. Delete `wp-content/plugins/validation-api/` from working copy (or keep as a cross-check for the migration)
4. Update `lerna.json` and `package.json` in Gutenberg root to include the new package in the monorepo

### Sidebar mount migration

**Current (standalone):**
```js
// src/hooks/register-sidebar.js
registerPlugin( 'core-validation', { render: ValidationPlugin } );
```

**Target (core):**
The sidebar becomes a direct child of the editor layout, mounted via `<ComplementaryArea>` from `@wordpress/interface`. No `registerPlugin` call.

Approach: pattern match on how Gutenberg's own Document and Block sidebars mount — they're rendered directly inside `packages/editor/src/components/sidebar/` or equivalent. The validation sidebar would sit alongside them.

Reference file to diff against at migration time: `gutenberg/packages/editor/src/components/sidebar/index.js` (or the current-trunk equivalent).

### Side-effect hooks

The `src/hooks/` pattern works identically in core. `src/hooks/index.js` continues to import side-effect files on package load. One change: the `ValidationPlugin` root component (which currently calls `useValidationSync` + `useValidationLifecycle`) no longer needs to exist as a `registerPlugin` payload — those hooks would be called from wherever the core sidebar is mounted, or from a dedicated `<ValidationLifecycle>` mount inside the editor provider tree.

### Webpack / build

Gutenberg's monorepo build handles packages automatically via the root config. The standalone plugin's `webpack.config.js` goes away.

## Target i18n

### PHP side

**Mechanical find-and-replace in the migrated `lib/validation/` files:**

- `__( 'text', 'validation-api' )` → `__( 'text' )` (in WP core, default text domain is used by not specifying)
- OR `__( 'text', 'gutenberg' )` if the code still lives in the Gutenberg plugin

Confirm target text domain from Gutenberg's `phpcs.xml.dist` at migration time. Gutenberg currently accepts both `'gutenberg'` and `'default'` per:

```xml
<rule ref="WordPress.WP.I18n">
  <property name="text_domain" type="array">
    <element value="gutenberg"/>
    <element value="default"/>
  </property>
</rule>
```

### JS side

- Remove text-domain argument from all `__()`, `_x()`, `_n()`, `sprintf( __( ... ) )` calls:
  ```js
  __( 'Validation', 'validation-api' )   →   __( 'Validation' )
  ```
- JS translations are loaded by `wp_set_script_translations()` in PHP (configured at enqueue time). No domain needed at the call site.

### `wp_set_script_translations` target

Currently called inline in `Core/Assets.php` (post-Batch-3). In core, the script registration happens in `gutenberg/lib/client-assets.php` or a similar loader. Follow the pattern used for other Gutenberg packages — they typically get auto-registered by the Gutenberg build pipeline.

## Target versioning

### `@since` tags

Find-and-replace all `@since 1.0.0` with the target WP version:
- `@since 1.0.0` → `@since 6.x.y` (where 6.x.y is the WP version the feature will ship in)

**Do not do this until the target version is confirmed.** Gutenberg PR reviews sometimes reassign version targets during review.

### `@package` tags

- PHP: `@package ValidationAPI` → `@package gutenberg` (while in plugin) or `@package WordPress` (once merged to core)
- JS: usually no `@package` tags in JSDoc

## Target naming (CSS classes, internal keys)

### CSS class prefix

Currently `validation-api-*`. Target prefix options (pick one after core review):
- `wp-validation-*` — neutral, matches other core UI patterns
- `editor-validation-*` — if scoped to post editor
- `validation-*` — minimalist but may collide

**Mechanical migration steps** once prefix is locked:

1. Find-and-replace in SCSS: `validation-api-` → `NEW_PREFIX-`
2. Find-and-replace in JS `className={ ... }` and template literals: same
3. Find-and-replace in `withBlockValidationClasses.js` constants
4. Search for any DOM queries using the old classes and update

### Editor settings key

Currently `validationApi` in `block_editor_settings_all` injection. Target:
- `validation` (if namespace is clean enough)
- `__experimentalValidation` (if initial merge is experimental)

Pick based on Gutenberg's conventions at migration time. Recent examples: `__experimentalFeatures`, `__experimentalGlobalStylesUserEntityId`.

### Store name

Currently `core/validation`. **Keep this.** Already core-style. Confirm no collision at migration time.

### Global namespace registration key

Internal `_namespace` field stamped from `namespace` arg. Keep; it's internal implementation.

### PHP hook names

All `wp_validation_*` prefixed hooks stay — already core-style. No rename.

### JS filter names

`editor.validateBlock`, `editor.validateMeta`, `editor.validateEditor` — already core-style (`editor.*` namespace). No rename.

## Target REST namespace

Currently `wp-validation/v1/checks`. Core review will decide:

- **Option A:** `wp/v2/validation-checks` — if validation becomes a stable core feature
- **Option B:** `wp-block-editor/v1/validation-checks` — if it's editor-specific
- **Option C:** Keep `wp-validation/v1/checks` — if the feature is considered its own namespace

Mechanical migration:
1. Update `$this->namespace` and `$this->rest_base` in the REST controller
2. Update the settings addon's `apiFetch` path — but the settings addon probably doesn't come to core; it stays a plugin
3. Update documentation

## PR branch cut — procedure

Suggested procedure for creating the actual PR:

1. Clone Gutenberg trunk locally if not already present
2. Create a feature branch: `feat/validation-api`
3. Copy PHP tree to `lib/validation/` with rename (see PHP architecture section)
4. Copy JS tree to `packages/validation/src/` (see JS package section)
5. Add `packages/validation/package.json` based on a similar package
6. Run mechanical find-and-replace migrations (text domain, `@since`, CSS prefix, `@package`)
7. Inline trait methods (Logger, EditorDetection)
8. Remove `Core/Plugin.php` initialization pattern; replace with functional `lib/validation/load.php`
9. Wire the new `lib/validation/` loader into Gutenberg's main loader
10. Register the new `packages/validation/` in `lerna.json` and root `package.json`
11. Adapt sidebar mount to use `ComplementaryArea` directly instead of `registerPlugin`
12. Run Gutenberg's `npm run build` and `phpcs`
13. Fix any core-convention violations caught by lint
14. Smoke test: activate Gutenberg in a local WP, register a test check, verify it surfaces in the editor

## PR description template

Starter content for the PR description — flesh out per Gutenberg's contribution guidelines at submission time:

```
## What?

Introduces a Validation API for the block editor — a declarative framework for
registering, executing, and displaying content validation checks in real time.

## Why?

[Reference docs/PROPOSAL.md — summarize the problem and existing primitives.]

## How?

- Three validation scopes (block, meta, editor) with corresponding PHP registries
  and JS filter hooks
- Dedicated @wordpress/data store (core/validation)
- Severity model (error/warning/none) with runtime override filter
- Editor UI: sidebar (issue list), per-block toolbar button, body CSS classes
- Post-save gate via editor.preSavePost + lockPostSaving
- No new low-level primitives — built on existing @wordpress/hooks, @wordpress/data,
  lockPostSaving, @wordpress/interface, block editor filter hooks

## Testing Instructions

[Provide register-a-check example + verification flow]

## Screenshots/Videos

[Sidebar showing issues, toolbar button, save-locked state, save attempt with error]

## References

- Proposal: [link to publicly-hosted PROPOSAL.md]
- Reference implementation as plugin: [github.com/troychaplin/validation-api]
- Integration example: [github.com/troychaplin/validation-api-integration-example]
- Companion settings plugin (not proposed for core): [github.com/troychaplin/validation-api-settings]
```

## Open questions for core review

Track these separately when submitting — the PR discussion will resolve them:

1. **REST namespace** — core team's preference (see Target REST Namespace)
2. **CSS class prefix** — core team's preference (see Target Naming)
3. **Editor settings key** — `validation` vs `__experimentalValidation` (see Target Naming)
4. **Whether API ships as a package** (`@wordpress/validation`) or lives inside `@wordpress/editor`
5. **Site editor support** — currently excluded; core team may want template validation considered
6. **Async validation via `applyFiltersAsync` on `editor.validateBlock`** — current filters are sync; core team may want async design
7. **Block.json validation declaration** — is there appetite for declarative simple checks in block.json (e.g., `"attributes": { "alt": { "validation": { "required": true } } }`)?
8. **TypeScript conversion timeline** — full TS now, partial, or defer?

## Items NOT requiring migration

These stay as-is through core merge:

| Item | Reason |
|---|---|
| Global PHP function names (`wp_register_*_check`) | Already core-style |
| JS filter names (`editor.validate*`) | Already core-style |
| Store name (`core/validation`) | Already core-style |
| PHP hook prefix (`wp_validation_*`) | Already core-style |
| Severity model (`error`/`warning`/`none`) | Stable |
| `block_editor_settings_all` injection | Canonical mechanism |
| Registry singleton pattern | Matches `WP_Connector_Registry` |
| HOC-via-filter approach for block integrations | Matches recent Gutenberg patterns |
| `lockPostSaving` + `editor.preSavePost` save-locking | Canonical pair |

## Notes

- The companion settings plugin (`validation-api-settings`) does NOT migrate to core. It stays a standalone plugin that consumes the core API via REST + filter. Its ongoing maintenance is separate.
- The integration example plugin is a documentation artifact; it doesn't migrate either, but its patterns should be preserved as live documentation.
- If the PR is rejected or stalls, the standalone plugin can continue to ship independently. No work in this migration doc is irreversible; it's a translation of the standalone form into core-style.

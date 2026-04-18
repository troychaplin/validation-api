# Troubleshooting

Common issues you may run into when integrating with the Validation API, and how to diagnose them.

For a conceptual overview of how data moves through the system, see [docs/technical/data-flow.md](../technical/data-flow.md).

## My check is registered but doesn't appear in the sidebar

Most common causes, in order:

1. **Severity is set to `'none'`.** Checks at level `'none'` are filtered out entirely — they don't surface in the sidebar, don't participate in save locking, and don't appear in the REST response. Check what the effective level is:

   ```
   http://<your-site>/wp-json/wp-validation/v1/checks
   ```

   Look for your check in the response. If `level: 'none'`, something is overriding it — most likely the settings companion plugin. Open that plugin's settings page (`/wp-admin/?page=validation-api-settings`) and raise the level back to `'warning'` or `'error'`.

2. **The validation hook returns `true` (valid).** The sidebar only lists *invalid* results. If your `editor.validateBlock` / `editor.validateMeta` / `editor.validateEditor` filter callback always returns `true`, nothing surfaces. Add a `console.log` inside your filter to confirm it's being called and returning the expected value.

3. **`check_name` mismatch.** The filter callback's `checkName` parameter must match the `name` field you passed to `wp_register_block_validation_check()`. A typo here silently does nothing.

4. **Wrong scope / post type.** Meta and editor checks register per post type. If you registered for `'post'` but you're editing a `'page'`, the check isn't loaded.

5. **You're in the site editor.** Validation is intentionally not loaded in the site editor (template/global-styles editing). Switch to the post editor to see checks fire.

## My validation function isn't being called

1. **Filter name typo.** The three filter names are:
   - `editor.validateBlock`
   - `editor.validateMeta`
   - `editor.validateEditor`

   (Note the camelCase and the `editor.` prefix.)

2. **`function_exists` guard returned early.** If the Validation API plugin is deactivated or not loaded yet when your `init` callback runs, registration is skipped. Check:

   ```php
   add_action( 'init', function() {
       if ( ! function_exists( 'wp_register_block_validation_check' ) ) {
           return; // ← if this fires, your check never registers
       }
       // ...
   } );
   ```

3. **JS bundle not enqueued.** Your plugin's JS must be loaded in the block editor. If you're using `wp-scripts`, the default build output + enqueue should handle this. Confirm the JS file loads by checking the browser's Network tab.

4. **Filter added too late.** `addFilter` calls at module scope (top of file) are safe — they register at page load. If you add filters inside a `useEffect` or event handler, they may register after the validation runner has already run. Move them to module scope.

## The REST endpoint returns 401 Unauthorized

The endpoint requires `manage_options`. You need to be logged in as an administrator.

Direct URL access in a browser works if you're logged in via cookies. `curl` needs auth:

```bash
curl -u admin:password 'http://localhost/wp-json/wp-validation/v1/checks'
```

Or with an application password, use the `--user` flag:

```bash
curl --user admin:abcd-1234-efgh-5678 'http://localhost/wp-json/wp-validation/v1/checks'
```

## The REST endpoint returns 404

1. **Permalink rewrite cache.** Rare, but if other REST endpoints also 404, go to Settings → Permalinks → Save (no changes needed — just flush). REST itself doesn't use rewrite rules, but some hosting/caching setups interfere with `/wp-json/`.

2. **The plugin isn't active.** Confirm Validation API is activated in the Plugins screen. The REST controller only registers when the plugin loads.

3. **Old path cached in your browser/bundle.** The endpoint moved from `wp/v2/validation-checks` to `wp-validation/v1/checks`. If you're seeing a 404 on the old path, rebuild any consuming bundle and hard-reload (Cmd+Shift+R / Ctrl+F5 with "Disable cache" in DevTools).

## Block borders don't appear on invalid blocks

The red/yellow border is applied by the `editor.BlockListBlock` filter reading per-block state from the `core/validation` store. Common causes of missing borders:

1. **Stale browser cache.** Hard-reload the editor page with cache disabled.

2. **Your check always returns `true`.** No issues = no borders. See the "validation function isn't being called" section above.

3. **CSS conflict.** The border classes are `validation-api-block-error` and `validation-api-block-warning`. A theme stylesheet may override them. Inspect the block element in DevTools and confirm the class is present and the CSS rule is winning.

## Meta field doesn't show a border

Meta fields need the `useMetaField` (or `useMetaValidation`) hook to be wired into the TextControl for border classes to apply.

If you're using a copy of `useMetaField` in your own plugin (common pattern in integration examples), make sure it reads from the `core/validation` store to get the validation state:

```js
const invalidMeta = select( 'core/validation' ).getInvalidMeta();
const thisField   = invalidMeta.find( m => m.metaKey === metaKey );
```

If your shim doesn't query the store, it has no way to know the field is invalid and won't apply the class.

## Save button stays disabled after fixing all issues

1. **Validation is still computing.** The per-block validation is debounced 300ms. Wait a second after fixing the last issue, then the publish button should re-enable.

2. **Something else is locking saving.** Other plugins can also call `lockPostSaving()`. In the browser console:

   ```js
   wp.data.select( 'core/editor' ).getPostLockUser()
   wp.data.select( 'core/editor' ).isPostSavingLocked()
   ```

   If `isPostSavingLocked()` is true, check which plugin owns the lock. Validation API locks under the key `'core/validation'`.

3. **An `editor.preSavePost` filter is throwing.** If you have other filters on `editor.preSavePost` from other plugins, one may be blocking. Try saving with other plugins temporarily deactivated to isolate.

## Page shows "The response is not a valid JSON response" when saving

Usually means the save is hitting a PHP error somewhere. Check `wp-content/debug.log` for the actual error. Common causes:

- A `validate_callback` in `register_post_meta()` is returning something that isn't `true` or a `WP_Error` (e.g., `false`, which confuses the REST controller)
- Another plugin is injecting invalid HTML into the response
- A PHP fatal error in any hook that fires during `editor.preSavePost` processing

The Validation API itself doesn't throw JSON-breaking errors on valid input, but its `editor.preSavePost` gate does throw to abort when errors exist — the client treats that as a save failure, which is the intended behavior.

## "The 'core-validation' plugin has encountered an error and cannot be rendered"

React error, usually a render loop or a null access. Open the browser console and look for the stack trace:

- **Error #185 (Maximum update depth exceeded):** Check that you haven't added a hook that both subscribes to `core/validation` and dispatches to it in the same component — that's an infinite loop. See [consolidated-plan.md](../gutenberg-alignment/consolidated-plan.md) Batch 1 section for the historical fix.
- **Cannot read property of undefined:** Usually a missing store (`select( 'core/validation' )` returning `null` because the store isn't registered yet). Confirm the Validation API plugin is active.

## My integration works locally but not on production

1. **Text domain mismatch.** The `function_exists` guard is the only cross-plugin dependency check; that works everywhere. But if you see translated strings in one environment and not another, confirm your plugin's text domain is loaded and your `.mo`/`.json` translation files are in place.

2. **Build not deployed.** The JS bundle has to be rebuilt after any filter-name change, and deployed. Check the file modified time on the production build output.

3. **Caching layers.** Varnish, page cache, or a CDN can serve a stale bundle. Bust the cache for your plugin's `build/` directory.

4. **Plugin load order.** Both plugins (Validation API + your plugin) need to load before `init` fires. If some plugin loader activation order differs between environments, your `function_exists` guard may fail in production but pass locally. Check `active_plugins` option in both.

## My settings override disappeared / reverted

The settings addon stores overrides in `wp_options['validation_api_settings']`. If you see a level you set revert to the default:

1. **Key format changed.** The override stored is keyed by scope + identifier + check_name. If you renamed a check, the stored override no longer matches and falls back to the default.
2. **Another filter is running later with a higher priority.** Debug by adding:
   ```php
   add_filter( 'wp_validation_check_level', function( $level, $context ) {
       error_log( 'wp_validation_check_level: ' . print_r( $context, true ) . ' → ' . $level );
       return $level;
   }, 999, 2 );
   ```
   This logs every call to the filter and the return value. Check the log to see what each filter in the chain does.

## I need more info

- [docs/guide/README.md](README.md) — Quickstart for integrating
- [docs/technical/data-flow.md](../technical/data-flow.md) — Full data flow diagram
- [docs/technical/hooks.md](../technical/hooks.md) — Every hook and filter with parameters
- [docs/technical/api.md](../technical/api.md) — Function signatures
- Browser console `wp.data.select('core/validation')` — Inspect live store state

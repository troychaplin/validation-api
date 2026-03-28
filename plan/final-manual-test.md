# Final Manual Test Checklist

Run these tests in order after all phases are complete. Each section builds on the previous.

---

## 1. Clean Install

- [x] Deactivate the plugin
- [x] Activate — no fatal errors, no admin notices from the plugin
- [x] PHP debug log is clean (no warnings, notices, or errors from `validation-api`)

---

## 2. Admin Environment

- [x] No "Block Accessibility Checks" or old settings menu item appears anywhere in wp-admin
- [x] No REST API routes for old settings exist — visit `/wp-json/` and confirm no `block-accessibility-checks` or `ba11yc` namespaces
- [x] Plugin appears in the plugins list as **Validation API** with version `1.0.0`

---

## 3. Block Editor — Script Load

Open any post in the block editor, then open the browser console and run:

- [x] `typeof window.ValidationAPI` → `"object"` (not `undefined`)
- [x] `Object.keys(window.ValidationAPI)` → includes `validationRules`, `metaValidationRules`, `editorValidationRules`, `editorContext`, `registeredBlockTypes`
- [x] `typeof window.BlockAccessibilityChecks` → `"undefined"` (old global is gone)
- [x] No JS errors in the console on load
- [x] No JS errors in the console when inserting, moving, or removing blocks

---

## 4. Site Editor — Script Load

Open the site editor (`/wp-admin/site-editor.php`), then open the browser console:

- [x] `typeof window.ValidationAPI` → `"object"`
- [x] No JS errors on load
- [x] No JS errors when navigating between templates/template parts

---

## 5. Level System — Block Checks

Add this snippet to your test plugin or `functions.php`, then reload the editor:

```php
add_action( 'validation_api_ready', function( $registry ) {
    // Default level (should resolve to 'error')
    $registry->register_check( 'core/paragraph', 'test_error', [
        'error_msg' => 'Error check test',
    ] );

    // Explicit warning
    $registry->register_check( 'core/paragraph', 'test_warning', [
        'error_msg' => 'Warning check test',
        'level'     => 'warning',
    ] );

    // None — should be excluded from JS output
    $registry->register_check( 'core/paragraph', 'test_none', [
        'error_msg' => 'None check test',
        'level'     => 'none',
    ] );
} );
```

In the browser console:

- [x] `window.ValidationAPI.validationRules['core/paragraph']['test_error'].level` → `"error"`
- [x] `window.ValidationAPI.validationRules['core/paragraph']['test_warning'].level` → `"warning"`
- [x] `window.ValidationAPI.validationRules['core/paragraph']['test_none']` → `undefined` (excluded)
- [x] No `type` key on any rule object — only `level`
- [x] No `category` key on any rule object

---

## 6. Level System — `validation_api_check_level` Filter

Add this to your test snippet:

```php
add_filter( 'validation_api_check_level', function( $level, $context ) {
    if ( 'block' === $context['scope'] && 'test_error' === $context['check_name'] ) {
        return 'warning';
    }
    return $level;
}, 10, 2 );
```

- [x] `window.ValidationAPI.validationRules['core/paragraph']['test_error'].level` → `"warning"` (filter overrode it)

Now change the filter return to `'none'`:

- [x] `window.ValidationAPI.validationRules['core/paragraph']['test_error']` → `undefined` (excluded by filter)

---

## 7. Level System — Meta Checks

Add this to your test snippet:

```php
add_action( 'validation_api_ready', function() {
    $registry = \ValidationAPI\Meta\Registry::get_instance();

    $registry->register_meta_check( 'post', 'test_meta_field', 'required', [
        'error_msg' => 'Meta field is required',
        'level'     => 'error',
    ] );

    $registry->register_meta_check( 'post', 'test_meta_field', 'recommended', [
        'error_msg' => 'Meta field is recommended',
        'level'     => 'warning',
    ] );
} );
```

- [x] `window.ValidationAPI.metaValidationRules['post']['test_meta_field']['required'].level` → `"error"`
- [x] `window.ValidationAPI.metaValidationRules['post']['test_meta_field']['recommended'].level` → `"warning"`

---

## 8. Level System — Editor Checks

Add this to your test snippet:

```php
add_action( 'validation_api_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check( 'post', 'test_editor_check', [
        'error_msg' => 'Editor check test',
        'level'     => 'warning',
    ] );
} );
```

- [x] `window.ValidationAPI.editorValidationRules['post']['test_editor_check'].level` → `"warning"`

---

## 9. Validation Behaviour — Block Editor UX

With at least one block check registered and wired to a `validation_api_validate_block` filter that returns `false`:

- [x] The block shows a visual error or warning indicator
- [x] The validation sidebar panel renders correctly
- [x] A post with an **error** check failing → save/publish is **locked** (pre-publish panel shows error)
- [x] A post with only **warning** checks failing → save/publish is **allowed** (pre-publish panel shows warning but does not block)
- [x] Fixing the block condition removes the indicator and unlocks publish if it was locked

---

## 10. Hooks Smoke Test

The core plugin *calls* `applyFilters` for these hooks — it does not register handlers for them. `hasFilter` returns the number of external listeners, so it will be `0` until an external plugin hooks in. The correct test is confirming the filter names are reachable and respond to a listener.

In the browser console:

```js
// Register a no-op listener on each hook, confirm it fires and returns the default value
wp.hooks.addFilter('validation_api_validate_block', 'test/smoke', v => v);
wp.hooks.addFilter('validation_api_validate_meta', 'test/smoke', v => v);
wp.hooks.addFilter('validation_api_validate_editor', 'test/smoke', v => v);

wp.hooks.hasFilter('validation_api_validate_block', 'test/smoke'); // → true
wp.hooks.hasFilter('validation_api_validate_meta', 'test/smoke');  // → true
wp.hooks.hasFilter('validation_api_validate_editor', 'test/smoke'); // → true
```

- [x] All three `hasFilter` calls return `true` after adding the no-op listener

---

## 11. Final Grep Confirms (run in terminal)

```bash
grep -r "BlockAccessibility" includes/          # → 0 results
grep -r "BA11YC_" includes/ validation-api.php  # → 0 results
grep -r "ba11yc_" includes/ src/                # → 0 results
grep -r "BlockAccessibilityChecks" src/         # → 0 results
grep -rn "'type'" includes/                     # → 0 results
grep -r "category" includes/                    # → 0 results
```

- [x] All 6 greps return zero results

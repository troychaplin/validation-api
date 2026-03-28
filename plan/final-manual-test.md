# Final Manual Test Checklist

Run these tests in order after all phases are complete. Each section builds on the previous.

---

## 1. Clean Install

- [ ] Deactivate and delete the plugin from wp-admin
- [ ] Re-upload / reinstall the plugin
- [ ] Activate — no fatal errors, no admin notices from the plugin
- [ ] PHP debug log is clean (no warnings, notices, or errors from `validation-api`)

---

## 2. Admin Environment

- [ ] No "Block Accessibility Checks" or old settings menu item appears anywhere in wp-admin
- [ ] No REST API routes for old settings exist — visit `/wp-json/` and confirm no `block-accessibility-checks` or `ba11yc` namespaces
- [ ] Plugin appears in the plugins list as **Validation API** with version `1.0.0`

---

## 3. Block Editor — Script Load

Open any post in the block editor, then open the browser console and run:

- [ ] `typeof window.ValidationAPI` → `"object"` (not `undefined`)
- [ ] `Object.keys(window.ValidationAPI)` → includes `validationRules`, `metaValidationRules`, `editorValidationRules`, `editorContext`, `registeredBlockTypes`
- [ ] `typeof window.BlockAccessibilityChecks` → `"undefined"` (old global is gone)
- [ ] No JS errors in the console on load
- [ ] No JS errors in the console when inserting, moving, or removing blocks

---

## 4. Site Editor — Script Load

Open the site editor (`/wp-admin/site-editor.php`), then open the browser console:

- [ ] `typeof window.ValidationAPI` → `"object"`
- [ ] No JS errors on load
- [ ] No JS errors when navigating between templates/template parts

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

- [ ] `window.ValidationAPI.validationRules['core/paragraph']['test_error'].level` → `"error"`
- [ ] `window.ValidationAPI.validationRules['core/paragraph']['test_warning'].level` → `"warning"`
- [ ] `window.ValidationAPI.validationRules['core/paragraph']['test_none']` → `undefined` (excluded)
- [ ] No `type` key on any rule object — only `level`
- [ ] No `category` key on any rule object

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

- [ ] `window.ValidationAPI.validationRules['core/paragraph']['test_error'].level` → `"warning"` (filter overrode it)

Now change the filter return to `'none'`:

- [ ] `window.ValidationAPI.validationRules['core/paragraph']['test_error']` → `undefined` (excluded by filter)

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

- [ ] `window.ValidationAPI.metaValidationRules['post']['test_meta_field']['required'].level` → `"error"`
- [ ] `window.ValidationAPI.metaValidationRules['post']['test_meta_field']['recommended'].level` → `"warning"`

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

- [ ] `window.ValidationAPI.editorValidationRules['post']['test_editor_check'].level` → `"warning"`

---

## 9. Validation Behaviour — Block Editor UX

With at least one block check registered and wired to a `validation_api_validate_block` filter that returns `false`:

- [ ] The block shows a visual error or warning indicator
- [ ] The validation sidebar panel renders correctly
- [ ] A post with an **error** check failing → save/publish is **locked** (pre-publish panel shows error)
- [ ] A post with only **warning** checks failing → save/publish is **allowed** (pre-publish panel shows warning but does not block)
- [ ] Fixing the block condition removes the indicator and unlocks publish if it was locked

---

## 10. Hooks Smoke Test

In the browser console:

- [ ] `wp.hooks.hasFilter('validation_api_validate_block')` → `true` (the core runner is registered)
- [ ] `wp.hooks.hasFilter('validation_api_validate_meta')` → `true`
- [ ] `wp.hooks.hasFilter('validation_api_validate_editor')` → `true`

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

- [ ] All 6 greps return zero results

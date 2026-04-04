# Meta Checks

Meta checks validate post meta fields. Required SEO descriptions, custom field constraints, taxonomy-like metadata — if it's stored in `postmeta`, this is the scope to use.

Meta checks have a unique advantage: they integrate with WordPress's `register_post_meta()` for server-side validation. The same check can enforce on both the client (real-time feedback) and the server (save prevention).

## Registration (PHP)

Register a meta check with the `namespace` field to identify your plugin:

```php
wp_register_meta_validation_check( 'post', [
    'namespace'   => 'my-plugin',
    'name'        => 'required',
    'meta_key'    => 'seo_description',
    'level'       => 'error',
    'description' => 'SEO description is required',
    'error_msg'   => 'Posts must have an SEO description.',
    'warning_msg' => 'Consider adding an SEO description.',
] );
```

### Parameters

The first argument is the post type (e.g., `'post'`, `'page'`, `'my_cpt'`).

The second argument is an array of check configuration:

| Key | Type | Required | Default | Description |
|---|---|---|---|---|
| `namespace` | `string` | Yes | — | Identifier for the plugin registering this check |
| `name` | `string` | Yes | — | Unique identifier for this check |
| `meta_key` | `string` | Yes | — | The post meta key to validate |
| `error_msg` | `string` | Yes | — | Message shown when the check fails at error level |
| `warning_msg` | `string` | No | Same as `error_msg` | Message shown at warning level |
| `level` | `string` | No | `'error'` | Severity: `'error'`, `'warning'`, or `'none'` |
| `description` | `string` | No | `''` | Human-readable description |
| `priority` | `int` | No | `10` | Execution order |
| `enabled` | `bool` | No | `true` | Whether the check is active |

### Multiple Post Types

Register the same check for multiple post types by calling the function for each:

```php
foreach ( [ 'post', 'page' ] as $post_type ) {
    wp_register_meta_validation_check( $post_type, [
        'namespace' => 'my-plugin',
        'name'      => 'required',
        'meta_key'  => 'seo_description',
        'level'     => 'error',
        'error_msg' => 'SEO description is required.',
    ] );
}
```

## Validation Logic (JavaScript)

Use the `editor.validateMeta` filter:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'editor.validateMeta',
    'my-plugin/seo-description',
    ( isValid, value, postType, metaKey, checkName ) => {
        if ( metaKey === 'seo_description' && checkName === 'required' ) {
            return !! value && value.trim().length > 0;
        }
        return isValid;
    }
);
```

### Filter Parameters

| Parameter | Type | Description |
|---|---|---|
| `isValid` | `boolean` | Current validation state (default: `true`) |
| `value` | `any` | The current value of the meta field |
| `postType` | `string` | Post type (e.g., `'post'`) |
| `metaKey` | `string` | The meta key being validated |
| `checkName` | `string` | The check's `name` from PHP registration |

### Return Value

Return `true` if the field passes validation, `false` if it fails.

## Server-Side Validation with Meta\Validator

The `ValidationAPI\Meta\Validator` helper class bridges meta checks with WordPress's `register_post_meta()`. It registers the check with the Validation API and returns a `validate_callback` for server-side enforcement:

```php
use ValidationAPI\Meta\Validator;

register_post_meta( 'post', 'seo_description', [
    'show_in_rest'      => true,
    'single'            => true,
    'type'              => 'string',
    'validate_callback' => Validator::required( 'post', 'seo_description', [
        'error_msg'   => 'SEO description is required.',
        'warning_msg' => 'Consider adding an SEO description.',
        'level'       => 'error',
    ] ),
] );
```

### What Validator::required() Does

1. Registers the check with the Meta Registry (so the client-side validation is aware of it)
2. Returns a `validate_callback` function for `register_post_meta()`
3. The callback runs on save and returns a `WP_Error` if validation fails at `error` level
4. At `warning` level, the callback allows the save (client-side shows the warning)
5. At `none` level, the callback is a no-op

This means a single call handles both client-side and server-side validation for required fields.

### Validator Parameters

```php
Validator::required( string $post_type, string $meta_key, array $args = [] ): callable
```

| Arg Key | Type | Default | Description |
|---|---|---|---|
| `error_msg` | `string` | `'This field is required.'` | Error message |
| `warning_msg` | `string` | `'This field is recommended.'` | Warning message |
| `level` | `string` | `'error'` | Severity level |
| `check_name` | `string` | `'required'` | Check identifier |
| `description` | `string` | `''` | Human-readable description |

### When to Use Validator vs. Manual Registration

Use `Validator::required()` when you're already calling `register_post_meta()` and want both client and server validation in one step.

Use `wp_register_meta_validation_check()` directly when:
- You don't need server-side enforcement
- You need a custom validation rule beyond "required"
- You're validating meta that's registered elsewhere

## Meta Validation Data Flow

The meta validation path differs from block validation because meta values come from the post's metadata, not block attributes:

1. The Validation API reads registered meta checks from editor settings (`select('core/editor').getEditorSettings().validationApi.metaValidationRules`)
2. For each meta key with checks, the runner reads the current meta value via `wp.data`
3. The `editor.validateMeta` filter fires with the current value
4. Your callback returns pass/fail
5. Failed checks appear in the sidebar and contribute to publish locking

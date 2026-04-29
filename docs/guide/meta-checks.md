# Meta Checks

Meta checks validate post meta fields. Required SEO descriptions, custom field constraints, taxonomy-like metadata — if it's stored in `postmeta`, this is the scope to use.

Meta checks have a unique advantage: they integrate with WordPress's `register_post_meta()` for server-side validation. The same check can enforce on both the client (real-time feedback) and the server (save prevention).

## Registration (PHP)

Register a meta check with the `namespace` field to identify your plugin:

```php
validation_api_register_meta_check( 'post', [
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
    validation_api_register_meta_check( $post_type, [
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

## Server-Side Validation

For server-side enforcement, use WordPress's native `validate_callback` parameter on `register_post_meta()`. The Validation API handles client-side validation; server-side is up to you and happens at `register_post_meta()` time:

```php
register_post_meta( 'post', 'seo_description', [
    'show_in_rest'      => true,
    'single'            => true,
    'type'              => 'string',
    'validate_callback' => static function ( $value ) {
        if ( empty( trim( (string) $value ) ) ) {
            return new WP_Error(
                'seo_description_required',
                'SEO description is required.',
                [ 'status' => 400 ]
            );
        }
        return true;
    },
] );
```

Client-side validation (via `validation_api_register_meta_check()` + the `editor.validateMeta` JS filter) covers the editor experience. Server-side `validate_callback` covers REST writes and other non-editor save paths. They are independent; register both if you need both.

## Meta Validation Data Flow

The meta validation path differs from block validation because meta values come from the post's metadata, not block attributes:

1. The Validation API reads registered meta checks from editor settings (`select('core/editor').getEditorSettings().validationApi.metaValidationRules`)
2. For each meta key with checks, the runner reads the current meta value via `wp.data`
3. The `editor.validateMeta` filter fires with the current value
4. Your callback returns pass/fail
5. Failed checks appear in the sidebar and contribute to publish locking

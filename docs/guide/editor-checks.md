# Editor Checks

Editor checks validate the document as a whole. Heading hierarchy, minimum content length, required block types, content structure rules — anything that looks at the full set of blocks or the post itself, rather than a single block's attributes.

## Registration (PHP)

Register an editor check inside your `validation_api_register_plugin()` callback:

```php
validation_api_register_editor_check( 'post', [
    'name'        => 'heading_hierarchy',
    'level'       => 'warning',
    'description' => 'Headings should follow a logical hierarchy',
    'error_msg'   => 'Heading hierarchy is broken — headings skip levels.',
    'warning_msg' => 'Heading levels should not skip (e.g., H2 to H4).',
] );
```

### Parameters

The first argument is the post type (e.g., `'post'`, `'page'`, `'my_cpt'`).

The second argument is an array of check configuration:

| Key | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `string` | Yes | — | Unique identifier for this check within the post type |
| `error_msg` | `string` | Yes | — | Message shown when the check fails at error level |
| `warning_msg` | `string` | No | Same as `error_msg` | Message shown at warning level |
| `level` | `string` | No | `'error'` | Severity: `'error'`, `'warning'`, or `'none'` |
| `description` | `string` | No | `''` | Human-readable description |
| `priority` | `int` | No | `10` | Execution order |
| `enabled` | `bool` | No | `true` | Whether the check is active |

### Multiple Post Types

Register the same check for multiple post types:

```php
// Option 1: Loop
foreach ( [ 'post', 'page' ] as $post_type ) {
    validation_api_register_editor_check( $post_type, [
        'name'      => 'heading_hierarchy',
        'level'     => 'warning',
        'error_msg' => 'Heading hierarchy is broken.',
    ] );
}
```

The Editor Registry also provides a bulk registration method on the registry class, but for most integrations the loop pattern above is simpler.

## Validation Logic (JavaScript)

Use the `validation_api_validate_editor` filter. Unlike block checks, editor checks receive the full array of blocks:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'validation_api_validate_editor',
    'my-plugin/heading-hierarchy',
    ( isValid, blocks, postType, checkName, rule ) => {
        if ( checkName !== 'heading_hierarchy' ) {
            return isValid;
        }

        const headings = getHeadingsFromBlocks( blocks );
        return validateHierarchy( headings );
    }
);

function getHeadingsFromBlocks( blocks ) {
    const headings = [];
    for ( const block of blocks ) {
        if ( block.name === 'core/heading' ) {
            headings.push( block.attributes.level );
        }
        if ( block.innerBlocks?.length ) {
            headings.push( ...getHeadingsFromBlocks( block.innerBlocks ) );
        }
    }
    return headings;
}

function validateHierarchy( levels ) {
    for ( let i = 1; i < levels.length; i++ ) {
        if ( levels[ i ] > levels[ i - 1 ] + 1 ) {
            return false; // Skipped a level
        }
    }
    return true;
}
```

### Filter Parameters

| Parameter | Type | Description |
|---|---|---|
| `isValid` | `boolean` | Current validation state (default: `true`) |
| `blocks` | `array` | The full array of blocks in the editor |
| `postType` | `string` | Current post type (e.g., `'post'`) |
| `checkName` | `string` | The check's `name` from PHP registration |
| `rule` | `object` | The full check configuration object |

### Return Value

Return `true` if the document passes validation, `false` if it fails.

### Working with the Blocks Array

The `blocks` parameter is the top-level array from `wp.data.select('core/block-editor').getBlocks()`. It includes `innerBlocks` recursively. Common patterns:

**Find all blocks of a type:**
```javascript
function findBlocks( blocks, blockType ) {
    const found = [];
    for ( const block of blocks ) {
        if ( block.name === blockType ) {
            found.push( block );
        }
        if ( block.innerBlocks?.length ) {
            found.push( ...findBlocks( block.innerBlocks, blockType ) );
        }
    }
    return found;
}
```

**Check for required block type:**
```javascript
addFilter(
    'validation_api_validate_editor',
    'my-plugin/requires-image',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName === 'requires_image' ) {
            return findBlocks( blocks, 'core/image' ).length > 0;
        }
        return isValid;
    }
);
```

**Count blocks:**
```javascript
addFilter(
    'validation_api_validate_editor',
    'my-plugin/min-content',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName === 'min_content' ) {
            return blocks.length >= 3;
        }
        return isValid;
    }
);
```

## When to Use Editor Checks vs. Block Checks

| Use Editor Checks | Use Block Checks |
|---|---|
| Heading hierarchy across the document | Single heading's text content |
| "Must contain at least one image" | "This image needs alt text" |
| Content length or structure rules | Individual block attribute validation |
| Cross-block relationships | Single block self-validation |

The key distinction: **block checks validate one block at a time, editor checks validate the document as a whole.**

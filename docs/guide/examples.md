# Examples

Complete integration examples and common recipes.

## Complete Plugin: Content Quality Rules

A full plugin that registers block, meta, and editor checks with both PHP and JavaScript.

### PHP Registration

```php
<?php
/**
 * Plugin Name: Content Quality Rules
 * Description: Validation checks for content quality standards.
 */

add_action( 'init', function() {
    if ( ! function_exists( 'wp_register_block_validation_check' ) ) {
        return;
    }

    // Block checks
    wp_register_block_validation_check( 'core/image', [
        'namespace'   => 'content-quality-rules',
        'name'        => 'alt_text',
        'level'       => 'error',
        'description' => 'Images must have alt text',
        'error_msg'   => 'This image is missing alt text.',
        'warning_msg' => 'Consider adding alt text to this image.',
    ] );

    wp_register_block_validation_check( 'core/button', [
        'namespace'   => 'content-quality-rules',
        'name'        => 'has_link',
        'level'       => 'error',
        'description' => 'Buttons must have a link',
        'error_msg'   => 'This button has no link.',
        'warning_msg' => 'Consider adding a link to this button.',
    ] );

    wp_register_block_validation_check( 'core/button', [
        'namespace'   => 'content-quality-rules',
        'name'        => 'has_text',
        'level'       => 'error',
        'description' => 'Buttons must have visible text',
        'error_msg'   => 'This button has no text.',
    ] );

    // Meta checks
    wp_register_meta_validation_check( 'post', [
        'namespace'   => 'content-quality-rules',
        'name'        => 'required',
        'meta_key'    => 'seo_description',
        'level'       => 'error',
        'description' => 'Posts need an SEO description',
        'error_msg'   => 'SEO description is required.',
        'warning_msg' => 'Consider adding an SEO description.',
    ] );

    // Editor checks
    wp_register_editor_validation_check( 'post', [
        'namespace'   => 'content-quality-rules',
        'name'        => 'heading_hierarchy',
        'level'       => 'warning',
        'description' => 'Headings should follow a logical hierarchy',
        'error_msg'   => 'Heading hierarchy is broken.',
        'warning_msg' => 'Headings skip levels — consider fixing the hierarchy.',
    ] );

    wp_register_editor_validation_check( 'post', [
        'namespace'   => 'content-quality-rules',
        'name'        => 'has_image',
        'level'       => 'warning',
        'description' => 'Posts should include at least one image',
        'error_msg'   => 'This post has no images.',
        'warning_msg' => 'Consider adding an image to this post.',
    ] );
} );

add_action( 'enqueue_block_editor_assets', function() {
    wp_enqueue_script(
        'content-quality-validation',
        plugins_url( 'build/validation.js', __FILE__ ),
        [ 'wp-hooks' ],
        '1.0.0',
        true
    );
} );
```

### JavaScript Validation

```javascript
import { addFilter } from '@wordpress/hooks';

// Block validation
addFilter(
    'editor.validateBlock',
    'content-quality/blocks',
    ( isValid, blockType, attributes, checkName ) => {
        if ( blockType === 'core/image' && checkName === 'alt_text' ) {
            return !! attributes.alt && attributes.alt.trim().length > 0;
        }

        if ( blockType === 'core/button' ) {
            if ( checkName === 'has_link' ) {
                return !! attributes.url && attributes.url.trim().length > 0;
            }
            if ( checkName === 'has_text' ) {
                return !! attributes.text && attributes.text.trim().length > 0;
            }
        }

        return isValid;
    }
);

// Meta validation
addFilter(
    'editor.validateMeta',
    'content-quality/meta',
    ( isValid, value, postType, metaKey, checkName ) => {
        if ( metaKey === 'seo_description' && checkName === 'required' ) {
            return !! value && value.trim().length > 0;
        }
        return isValid;
    }
);

// Editor validation
addFilter(
    'editor.validateEditor',
    'content-quality/editor',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName === 'heading_hierarchy' ) {
            return validateHeadingHierarchy( blocks );
        }

        if ( checkName === 'has_image' ) {
            return hasBlockType( blocks, 'core/image' );
        }

        return isValid;
    }
);

function hasBlockType( blocks, blockType ) {
    for ( const block of blocks ) {
        if ( block.name === blockType ) return true;
        if ( block.innerBlocks?.length && hasBlockType( block.innerBlocks, blockType ) ) {
            return true;
        }
    }
    return false;
}

function validateHeadingHierarchy( blocks ) {
    const levels = getHeadingLevels( blocks );
    for ( let i = 1; i < levels.length; i++ ) {
        if ( levels[ i ] > levels[ i - 1 ] + 1 ) {
            return false;
        }
    }
    return true;
}

function getHeadingLevels( blocks ) {
    const levels = [];
    for ( const block of blocks ) {
        if ( block.name === 'core/heading' ) {
            levels.push( block.attributes.level );
        }
        if ( block.innerBlocks?.length ) {
            levels.push( ...getHeadingLevels( block.innerBlocks ) );
        }
    }
    return levels;
}
```

## Recipe: Custom Block Validation

Validate attributes on a custom block:

```php
wp_register_block_validation_check( 'my-plugin/testimonial', [
    'namespace'   => 'my-plugin',
    'name'        => 'has_author',
    'level'       => 'error',
    'description' => 'Testimonials must have an author',
    'error_msg'   => 'This testimonial is missing an author name.',
] );
```

```javascript
addFilter(
    'editor.validateBlock',
    'my-plugin/testimonial-author',
    ( isValid, blockType, attributes, checkName ) => {
        if ( blockType === 'my-plugin/testimonial' && checkName === 'has_author' ) {
            return !! attributes.authorName && attributes.authorName.trim().length > 0;
        }
        return isValid;
    }
);
```

## Recipe: Server-Side Meta Validation

Use `Validator::required()` for simultaneous client-side and server-side enforcement:

```php
use ValidationAPI\Meta\Validator;

add_action( 'init', function() {
    if ( ! function_exists( 'wp_register_meta_validation_check' ) ) {
        return;
    }

    // Register the meta field with server-side validation
    register_post_meta( 'event', 'event_date', [
        'show_in_rest'      => true,
        'single'            => true,
        'type'              => 'string',
        'validate_callback' => Validator::required( 'event', 'event_date', [
            'error_msg'   => 'Events must have a date.',
            'warning_msg' => 'Consider setting an event date.',
            'level'       => 'error',
            'description' => 'Event date is required',
        ] ),
    ] );
} );
```

## Recipe: Conditional Severity by Post Type

Use the `wp_validation_check_level` filter to vary severity by context:

```php
// Alt text is an error on posts, a warning on pages
add_filter( 'wp_validation_check_level', function( $level, $context ) {
    if ( $context['scope'] === 'block'
        && $context['block_type'] === 'core/image'
        && $context['check_name'] === 'alt_text'
    ) {
        $post_type = get_post_type();
        if ( $post_type === 'page' ) {
            return 'warning';
        }
    }
    return $level;
}, 10, 2 );
```

## Recipe: CheckProvider with Shared Configuration

```php
use ValidationAPI\Contracts\CheckProvider;

class ImageChecks implements CheckProvider {
    private const BLOCK_TYPE = 'core/image';
    private const NAMESPACE  = 'my-validation-plugin';

    public function register(): void {
        $this->register_check( 'alt_text', 'error', [
            'description' => 'Images must have alt text',
            'error_msg'   => 'This image is missing alt text.',
            'warning_msg' => 'Consider adding alt text.',
        ] );

        $this->register_check( 'dimensions', 'warning', [
            'description' => 'Images should have explicit dimensions',
            'error_msg'   => 'This image has no dimensions set.',
            'warning_msg' => 'Consider setting explicit image dimensions.',
        ] );
    }

    private function register_check( string $name, string $level, array $args ): void {
        wp_register_block_validation_check( self::BLOCK_TYPE, array_merge(
            $args,
            [ 'namespace' => self::NAMESPACE, 'name' => $name, 'level' => $level ]
        ) );
    }
}
```

## Recipe: Preventing Check Registration

Use the `wp_validation_should_register_check` filter to conditionally prevent checks from registering:

```php
// Don't register image checks on the 'attachment' post type screen
add_filter( 'wp_validation_should_register_check', function( $should, $block_type, $check_name, $args ) {
    if ( $block_type === 'core/image' && get_post_type() === 'attachment' ) {
        return false;
    }
    return $should;
}, 10, 4 );
```

## Recipe: Inspecting Registered Checks

Use the REST API to see what's registered:

```javascript
// In the browser console
wp.apiFetch( { path: '/wp/v2/validation-checks' } ).then( console.log );
```

This returns all registered checks grouped by scope, including `_namespace` attribution. Requires `manage_options` capability.

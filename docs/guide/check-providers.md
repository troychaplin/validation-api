# CheckProvider Pattern

For plugins with more than a handful of checks, the `CheckProvider` interface lets you organize registrations across multiple classes. Each class handles one concern — image checks, heading checks, meta checks — and they're all wired together through `validation_api_register_plugin()`.

## The Interface

```php
namespace ValidationAPI\Contracts;

interface CheckProvider {
    public function register(): void;
}
```

One method. No constructor requirements. No abstract base class. Your class implements `register()` and calls the global registration functions inside it.

## Basic Usage

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

        validation_api_register_block_check( 'core/image', [
            'name'        => 'file_size',
            'level'       => 'warning',
            'description' => 'Images should be optimized',
            'error_msg'   => 'This image exceeds the recommended file size.',
            'warning_msg' => 'This image is larger than recommended.',
        ] );
    }
}
```

## Registering Providers

Pass an array of class names to `validation_api_register_plugin()`:

```php
add_action( 'init', function() {
    if ( ! function_exists( 'validation_api_register_plugin' ) ) {
        return;
    }

    validation_api_register_plugin(
        [ 'name' => 'Enterprise Content Rules' ],
        [
            ImageChecks::class,
            HeadingChecks::class,
            ButtonChecks::class,
            MetaChecks::class,
            EditorChecks::class,
        ]
    );
} );
```

The framework instantiates each class and calls `register()`. All checks are automatically attributed to "Enterprise Content Rules" in the REST API and companion settings.

## Mixing Scopes

A single provider can register checks across all three scopes:

```php
class AccessibilityChecks implements CheckProvider {
    public function register(): void {
        // Block check
        validation_api_register_block_check( 'core/image', [
            'name'      => 'alt_text',
            'level'     => 'error',
            'error_msg' => 'Images must have alt text.',
        ] );

        // Editor check
        validation_api_register_editor_check( 'post', [
            'name'      => 'heading_hierarchy',
            'level'     => 'warning',
            'error_msg' => 'Heading hierarchy is broken.',
        ] );

        // Meta check
        validation_api_register_meta_check( 'post', [
            'name'      => 'required',
            'meta_key'  => 'seo_description',
            'level'     => 'error',
            'error_msg' => 'SEO description is required.',
        ] );
    }
}
```

However, for larger plugins, separating by concern (one provider per block type or per validation domain) is more maintainable.

## Organizing a Large Plugin

A typical enterprise structure:

```
my-validation-plugin/
├── my-validation-plugin.php    ← Bootstrap: guard + register_plugin
├── src/
│   ├── Checks/
│   │   ├── ImageChecks.php     ← CheckProvider for core/image
│   │   ├── ButtonChecks.php    ← CheckProvider for core/button
│   │   ├── HeadingChecks.php   ← CheckProvider for editor-level heading rules
│   │   └── SeoMetaChecks.php   ← CheckProvider for SEO meta fields
│   └── ...
├── build/
│   └── validation.js           ← JS validation logic for all checks
└── ...
```

**Bootstrap file:**

```php
<?php
/**
 * Plugin Name: My Validation Rules
 */

add_action( 'init', function() {
    if ( ! function_exists( 'validation_api_register_plugin' ) ) {
        return;
    }

    validation_api_register_plugin(
        [ 'name' => 'My Validation Rules' ],
        [
            \MyPlugin\Checks\ImageChecks::class,
            \MyPlugin\Checks\ButtonChecks::class,
            \MyPlugin\Checks\HeadingChecks::class,
            \MyPlugin\Checks\SeoMetaChecks::class,
        ]
    );
} );

add_action( 'enqueue_block_editor_assets', function() {
    wp_enqueue_script(
        'my-validation-rules',
        plugins_url( 'build/validation.js', __FILE__ ),
        [ 'wp-hooks' ],
        '1.0.0',
        true
    );
} );
```

## CheckProvider vs. Callback

Both approaches are supported. Use whichever fits your plugin:

**Callback** — best for small integrations with a few checks:

```php
validation_api_register_plugin(
    [ 'name' => 'Simple Rules' ],
    function() {
        validation_api_register_block_check( 'core/image', [ ... ] );
        validation_api_register_block_check( 'core/button', [ ... ] );
    }
);
```

**CheckProvider** — best for larger integrations where you want separation of concerns, testability, and organized file structure:

```php
validation_api_register_plugin(
    [ 'name' => 'Enterprise Rules' ],
    [
        ImageChecks::class,
        ButtonChecks::class,
        HeadingChecks::class,
    ]
);
```

## Error Handling

The framework validates providers at registration time:

- If a class doesn't exist, `_doing_it_wrong()` is called and that provider is skipped
- If a class doesn't implement `CheckProvider`, `_doing_it_wrong()` is called and that provider is skipped
- Other providers in the array continue to register normally

This means a typo in one class name won't break your entire plugin's validation — the other providers still register.

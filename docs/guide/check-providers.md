# CheckProvider Pattern

For plugins with more than a handful of checks, the `CheckProvider` interface lets you organize registrations across multiple classes. Each class handles one concern — image checks, heading checks, meta checks — and they're all wired together through a shared `namespace`.

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
        wp_register_block_validation_check( 'core/image', [
            'namespace'   => 'enterprise-content-rules',
            'name'        => 'alt_text',
            'level'       => 'error',
            'description' => 'Images must have alt text',
            'error_msg'   => 'This image is missing alt text.',
            'warning_msg' => 'Consider adding alt text to this image.',
        ] );

        wp_register_block_validation_check( 'core/image', [
            'namespace'   => 'enterprise-content-rules',
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

Instantiate each provider and call `register()`:

```php
add_action( 'init', function() {
    if ( ! function_exists( 'wp_register_block_validation_check' ) ) {
        return;
    }

    $providers = [
        new ImageChecks(),
        new HeadingChecks(),
        new ButtonChecks(),
        new MetaChecks(),
        new EditorChecks(),
    ];

    foreach ( $providers as $provider ) {
        $provider->register();
    }
} );
```

All checks use the same `namespace` value (e.g., `'enterprise-content-rules'`) to group them together in the REST API and companion settings.

## Mixing Scopes

A single provider can register checks across all three scopes:

```php
class AccessibilityChecks implements CheckProvider {
    public function register(): void {
        // Block check
        wp_register_block_validation_check( 'core/image', [
            'namespace' => 'accessibility',
            'name'      => 'alt_text',
            'level'     => 'error',
            'error_msg' => 'Images must have alt text.',
        ] );

        // Editor check
        wp_register_editor_validation_check( 'post', [
            'namespace' => 'accessibility',
            'name'      => 'heading_hierarchy',
            'level'     => 'warning',
            'error_msg' => 'Heading hierarchy is broken.',
        ] );

        // Meta check
        wp_register_meta_validation_check( 'post', [
            'namespace' => 'accessibility',
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
├── my-validation-plugin.php    ← Bootstrap: guard + register providers
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
    if ( ! function_exists( 'wp_register_block_validation_check' ) ) {
        return;
    }

    $providers = [
        new \MyPlugin\Checks\ImageChecks(),
        new \MyPlugin\Checks\ButtonChecks(),
        new \MyPlugin\Checks\HeadingChecks(),
        new \MyPlugin\Checks\SeoMetaChecks(),
    ];

    foreach ( $providers as $provider ) {
        $provider->register();
    }
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

## CheckProvider vs. Inline Registration

Both approaches are supported. Use whichever fits your plugin:

**Inline** — best for small integrations with a few checks:

```php
wp_register_block_validation_check( 'core/image', [
    'namespace' => 'simple-rules',
    'name'      => 'alt_text',
    'error_msg' => 'Alt text required.',
] );

wp_register_block_validation_check( 'core/button', [
    'namespace' => 'simple-rules',
    'name'      => 'has_link',
    'error_msg' => 'Button needs a link.',
] );
```

**CheckProvider** — best for larger integrations where you want separation of concerns, testability, and organized file structure:

```php
$providers = [
    new ImageChecks(),
    new ButtonChecks(),
    new HeadingChecks(),
];

foreach ( $providers as $provider ) {
    $provider->register();
}
```

## Error Handling

The framework validates providers at registration time:

- If a class doesn't exist, `_doing_it_wrong()` is called and that provider is skipped
- If a class doesn't implement `CheckProvider`, `_doing_it_wrong()` is called and that provider is skipped
- Other providers in the array continue to register normally

This means a typo in one class name won't break your entire plugin's validation — the other providers still register.

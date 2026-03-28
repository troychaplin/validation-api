# Hooks Reference

Complete list of PHP actions, PHP filters, and JavaScript filters provided by the Validation API.

## PHP Actions

### validation_api_initialized

Fires after plugin initialization completes.

```php
do_action( 'validation_api_initialized', Plugin $plugin );
```

| Parameter | Type | Description |
|---|---|---|
| `$plugin` | `ValidationAPI\Core\Plugin` | The plugin instance |

### validation_api_ready

Fires after the Block Registry is ready. Use this to interact with the block registry directly (most integrations should use `validation_api_register_plugin()` instead).

```php
do_action( 'validation_api_ready', BlockChecksRegistry $registry, Plugin $plugin );
```

| Parameter | Type | Description |
|---|---|---|
| `$registry` | `ValidationAPI\Block\Registry` | The block checks registry |
| `$plugin` | `ValidationAPI\Core\Plugin` | The plugin instance |

### validation_api_editor_checks_ready

Fires after the Editor Registry is ready.

```php
do_action( 'validation_api_editor_checks_ready', EditorChecksRegistry $registry, Plugin $plugin );
```

| Parameter | Type | Description |
|---|---|---|
| `$registry` | `ValidationAPI\Editor\Registry` | The editor checks registry |
| `$plugin` | `ValidationAPI\Core\Plugin` | The plugin instance |

### validation_api_check_registered

Fires when a block check is successfully registered.

```php
do_action( 'validation_api_check_registered', string $block_type, string $check_name, array $check_args );
```

| Parameter | Type | Description |
|---|---|---|
| `$block_type` | `string` | Block type name (e.g., `'core/image'`) |
| `$check_name` | `string` | Check identifier |
| `$check_args` | `array` | The final check configuration |

### validation_api_check_unregistered

Fires when a block check is unregistered.

```php
do_action( 'validation_api_check_unregistered', string $block_type, string $check_name );
```

| Parameter | Type | Description |
|---|---|---|
| `$block_type` | `string` | Block type name |
| `$check_name` | `string` | Check identifier |

### validation_api_check_toggled

Fires when a block check is enabled or disabled.

```php
do_action( 'validation_api_check_toggled', string $block_type, string $check_name, bool $enabled );
```

| Parameter | Type | Description |
|---|---|---|
| `$block_type` | `string` | Block type name |
| `$check_name` | `string` | Check identifier |
| `$enabled` | `bool` | Whether the check is now enabled |

### validation_api_editor_check_registered

Fires when an editor check is successfully registered.

```php
do_action( 'validation_api_editor_check_registered', string $post_type, string $check_name, array $check_args );
```

| Parameter | Type | Description |
|---|---|---|
| `$post_type` | `string` | Post type (e.g., `'post'`) |
| `$check_name` | `string` | Check identifier |
| `$check_args` | `array` | The final check configuration |

### validation_api_meta_check_registered

Fires when a meta check is successfully registered.

```php
do_action( 'validation_api_meta_check_registered', string $post_type, string $meta_key, string $check_name, array $check_args );
```

| Parameter | Type | Description |
|---|---|---|
| `$post_type` | `string` | Post type |
| `$meta_key` | `string` | The meta key |
| `$check_name` | `string` | Check identifier |
| `$check_args` | `array` | The final check configuration |

## PHP Filters

### validation_api_check_args

Modify block check arguments before registration.

```php
$check_args = apply_filters( 'validation_api_check_args', array $check_args, string $block_type, string $check_name );
```

| Parameter | Type | Description |
|---|---|---|
| `$check_args` | `array` | The check configuration |
| `$block_type` | `string` | Block type name |
| `$check_name` | `string` | Check identifier |

**Return:** `array` — Modified check arguments.

### validation_api_editor_check_args

Modify editor check arguments before registration.

```php
$check_args = apply_filters( 'validation_api_editor_check_args', array $check_args, string $post_type, string $check_name );
```

| Parameter | Type | Description |
|---|---|---|
| `$check_args` | `array` | The check configuration |
| `$post_type` | `string` | Post type |
| `$check_name` | `string` | Check identifier |

**Return:** `array` — Modified check arguments.

### validation_api_meta_check_args

Modify meta check arguments before registration.

```php
$check_args = apply_filters( 'validation_api_meta_check_args', array $check_args, string $post_type, string $meta_key, string $check_name );
```

| Parameter | Type | Description |
|---|---|---|
| `$check_args` | `array` | The check configuration |
| `$post_type` | `string` | Post type |
| `$meta_key` | `string` | The meta key |
| `$check_name` | `string` | Check identifier |

**Return:** `array` — Modified check arguments.

### validation_api_should_register_check

Prevent a block check from being registered.

```php
$should = apply_filters( 'validation_api_should_register_check', bool $should, string $block_type, string $check_name, array $check_args );
```

| Parameter | Type | Description |
|---|---|---|
| `$should` | `bool` | Whether to register (default: `true`) |
| `$block_type` | `string` | Block type name |
| `$check_name` | `string` | Check identifier |
| `$check_args` | `array` | The check configuration |

**Return:** `bool` — `false` to prevent registration.

### validation_api_should_register_editor_check

Prevent an editor check from being registered.

```php
$should = apply_filters( 'validation_api_should_register_editor_check', bool $should, string $post_type, string $check_name, array $check_args );
```

| Parameter | Type | Description |
|---|---|---|
| `$should` | `bool` | Whether to register (default: `true`) |
| `$post_type` | `string` | Post type |
| `$check_name` | `string` | Check identifier |
| `$check_args` | `array` | The check configuration |

**Return:** `bool` — `false` to prevent registration.

### validation_api_should_register_meta_check

Prevent a meta check from being registered.

```php
$should = apply_filters( 'validation_api_should_register_meta_check', bool $should, string $post_type, string $meta_key, string $check_name, array $check_args );
```

| Parameter | Type | Description |
|---|---|---|
| `$should` | `bool` | Whether to register (default: `true`) |
| `$post_type` | `string` | Post type |
| `$meta_key` | `string` | The meta key |
| `$check_name` | `string` | Check identifier |
| `$check_args` | `array` | The check configuration |

**Return:** `bool` — `false` to prevent registration.

### validation_api_check_level

Override the effective severity level of any check at runtime. This is the central configuration mechanism.

```php
$level = apply_filters( 'validation_api_check_level', string $level, array $context );
```

| Parameter | Type | Description |
|---|---|---|
| `$level` | `string` | The registered level (`'error'`, `'warning'`) |
| `$context` | `array` | Context about the check (varies by scope, see below) |

**Return:** `string` — `'error'`, `'warning'`, or `'none'`.

**Context for block checks:**
```php
[ 'scope' => 'block', 'block_type' => 'core/image', 'check_name' => 'alt_text' ]
```

**Context for meta checks:**
```php
[ 'scope' => 'meta', 'post_type' => 'post', 'meta_key' => 'seo_description', 'check_name' => 'required' ]
```

**Context for editor checks:**
```php
[ 'scope' => 'editor', 'post_type' => 'post', 'check_name' => 'heading_hierarchy' ]
```

### validation_api_validate_meta

Server-side meta validation filter. Fires during `register_post_meta()` validate_callback when using `Validator::required()`.

```php
$is_valid = apply_filters( 'validation_api_validate_meta', bool $is_valid, mixed $value, string $post_type, string $meta_key, string $check_name, array $config );
```

| Parameter | Type | Description |
|---|---|---|
| `$is_valid` | `bool` | Current validation state (default: `true`) |
| `$value` | `mixed` | The meta value being validated |
| `$post_type` | `string` | Post type |
| `$meta_key` | `string` | The meta key |
| `$check_name` | `string` | Check identifier |
| `$config` | `array` | The check configuration |

**Return:** `bool` — `true` if valid, `false` if invalid.

## JavaScript Filters

All JS filters use `@wordpress/hooks` (`wp.hooks`). Register with `addFilter()`, imported from `@wordpress/hooks`.

### validation_api_validate_block

Validate a block's attributes against a registered check.

```javascript
const isValid = applyFilters(
    'validation_api_validate_block',
    true,
    blockType,
    attributes,
    checkName,
    block
);
```

| Parameter | Type | Description |
|---|---|---|
| `isValid` | `boolean` | Current state (default: `true`) |
| `blockType` | `string` | Block type (e.g., `'core/image'`) |
| `attributes` | `object` | Block's current attributes |
| `checkName` | `string` | Check identifier |
| `block` | `object` | Full block object (`clientId`, `innerBlocks`, etc.) |

**Return:** `boolean` — `true` if valid, `false` if invalid.

### validation_api_validate_meta

Validate a post meta value against a registered check.

```javascript
const isValid = applyFilters(
    'validation_api_validate_meta',
    true,
    value,
    postType,
    metaKey,
    checkName
);
```

| Parameter | Type | Description |
|---|---|---|
| `isValid` | `boolean` | Current state (default: `true`) |
| `value` | `any` | Current meta value |
| `postType` | `string` | Post type |
| `metaKey` | `string` | Meta key |
| `checkName` | `string` | Check identifier |

**Return:** `boolean` — `true` if valid, `false` if invalid.

### validation_api_validate_editor

Validate the editor's block content against a registered check.

```javascript
const isValid = applyFilters(
    'validation_api_validate_editor',
    true,
    blocks,
    postType,
    checkName,
    rule
);
```

| Parameter | Type | Description |
|---|---|---|
| `isValid` | `boolean` | Current state (default: `true`) |
| `blocks` | `array` | Full array of blocks from the editor |
| `postType` | `string` | Post type |
| `checkName` | `string` | Check identifier |
| `rule` | `object` | The full check configuration |

**Return:** `boolean` — `true` if valid, `false` if invalid.

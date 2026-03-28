# Core Plugin Prerequisites

These changes must be made to the `validation-api` plugin before building the companion package.

## Registration API

- [ ] Create `includes/Contracts/CheckProvider.php` interface with `register(): void` method
- [ ] Create `includes/Core/PluginContext.php` static class to manage current plugin context (set/get/clear)
- [ ] Create `validation_api_register_plugin()` global function in main plugin file
  - [ ] Accept `$plugin_info` array (with `name` key) and `$checks` callable or array
  - [ ] Set plugin context before invoking checks
  - [ ] Support callable (closure) pattern
  - [ ] Support array of `CheckProvider` class names
  - [ ] Clear plugin context after invocation
- [ ] Update `Block\Registry::register_check()` to read and store `_plugin` from active context
- [ ] Update `Meta\Registry::register_meta_check()` to read and store `_plugin` from active context
- [ ] Update `Editor\Registry::register_editor_check()` to read and store `_plugin` from active context

## REST API

- [ ] Create `includes/Rest/ChecksController.php` extending `WP_REST_Controller`
  - [ ] Register route `GET /validation-api/v1/checks`
  - [ ] Permission callback: `manage_options`
  - [ ] Collect checks from all three registries
  - [ ] Include `_plugin` attribution in response
  - [ ] Define response schema
- [ ] Register REST routes in `Core\Plugin::init()` via `rest_api_init` hook

## Tests

- [ ] Test `validation_api_register_plugin()` with callable pattern
- [ ] Test `validation_api_register_plugin()` with CheckProvider array pattern
- [ ] Test plugin context is set on checks registered within scope
- [ ] Test plugin context is cleared after scope completes
- [ ] Test checks registered outside scope have no `_plugin` key
- [ ] Test `GET /validation-api/v1/checks` returns all registries
- [ ] Test REST endpoint requires `manage_options` capability

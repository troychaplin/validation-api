<?php
/**
 * Plugin Name:       Validation API
 * Description:       A framework for registering block, meta, and editor validation checks in the WordPress block editor.
 * Requires at least: 6.7
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Author:            Troy Chaplin
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       validation-api
 * Domain Path:       /languages
 *
 * @package           validation-api
 */

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Defines the version of the Validation API plugin.
define( 'VALIDATION_API_VERSION', '1.0.0' );

// This file is responsible for including the necessary autoload file.
require_once __DIR__ . '/vendor/autoload.php';

// Imports the necessary classes for the plugin.
use ValidationAPI\Core\Plugin;
use ValidationAPI\Block\Registry as BlockRegistry;
use ValidationAPI\Editor\Registry as EditorRegistry;
use ValidationAPI\Meta\Registry as MetaRegistry;

// Global variables for the plugin.
$validation_api_plugin_file = __FILE__;
$validation_api_text_domain = 'validation-api';

// Initialize the Plugin.
$validation_api_plugin_initializer = new Plugin( $validation_api_plugin_file, $validation_api_text_domain );

/**
 * Initializes the Validation API plugin services.
 *
 * @return void
 */
function validation_api_init_plugin() {
	global $validation_api_plugin_initializer;
	$validation_api_plugin_initializer->init();
}
add_action( 'init', 'validation_api_init_plugin' );

/**
 * Register a validation check for a block type.
 *
 * Extracts 'name' from $args and delegates to the Block Registry singleton.
 * A 'namespace' field is required for plugin attribution.
 *
 * @param string $block_type Block type name (e.g., 'core/image').
 * @param array  $args       Check configuration. Required keys: 'namespace' (string), 'name' (string), 'error_msg' (string).
 * @return bool True on success, false on failure.
 */
function validation_api_register_block_check( string $block_type, array $args ): bool {
	if ( empty( $args['namespace'] ) ) {
		_doing_it_wrong(
			__FUNCTION__,
			esc_html__( 'The $args array must include a "namespace" key for plugin attribution.', 'validation-api' ),
			'1.0.0'
		);
		return false;
	}

	if ( empty( $args['name'] ) ) {
		_doing_it_wrong(
			__FUNCTION__,
			esc_html__( 'The $args array must include a "name" key.', 'validation-api' ),
			'1.0.0'
		);
		return false;
	}

	$check_name = $args['name'];
	unset( $args['name'] );

	return BlockRegistry::get_instance()->register_check( $block_type, $check_name, $args );
}

/**
 * Register a validation check for a post meta field.
 *
 * Extracts 'name' and 'meta_key' from $args and delegates to the Meta Registry singleton.
 * A 'namespace' field is required for plugin attribution.
 *
 * @param string $post_type Post type (e.g., 'post', 'page').
 * @param array  $args      Check configuration. Required keys: 'namespace' (string), 'name' (string), 'meta_key' (string), 'error_msg' (string).
 * @return bool True on success, false on failure.
 */
function validation_api_register_meta_check( string $post_type, array $args ): bool {
	if ( empty( $args['namespace'] ) ) {
		_doing_it_wrong(
			__FUNCTION__,
			esc_html__( 'The $args array must include a "namespace" key for plugin attribution.', 'validation-api' ),
			'1.0.0'
		);
		return false;
	}

	if ( empty( $args['name'] ) ) {
		_doing_it_wrong(
			__FUNCTION__,
			esc_html__( 'The $args array must include a "name" key.', 'validation-api' ),
			'1.0.0'
		);
		return false;
	}

	if ( empty( $args['meta_key'] ) ) {
		_doing_it_wrong(
			__FUNCTION__,
			esc_html__( 'The $args array must include a "meta_key" key.', 'validation-api' ),
			'1.0.0'
		);
		return false;
	}

	$check_name = $args['name'];
	$meta_key   = $args['meta_key'];
	unset( $args['name'], $args['meta_key'] );

	return MetaRegistry::get_instance()->register_meta_check( $post_type, $meta_key, $check_name, $args );
}

/**
 * Register a validation check for the editor (document-level).
 *
 * Extracts 'name' from $args and delegates to the Editor Registry singleton.
 * A 'namespace' field is required for plugin attribution.
 *
 * @param string $post_type Post type (e.g., 'post', 'page').
 * @param array  $args      Check configuration. Required keys: 'namespace' (string), 'name' (string), 'error_msg' (string).
 * @return bool True on success, false on failure.
 */
function validation_api_register_editor_check( string $post_type, array $args ): bool {
	if ( empty( $args['namespace'] ) ) {
		_doing_it_wrong(
			__FUNCTION__,
			esc_html__( 'The $args array must include a "namespace" key for plugin attribution.', 'validation-api' ),
			'1.0.0'
		);
		return false;
	}

	if ( empty( $args['name'] ) ) {
		_doing_it_wrong(
			__FUNCTION__,
			esc_html__( 'The $args array must include a "name" key.', 'validation-api' ),
			'1.0.0'
		);
		return false;
	}

	$check_name = $args['name'];
	unset( $args['name'] );

	return EditorRegistry::get_instance()->register_editor_check( $post_type, $check_name, $args );
}

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
use ValidationAPI\Core\PluginContext;
use ValidationAPI\Contracts\CheckProvider;

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
 * Register a plugin and its validation checks with the Validation API.
 *
 * Declares plugin identity once so all checks registered within the scope
 * are automatically attributed to this plugin. Accepts either a callable
 * or an array of CheckProvider class names.
 *
 * Safe integration pattern — wrap calls with a function_exists check:
 *
 *     add_action( 'init', function() {
 *         if ( ! function_exists( 'validation_api_register_plugin' ) ) {
 *             return;
 *         }
 *
 *         validation_api_register_plugin(
 *             [ 'name' => 'My Plugin' ],
 *             function() {
 *                 validation_api_register_block_check( 'core/image', [
 *                     'name'      => 'alt_text',
 *                     'error_msg' => 'Alt text is required.',
 *                 ] );
 *             }
 *         );
 *     } );
 *
 * @param array          $plugin_info Plugin metadata. Required key: 'name' (string).
 * @param callable|array $checks      A callable that registers checks, or an array
 *                                     of fully qualified CheckProvider class names.
 * @return void
 */
function validation_api_register_plugin( array $plugin_info, $checks ): void {
	if ( empty( $plugin_info['name'] ) ) {
		_doing_it_wrong(
			__FUNCTION__,
			esc_html__( 'The $plugin_info array must include a "name" key.', 'validation-api' ),
			'1.0.0'
		);
		return;
	}

	PluginContext::set( $plugin_info );

	try {
		if ( is_callable( $checks ) ) {
			call_user_func( $checks );
		} elseif ( is_array( $checks ) ) {
			foreach ( $checks as $provider_class ) {
				if ( ! class_exists( $provider_class ) ) {
					_doing_it_wrong(
						__FUNCTION__,
						sprintf(
							/* translators: %s: class name */
							esc_html__( 'CheckProvider class "%s" does not exist.', 'validation-api' ),
							esc_html( $provider_class )
						),
						'1.0.0'
					);
					continue;
				}

				$provider = new $provider_class();

				if ( ! $provider instanceof CheckProvider ) {
					_doing_it_wrong(
						__FUNCTION__,
						sprintf(
							/* translators: %s: class name */
							esc_html__( 'Class "%s" must implement ValidationAPI\\Contracts\\CheckProvider.', 'validation-api' ),
							esc_html( $provider_class )
						),
						'1.0.0'
					);
					continue;
				}

				$provider->register();
			}
		} else {
			_doing_it_wrong(
				__FUNCTION__,
				esc_html__( 'The $checks parameter must be a callable or an array of CheckProvider class names.', 'validation-api' ),
				'1.0.0'
			);
		}
	} finally {
		PluginContext::clear();
	}
}

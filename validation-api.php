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

<?php
/**
 * Plugin Initializer
 *
 * Simple class to organize plugin startup logic and provide basic service location.
 *
 * @package ValidationAPI
 * @since 1.0.0
 */

namespace ValidationAPI\Core;

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use ValidationAPI\Core\Traits\Logger;
use ValidationAPI\Block\Registry as BlockRegistry;
use ValidationAPI\Editor\Registry as EditorRegistry;
use ValidationAPI\Rest\ChecksController;

/**
 * Plugin Initializer Class
 *
 * Handles plugin initialization in an organized way.
 */
class Plugin {

	use Logger;

	/**
	 * Plugin file path
	 *
	 * @var string
	 */
	private $plugin_file;

	/**
	 * Text domain
	 *
	 * @var string
	 */
	private $text_domain;

	/**
	 * Service instances
	 *
	 * @var array
	 */
	private $services = array();

	/**
	 * Constructor
	 *
	 * @param string $plugin_file Plugin file path.
	 * @param string $text_domain Text domain.
	 */
	public function __construct( string $plugin_file, string $text_domain ) {
		$this->plugin_file = $plugin_file;
		$this->text_domain = $text_domain;
	}

	/**
	 * Initialize the plugin
	 *
	 * Initializes all plugin services in the correct order and sets up WordPress hooks.
	 * If any initialization step fails, an error is logged and an admin notice is displayed.
	 *
	 * @return void
	 * @throws \Exception If any service initialization fails.
	 */
	public function init(): void {
		try {
			// Initialize services in the correct order.
			$this->init_scripts_styles();
			$this->init_block_checks_registry();
			$this->init_editor_checks_registry();

			// Setup hooks.
			$this->setup_hooks();
			$this->init_rest_api();

			// Allow other plugins to hook into our initialization.
			\do_action( 'wp_validation_initialized', $this );

			// Allow developers to access the registry and add custom checks.
			\do_action( 'wp_validation_ready', $this->get_service( 'block_checks_registry' ), $this );

			// Allow developers to register editor checks.
			\do_action( 'wp_validation_editor_checks_ready', $this->get_service( 'editor_checks_registry' ), $this );

		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to initialize plugin: ' . $e->getMessage() );

			// Add admin notice for initialization failure.
			\add_action( 'admin_notices', array( $this, 'display_initialization_error' ) );
		}
	}

	/**
	 * Initialize scripts and styles
	 *
	 * @return void
	 * @throws \Exception If scripts and styles service initialization fails.
	 */
	private function init_scripts_styles(): void {
		try {
			$scripts_styles                   = new Assets( $this->plugin_file, $this->text_domain );
			$this->services['scripts_styles'] = $scripts_styles;
		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to initialize scripts and styles: ' . $e->getMessage() );
			throw $e;
		}
	}

	/**
	 * Initialize block checks registry
	 *
	 * @return void
	 * @throws \Exception If block checks registry service initialization fails.
	 */
	private function init_block_checks_registry(): void {
		try {
			$block_checks_registry                   = BlockRegistry::get_instance();
			$this->services['block_checks_registry'] = $block_checks_registry;
		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to initialize block checks registry: ' . $e->getMessage() );
			throw $e;
		}
	}

	/**
	 * Initialize editor checks registry
	 *
	 * @return void
	 * @throws \Exception If editor checks registry service initialization fails.
	 */
	private function init_editor_checks_registry(): void {
		try {
			$editor_checks_registry                   = EditorRegistry::get_instance();
			$this->services['editor_checks_registry'] = $editor_checks_registry;
		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to initialize editor checks registry: ' . $e->getMessage() );
			throw $e;
		}
	}

	/**
	 * Setup WordPress hooks
	 *
	 * Registers WordPress action hooks for the scripts and styles service.
	 *
	 * @return void
	 */
	private function setup_hooks(): void {
		try {
			$scripts_styles = $this->get_service( 'scripts_styles' );

			if ( $scripts_styles ) {
				// enqueue_block_editor_assets: Loads in the main editor window (post editor).
				\add_action( 'enqueue_block_editor_assets', array( $scripts_styles, 'enqueue_block_assets' ) );

				// enqueue_block_assets: Loads in the editor iframe and frontend.
				// The should_load_validation() check inside the method limits this to the post editor only.
				\add_action( 'enqueue_block_assets', array( $scripts_styles, 'enqueue_block_assets' ) );

			} else {
				$this->log_error( 'Scripts styles service not available for hook setup.' );
			}
		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to setup WordPress hooks: ' . $e->getMessage() );
		}
	}

	/**
	 * Initialize the REST API
	 *
	 * Registers REST API routes on the rest_api_init hook.
	 *
	 * @return void
	 */
	private function init_rest_api(): void {
		\add_action(
			'rest_api_init',
			function () {
				$controller = new ChecksController();
				$controller->register_routes();
			}
		);
	}

	/**
	 * Get a service instance with error handling
	 *
	 * @param string $service_name Service name.
	 * @return object|null Service instance or null if not found.
	 */
	public function get_service( string $service_name ): ?object {
		if ( ! isset( $this->services[ $service_name ] ) ) {
			$this->log_error( "Requested service '{$service_name}' not found." );
			return null;
		}

		return $this->services[ $service_name ];
	}

	/**
	 * Get plugin file path
	 *
	 * @return string Plugin file path.
	 */
	public function get_plugin_file(): string {
		return $this->plugin_file;
	}

	/**
	 * Get text domain
	 *
	 * @return string Text domain.
	 */
	public function get_text_domain(): string {
		return $this->text_domain;
	}

	/**
	 * Get the block checks registry
	 *
	 * @return BlockRegistry|null The registry instance or null if not initialized.
	 */
	public function get_block_checks_registry(): ?BlockRegistry {
		return $this->get_service( 'block_checks_registry' );
	}

	/**
	 * Get the editor checks registry
	 *
	 * @return EditorRegistry|null The registry instance or null if not initialized.
	 */
	public function get_editor_checks_registry(): ?EditorRegistry {
		return $this->get_service( 'editor_checks_registry' );
	}

	/**
	 * Display admin notice for initialization errors
	 *
	 * @return void
	 */
	public function display_initialization_error(): void {
		printf(
			'<div class="notice notice-error"><p><strong>%s:</strong> %s</p></div>',
			esc_html__( 'Validation API Error', 'validation-api' ),
			esc_html__( 'Validation API plugin failed to initialize properly. Please check your error logs for more details.', 'validation-api' )
		);
	}
}

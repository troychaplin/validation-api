<?php
/**
 * Editor Checks Registry
 *
 * Central registry for managing general editor validation checks.
 *
 * @package ValidationAPI
 * @since 1.0.0
 */

namespace ValidationAPI\Editor;

use ValidationAPI\Core\Traits\Logger;

/**
 * Editor Checks Registry Class
 *
 * Manages registration and execution of validation checks for the general editor state.
 */
class Registry {

	use Logger;

	/**
	 * Registered editor checks
	 *
	 * @var array
	 */
	private $editor_checks = array();

	/**
	 * Registry instance
	 *
	 * @var Registry|null
	 */
	private static $instance = null;

	/**
	 * Get registry instance
	 *
	 * @return Registry The registry singleton instance.
	 */
	public static function get_instance(): Registry {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct() {
		// Private constructor for singleton pattern.
	}

	/**
	 * Sort checks by priority
	 *
	 * @param array $a First check.
	 * @param array $b Second check.
	 * @return int Comparison result.
	 */
	private function sort_checks_by_priority( $a, $b ) {
		return $a['priority'] - $b['priority'];
	}

	/**
	 * Register an editor check
	 *
	 * @param string $post_type  Post type (e.g., 'post', 'page').
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration.
	 * @return bool True on success, false on failure.
	 */
	public function register_editor_check( string $post_type, string $check_name, array $check_args ): bool {
		try {
			// Validate input parameters.
			if ( empty( $post_type ) ) {
				$this->log_error( "Invalid post type provided: {$post_type}" );
				return false;
			}

			if ( empty( $check_name ) ) {
				$this->log_error( "Invalid check name provided: {$check_name}" );
				return false;
			}

			$defaults = array(
				'error_msg'    => '',
				'warning_msg'  => '',
				'level'        => 'error',
				'priority'     => 10,
				'enabled'      => true,
				'description'  => '',
				'configurable' => true,
			);

			$check_args = \wp_parse_args( $check_args, $defaults );

			// Validate required parameters.
			if ( empty( $check_args['error_msg'] ) ) {
				$this->log_error( "error_msg is required for {$post_type}/{$check_name}" );
				return false;
			}

			// Fallback for warning_msg to error_msg.
			if ( empty( $check_args['warning_msg'] ) ) {
				$check_args['warning_msg'] = $check_args['error_msg'];
			}

			// Validate level parameter.
			$valid_levels = array( 'error', 'warning', 'none' );
			if ( ! in_array( $check_args['level'], $valid_levels, true ) ) {
				$this->log_error( "Invalid level '{$check_args['level']}' for {$post_type}/{$check_name}. Using 'error'." );
				$check_args['level'] = 'error';
			}

			// Allow developers to filter check arguments before registration.
			$check_args = \apply_filters( 'wp_validation_editor_check_args', $check_args, $post_type, $check_name );

			// Allow developers to prevent specific checks from being registered.
			if ( ! \apply_filters( 'wp_validation_should_register_editor_check', true, $post_type, $check_name, $check_args ) ) {
				$this->log_debug( "Editor check registration prevented by filter: {$post_type}/{$check_name}" );
				return false;
			}

			// Initialize post type array if needed.
			if ( ! isset( $this->editor_checks[ $post_type ] ) ) {
				$this->editor_checks[ $post_type ] = array();
			}

			// Stamp namespace attribution from registration args.
			if ( ! empty( $check_args['namespace'] ) ) {
				$check_args['_namespace'] = $check_args['namespace'];
				unset( $check_args['namespace'] );
			}

			// Store the check.
			$this->editor_checks[ $post_type ][ $check_name ] = $check_args;

			// Sort checks by priority.
			\uasort( $this->editor_checks[ $post_type ], array( $this, 'sort_checks_by_priority' ) );

			// Action hook for developers to know when a check is registered.
			\do_action( 'wp_validation_editor_check_registered', $post_type, $check_name, $check_args );

			return true;

		} catch ( \Exception $e ) {
			$this->log_error( "Error registering editor check {$post_type}/{$check_name}: " . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Get editor checks for a specific post type
	 *
	 * @param string $post_type Post type.
	 * @return array Array of editor checks for the post type.
	 */
	public function get_editor_checks( string $post_type ): array {
		return isset( $this->editor_checks[ $post_type ] ) ? $this->editor_checks[ $post_type ] : array();
	}

	/**
	 * Get all registered editor checks
	 *
	 * @return array All registered editor checks.
	 */
	public function get_all_editor_checks(): array {
		return $this->editor_checks;
	}

	/**
	 * Get configuration for a specific editor check
	 *
	 * @param string $post_type  Post type.
	 * @param string $check_name Check name.
	 * @return array|null Check configuration or null if not found.
	 */
	public function get_editor_check_config( string $post_type, string $check_name ): ?array {
		if ( ! isset( $this->editor_checks[ $post_type ][ $check_name ] ) ) {
			return null;
		}

		return $this->editor_checks[ $post_type ][ $check_name ];
	}

	/**
	 * Get the effective check level for a specific editor check
	 *
	 * Passes the registered level through the wp_validation_check_level filter,
	 * allowing external plugins (e.g. a settings companion) to override the level
	 * at runtime. Checks set to 'none' are skipped without firing the filter.
	 *
	 * @param string $post_type  The post type.
	 * @param string $check_name The check name.
	 * @return string The effective check level ('error', 'warning', 'none').
	 */
	public function get_effective_editor_check_level( string $post_type, string $check_name ): string {
		$editor_checks = $this->get_editor_checks( $post_type );

		if ( ! isset( $editor_checks[ $check_name ] ) ) {
			return 'none';
		}

		$check_type = $editor_checks[ $check_name ]['level'] ?? 'error';

		// 'none' short-circuits — filter does not fire.
		if ( 'none' === $check_type ) {
			return 'none';
		}

		return \apply_filters(
			'wp_validation_check_level',
			$check_type,
			array(
				'scope'      => 'editor',
				'post_type'  => $post_type,
				'check_name' => $check_name,
			)
		);
	}
}

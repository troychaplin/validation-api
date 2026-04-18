<?php
/**
 * Validation Checks Registry
 *
 * Central registry for managing validation checks.
 *
 * @package ValidationAPI
 * @since 1.0.0
 */

namespace ValidationAPI\Block;

use ValidationAPI\Core\Traits\Logger;

/**
 * Validation Checks Registry Class
 *
 * Manages registration and retrieval of validation checks for block types.
 */
class Registry {

	use Logger;

	/**
	 * Registered checks
	 *
	 * @var array
	 */
	private $checks = array();

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
	private function __construct() {}

	/**
	 * Register a new validation check
	 *
	 * @param string $block_type Block type (e.g., 'core/image').
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration.
	 * @return bool True on success, false on failure.
	 */
	public function register_check( string $block_type, string $check_name, array $check_args ): bool {
		try {
			// Validate input parameters.
			if ( empty( $block_type ) ) {
				$this->log_error( "Invalid block type provided: {$block_type}" );
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
				$this->log_error( "error_msg is required for {$block_type}/{$check_name}" );
				return false;
			}

			// Fallback for warning_msg to error_msg.
			if ( empty( $check_args['warning_msg'] ) ) {
				$check_args['warning_msg'] = $check_args['error_msg'];
			}

			// Validate level parameter (optional, defaults to 'error').
			$valid_levels = array( 'error', 'warning', 'none' );
			if ( ! in_array( $check_args['level'], $valid_levels, true ) ) {
				$this->log_error( "Invalid level '{$check_args['level']}' for {$block_type}/{$check_name}. Using 'error'." );
				$check_args['level'] = 'error';
			}

			// Validate priority parameter.
			if ( ! is_numeric( $check_args['priority'] ) ) {
				$this->log_error( "Invalid priority '{$check_args['priority']}' for {$block_type}/{$check_name}. Using 10." );
				$check_args['priority'] = 10;
			}

			// Allow developers to filter check arguments before registration.
			$check_args = \apply_filters( 'wp_validation_check_args', $check_args, $block_type, $check_name );

			// Allow developers to prevent specific checks from being registered.
			if ( ! \apply_filters( 'wp_validation_should_register_check', true, $block_type, $check_name, $check_args ) ) {
				$this->log_debug( "Check registration prevented by filter: {$block_type}/{$check_name}" );
				return false;
			}

			// Check if check already exists.
			if ( isset( $this->checks[ $block_type ][ $check_name ] ) ) {
				$this->log_debug( "Overriding existing check: {$block_type}/{$check_name}" );
			}

			// Initialize block type array if needed.
			if ( ! isset( $this->checks[ $block_type ] ) ) {
				$this->checks[ $block_type ] = array();
			}

			// Stamp namespace attribution from registration args.
			if ( ! empty( $check_args['namespace'] ) ) {
				$check_args['_namespace'] = $check_args['namespace'];
				unset( $check_args['namespace'] );
			}

			// Store the check.
			$this->checks[ $block_type ][ $check_name ] = $check_args;

			// Sort checks by priority.
			\uasort( $this->checks[ $block_type ], array( $this, 'sort_checks_by_priority' ) );

			// Action hook for developers to know when a validation check is registered.
			\do_action( 'wp_validation_check_registered', $block_type, $check_name, $check_args );

			return true;

		} catch ( \Exception $e ) {
			$this->log_error( "Error registering check {$block_type}/{$check_name}: " . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Get checks for a specific block type
	 *
	 * @param string $block_type Block type.
	 * @return array Array of checks for the block type.
	 */
	public function get_checks( string $block_type ): array {
		return isset( $this->checks[ $block_type ] ) ? $this->checks[ $block_type ] : array();
	}

	/**
	 * Get all registered checks
	 *
	 * @return array All registered checks.
	 */
	public function get_all_checks(): array {
		return $this->checks;
	}

	/**
	 * Check if a specific check is registered
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @return bool True if registered, false otherwise.
	 */
	public function is_check_registered( string $block_type, string $check_name ): bool {
		return isset( $this->checks[ $block_type ][ $check_name ] );
	}

	/**
	 * Get configuration for a specific check
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @return array|null Check configuration or null if not found.
	 */
	public function get_check_config( string $block_type, string $check_name ): ?array {
		if ( ! isset( $this->checks[ $block_type ][ $check_name ] ) ) {
			return null;
		}

		return $this->checks[ $block_type ][ $check_name ];
	}

	/**
	 * Get all registered block types
	 *
	 * @return array Array of block types that have checks registered.
	 */
	public function get_registered_block_types(): array {
		return \array_keys( $this->checks );
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
	 * Get the effective check level for a specific check
	 *
	 * Passes the registered level through the wp_validation_check_level filter,
	 * allowing external plugins (e.g. a settings companion) to override the level
	 * at runtime. Checks set to 'none' are skipped without firing the filter.
	 *
	 * @param string $block_type The block type.
	 * @param string $check_name The check name.
	 * @return string The effective check level ('error', 'warning', 'none').
	 */
	public function get_effective_check_level( string $block_type, string $check_name ): string {
		$checks = $this->get_checks( $block_type );

		if ( ! isset( $checks[ $check_name ] ) ) {
			return 'none';
		}

		$check_type = $checks[ $check_name ]['level'] ?? 'error';

		// 'none' short-circuits — filter does not fire.
		if ( 'none' === $check_type ) {
			return 'none';
		}

		return \apply_filters(
			'wp_validation_check_level',
			$check_type,
			array(
				'scope'      => 'block',
				'block_type' => $block_type,
				'check_name' => $check_name,
			)
		);
	}
}

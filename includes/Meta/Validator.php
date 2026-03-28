<?php
/**
 * Meta Validation Helper
 *
 * Provides static helper methods for creating post meta validation callbacks
 * that integrate with register_post_meta().
 *
 * @package ValidationAPI
 * @since 1.0.0
 */

namespace ValidationAPI\Meta;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Meta Validator Class
 *
 * Static methods for creating and managing post meta validation.
 */
class Validator {

	/**
	 * Create a required field validator for post meta.
	 *
	 * Registers the check with the Meta Registry and returns a validate_callback
	 * for use with register_post_meta().
	 *
	 * Usage:
	 * use ValidationAPI\Meta\Validator;
	 *
	 * register_post_meta( 'band', 'band_origin', [
	 *     'validate_callback' => Validator::required( 'band', 'band_origin', [
	 *         'error_msg' => 'Field is required',
	 *         'level'     => 'error',
	 *     ] ),
	 * ] );
	 *
	 * @param string $post_type Post type (e.g., 'band', 'post').
	 * @param string $meta_key  Meta key being validated.
	 * @param array  $args      Configuration arguments.
	 * @return callable The validation callback.
	 */
	public static function required( string $post_type, string $meta_key, array $args = array() ): callable {
		$defaults = array(
			'error_msg'   => 'This field is required.',
			'warning_msg' => 'This field is recommended.',
			'level'       => 'error',
			'check_name'  => 'required',
			'description' => '',
		);

		$config = \wp_parse_args( $args, $defaults );

		// Register the check immediately so client-side validation is aware on initial load.
		$registry = Registry::get_instance();
		$registry->register_meta_check(
			$post_type,
			$meta_key,
			$config['check_name'],
			$config
		);

		// Return the validation callback.
		return function ( $value ) use ( $post_type, $meta_key, $config ) {
			$registry = Registry::get_instance();
			$level    = $registry->get_effective_meta_check_level(
				$post_type,
				$meta_key,
				$config['check_name']
			);

			// Check disabled — allow save.
			if ( 'none' === $level ) {
				return true;
			}

			// Run validation through filter system.
			$is_valid = \apply_filters(
				'validation_api_validate_meta',
				true,
				$value,
				$post_type,
				$meta_key,
				$config['check_name'],
				$config
			);

			// Default validation logic for 'required' check.
			if ( $is_valid && 'required' === $config['check_name'] ) {
				$is_valid = ! empty( $value ) && trim( (string) $value ) !== '';
			}

			// Return error only if validation fails and level is 'error'.
			if ( ! $is_valid && 'error' === $level ) {
				return new \WP_Error(
					'validation_api_validation_failed',
					$config['error_msg'],
					array( 'status' => 400 )
				);
			}

			// For warnings, allow save (client-side will show warning).
			return true;
		};
	}
}

<?php
/**
 * REST API: Checks Controller
 *
 * Exposes all registered validation checks via the REST API.
 *
 * @package ValidationAPI\Rest
 * @since   1.0.0
 */

namespace ValidationAPI\Rest;

use ValidationAPI\Block\Registry as BlockRegistry;
use ValidationAPI\Meta\Registry as MetaRegistry;
use ValidationAPI\Editor\Registry as EditorRegistry;
use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Response;
use WP_Error;

/**
 * REST controller for reading registered validation checks.
 *
 * Provides a single read-only endpoint that returns all checks from
 * the Block, Meta, and Editor registries, including plugin attribution.
 */
class ChecksController extends WP_REST_Controller {

	/**
	 * The namespace for this controller's routes.
	 *
	 * @var string
	 */
	protected $namespace = 'wp/v2';

	/**
	 * The base for this controller's routes.
	 *
	 * @var string
	 */
	protected $rest_base = 'validation-checks';

	/**
	 * Register the routes for this controller.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * Check if the current user has permission to read checks.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has access, WP_Error otherwise.
	 */
	public function get_items_permissions_check( $request ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Sorry, you are not allowed to view registered checks.', 'validation-api' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return true;
	}

	/**
	 * Retrieve all registered checks from all three registries.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response Response containing all registered checks.
	 */
	public function get_items( $request ): WP_REST_Response {
		$block_registry  = BlockRegistry::get_instance();
		$meta_registry   = MetaRegistry::get_instance();
		$editor_registry = EditorRegistry::get_instance();

		$data = array(
			'block'  => $this->prepare_block_checks( $block_registry ),
			'meta'   => $this->prepare_meta_checks( $meta_registry ),
			'editor' => $this->prepare_editor_checks( $editor_registry ),
		);

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * Prepare block checks for the response.
	 *
	 * @param BlockRegistry $registry The block checks registry.
	 * @return array Formatted block checks.
	 */
	private function prepare_block_checks( BlockRegistry $registry ): array {
		$all_checks = $registry->get_all_checks();
		$result     = array();

		foreach ( $all_checks as $block_type => $checks ) {
			$result[ $block_type ] = array();

			foreach ( $checks as $check_name => $check_args ) {
				$result[ $block_type ][ $check_name ] = $this->format_check( $check_args );
			}
		}

		return $result;
	}

	/**
	 * Prepare meta checks for the response.
	 *
	 * @param MetaRegistry $registry The meta checks registry.
	 * @return array Formatted meta checks.
	 */
	private function prepare_meta_checks( MetaRegistry $registry ): array {
		$all_checks = $registry->get_all_meta_checks();
		$result     = array();

		foreach ( $all_checks as $post_type => $meta_keys ) {
			$result[ $post_type ] = array();

			foreach ( $meta_keys as $meta_key => $checks ) {
				$result[ $post_type ][ $meta_key ] = array();

				foreach ( $checks as $check_name => $check_args ) {
					$result[ $post_type ][ $meta_key ][ $check_name ] = $this->format_check( $check_args );
				}
			}
		}

		return $result;
	}

	/**
	 * Prepare editor checks for the response.
	 *
	 * @param EditorRegistry $registry The editor checks registry.
	 * @return array Formatted editor checks.
	 */
	private function prepare_editor_checks( EditorRegistry $registry ): array {
		$all_checks = $registry->get_all_editor_checks();
		$result     = array();

		foreach ( $all_checks as $post_type => $checks ) {
			$result[ $post_type ] = array();

			foreach ( $checks as $check_name => $check_args ) {
				$result[ $post_type ][ $check_name ] = $this->format_check( $check_args );
			}
		}

		return $result;
	}

	/**
	 * Format a single check for the REST response.
	 *
	 * Extracts the standard fields and plugin attribution.
	 *
	 * @param array $check_args The raw check arguments from the registry.
	 * @return array The formatted check data.
	 */
	private function format_check( array $check_args ): array {
		return array(
			'level'        => $check_args['level'] ?? 'error',
			'description'  => $check_args['description'] ?? '',
			'error_msg'    => $check_args['error_msg'] ?? '',
			'warning_msg'  => $check_args['warning_msg'] ?? '',
			'priority'     => $check_args['priority'] ?? 10,
			'enabled'      => $check_args['enabled'] ?? true,
			'configurable' => $check_args['configurable'] ?? true,
			'_namespace'   => $check_args['_namespace'] ?? null,
		);
	}

	/**
	 * Get the schema for the checks endpoint.
	 *
	 * @return array The schema array.
	 */
	public function get_item_schema(): array {
		if ( $this->schema ) {
			return $this->add_additional_fields_schema( $this->schema );
		}

		$check_schema = array(
			'type'       => 'object',
			'properties' => array(
				'level'       => array(
					'type'        => 'string',
					'enum'        => array( 'error', 'warning', 'none' ),
					'description' => __( 'The severity level of the check.', 'validation-api' ),
				),
				'description' => array(
					'type'        => 'string',
					'description' => __( 'Human-readable description of the check.', 'validation-api' ),
				),
				'error_msg'   => array(
					'type'        => 'string',
					'description' => __( 'Message shown when the check fails at error level.', 'validation-api' ),
				),
				'warning_msg' => array(
					'type'        => 'string',
					'description' => __( 'Message shown when the check fails at warning level.', 'validation-api' ),
				),
				'priority'    => array(
					'type'        => 'integer',
					'description' => __( 'The priority of the check.', 'validation-api' ),
				),
				'enabled'     => array(
					'type'        => 'boolean',
					'description' => __( 'Whether the check is enabled.', 'validation-api' ),
				),
				'_namespace'  => array(
					'type'        => array( 'string', 'null' ),
					'description' => __( 'The namespace of the plugin that registered this check, or null if unattributed.', 'validation-api' ),
				),
			),
		);

		$this->schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'validation-api-checks',
			'type'       => 'object',
			'properties' => array(
				'block'  => array(
					'type'        => 'object',
					'description' => __( 'Block validation checks keyed by block type and check name.', 'validation-api' ),
				),
				'meta'   => array(
					'type'        => 'object',
					'description' => __( 'Meta validation checks keyed by post type, meta key, and check name.', 'validation-api' ),
				),
				'editor' => array(
					'type'        => 'object',
					'description' => __( 'Editor validation checks keyed by post type and check name.', 'validation-api' ),
				),
			),
		);

		return $this->add_additional_fields_schema( $this->schema );
	}
}

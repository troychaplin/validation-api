<?php
/**
 * Assets
 *
 * Manages registration and enqueueing of scripts and styles.
 *
 * @package ValidationAPI
 * @since 1.0.0
 */

namespace ValidationAPI\Core;

use ValidationAPI\Core\Traits\EditorDetection;
use ValidationAPI\Block\Registry as BlockRegistry;
use ValidationAPI\Meta\Registry as MetaRegistry;
use ValidationAPI\Editor\Registry as EditorRegistry;

/**
 * Class Assets
 *
 * Responsible for managing the registration and enqueueing of scripts and
 * styles within the Validation API plugin.
 */
class Assets {

	use EditorDetection;

	/**
	 * Script handle for the main validation API script.
	 *
	 * @var string
	 */
	private const VALIDATION_SCRIPT_HANDLE = 'validation-api-script';

	/**
	 * Path to the main block checks JavaScript file.
	 *
	 * @var string
	 */
	private const VALIDATION_SCRIPT_PATH = 'build/validation-api.js';

	/**
	 * Path to the main block checks stylesheet.
	 *
	 * @var string
	 */
	private const VALIDATION_STYLE_PATH = 'build/validation-api.css';

	/**
	 * The path to the plugin file.
	 *
	 * @var string
	 */
	private $plugin_file;

	/**
	 * The translations object.
	 *
	 * @var I18n
	 */
	private $translations;

	/**
	 * Constructs a new instance of the Assets class.
	 *
	 * @param string $plugin_file The path to the plugin file.
	 * @param I18n   $translations The translations object.
	 */
	public function __construct( string $plugin_file, I18n $translations ) {
		$this->plugin_file  = $plugin_file;
		$this->translations = $translations;

		// Inject validation config into editor settings instead of using wp_localize_script.
		add_filter( 'block_editor_settings_all', array( $this, 'inject_editor_settings' ), 10, 2 );
	}

	/**
	 * Enqueues the assets for the block editor.
	 *
	 * Only loads in post editor contexts (default and template views).
	 * The site editor is intentionally excluded.
	 *
	 * @return void
	 */
	public function enqueue_block_assets() {
		if ( ! $this->should_load_validation() ) {
			return;
		}

		$this->translations->setup_script_translations( self::VALIDATION_SCRIPT_HANDLE );

		$this->enqueue_block_scripts();
		$this->enqueue_block_styles();
	}

	/**
	 * Enqueues the block scripts for the plugin.
	 *
	 * @access private
	 * @return void
	 */
	private function enqueue_block_scripts() {
		wp_enqueue_script(
			self::VALIDATION_SCRIPT_HANDLE,
			plugins_url( self::VALIDATION_SCRIPT_PATH, $this->plugin_file ),
			array( 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-data', 'wp-edit-post', 'wp-element', 'wp-hooks', 'wp-i18n', 'wp-plugins' ),
			VALIDATION_API_VERSION,
			true
		);
	}

	/**
	 * Inject validation configuration into the block editor settings.
	 *
	 * Uses the `block_editor_settings_all` filter to pass validation rules
	 * and editor context through Gutenberg's standard editor settings mechanism,
	 * replacing the previous `wp_localize_script` approach.
	 *
	 * The config is available in JS via:
	 * `select('core/editor').getEditorSettings().validationApi`
	 *
	 * @param array                    $settings The editor settings array.
	 * @param \WP_Block_Editor_Context $context  The block editor context.
	 * @return array Modified editor settings with validation config.
	 */
	public function inject_editor_settings( array $settings, $context ): array {
		if ( ! $this->should_load_validation() ) {
			return $settings;
		}

		$registry                = BlockRegistry::get_instance();
		$meta_registry           = MetaRegistry::get_instance();
		$editor_registry         = EditorRegistry::get_instance();
		$validation_rules        = $this->prepare_validation_rules_for_js( $registry );
		$meta_validation_rules   = $this->prepare_meta_validation_rules_for_js( $meta_registry );
		$editor_validation_rules = $this->prepare_editor_validation_rules_for_js( $editor_registry );
		$registered_block_types  = $registry->get_registered_block_types();

		$settings['validationApi'] = array(
			'editorContext'         => $this->get_editor_context(),
			'validationRules'       => $validation_rules,
			'metaValidationRules'   => $meta_validation_rules,
			'editorValidationRules' => $editor_validation_rules,
			'registeredBlockTypes'  => $registered_block_types,
		);

		return $settings;
	}

	/**
	 * Enqueues the block styles.
	 *
	 * @access private
	 * @return void
	 */
	private function enqueue_block_styles() {
		wp_enqueue_style(
			'validation-api-style',
			plugins_url( self::VALIDATION_STYLE_PATH, $this->plugin_file ),
			array(),
			VALIDATION_API_VERSION
		);
	}

	/**
	 * Prepare validation rules from PHP registry for JavaScript consumption.
	 *
	 * @param BlockRegistry $registry The block checks registry instance.
	 * @return array Prepared validation rules for JavaScript.
	 */
	private function prepare_validation_rules_for_js( BlockRegistry $registry ): array {
		$all_checks = $registry->get_all_checks();
		$js_rules   = array();

		foreach ( $all_checks as $block_type => $checks ) {
			$js_rules[ $block_type ] = array();

			foreach ( $checks as $check_name => $check_config ) {
				$effective_type = $registry->get_effective_check_level( $block_type, $check_name );

				// Skip checks set to 'none'.
				if ( 'none' === $effective_type ) {
					continue;
				}

				$js_rules[ $block_type ][ $check_name ] = array(
					'error_msg'   => $check_config['error_msg'],
					'warning_msg' => $check_config['warning_msg'],
					'level'       => $effective_type,
					'priority'    => $check_config['priority'],
					'enabled'     => $check_config['enabled'],
					'description' => $check_config['description'],
				);
			}
		}

		return $js_rules;
	}

	/**
	 * Prepare meta validation rules for JavaScript.
	 *
	 * @param MetaRegistry $meta_registry The meta checks registry instance.
	 * @return array Formatted meta validation rules for JavaScript.
	 */
	private function prepare_meta_validation_rules_for_js( MetaRegistry $meta_registry ): array {
		$all_meta_checks = $meta_registry->get_all_meta_checks();
		$js_rules        = array();

		foreach ( $all_meta_checks as $post_type => $meta_fields ) {
			$js_rules[ $post_type ] = array();

			foreach ( $meta_fields as $meta_key => $checks ) {
				$js_rules[ $post_type ][ $meta_key ] = array();

				foreach ( $checks as $check_name => $check_config ) {
					$effective_type = $meta_registry->get_effective_meta_check_level( $post_type, $meta_key, $check_name );

					// Skip checks set to 'none'.
					if ( 'none' === $effective_type ) {
						continue;
					}

					$js_rules[ $post_type ][ $meta_key ][ $check_name ] = array(
						'error_msg'   => $check_config['error_msg'],
						'warning_msg' => $check_config['warning_msg'],
						'level'       => $effective_type,
						'priority'    => $check_config['priority'],
						'enabled'     => $check_config['enabled'],
						'description' => $check_config['description'],
					);
				}
			}
		}

		return $js_rules;
	}

	/**
	 * Prepare editor validation rules for JavaScript.
	 *
	 * @param EditorRegistry $editor_registry The editor checks registry instance.
	 * @return array Formatted editor validation rules for JavaScript.
	 */
	private function prepare_editor_validation_rules_for_js( EditorRegistry $editor_registry ): array {
		$all_editor_checks = $editor_registry->get_all_editor_checks();
		$js_rules          = array();

		foreach ( $all_editor_checks as $post_type => $checks ) {
			$js_rules[ $post_type ] = array();

			foreach ( $checks as $check_name => $check_config ) {
				$effective_type = $editor_registry->get_effective_editor_check_level( $post_type, $check_name );

				// Skip checks set to 'none'.
				if ( 'none' === $effective_type ) {
					continue;
				}

				$js_rules[ $post_type ][ $check_name ] = array(
					'error_msg'   => $check_config['error_msg'],
					'warning_msg' => $check_config['warning_msg'],
					'level'       => $effective_type,
					'priority'    => $check_config['priority'],
					'enabled'     => $check_config['enabled'],
					'description' => $check_config['description'],
				);
			}
		}

		return $js_rules;
	}
}

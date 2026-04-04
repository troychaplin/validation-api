<?php
/**
 * Internationalization
 *
 * Handles translation and script localization for the Validation API plugin.
 *
 * @package ValidationAPI
 * @since 1.0.0
 */

namespace ValidationAPI\Core;

/**
 * Class I18n
 *
 * Responsible for handling translation-related functionality within the Validation API plugin.
 */
class I18n {

	/**
	 * The path to the plugin file.
	 *
	 * @var string
	 */
	private $plugin_file;

	/**
	 * The text domain for translations.
	 *
	 * @var string
	 */
	private $text_domain;

	/**
	 * Constructor.
	 *
	 * @param string $plugin_file The path to the plugin file.
	 * @param string $text_domain The text domain for translations.
	 */
	public function __construct( string $plugin_file, string $text_domain ) {
		$this->plugin_file = $plugin_file;
		$this->text_domain = $text_domain;
	}

	/**
	 * Sets up translations for a script.
	 *
	 * @param string $script_handle The handle of the script to set up translations for.
	 * @return void
	 */
	public function setup_script_translations( string $script_handle ): void {
		\wp_set_script_translations(
			$script_handle,
			$this->text_domain,
			\plugin_dir_path( $this->plugin_file ) . 'languages'
		);
	}
}

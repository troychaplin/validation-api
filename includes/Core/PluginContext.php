<?php
/**
 * Plugin context manager.
 *
 * @package ValidationAPI\Core
 * @since   1.0.0
 */

namespace ValidationAPI\Core;

/**
 * Manages the current plugin registration context.
 *
 * When validation_api_register_plugin() is called, it sets the active context
 * before invoking the check registration callback or CheckProvider classes.
 * Each registry's registration method reads from this context to stamp checks
 * with the originating plugin's identity.
 *
 * This is a static utility class — no instances are created.
 */
class PluginContext {

	/**
	 * The currently active plugin info, or null if no context is set.
	 *
	 * @var array|null
	 */
	private static $current = null;

	/**
	 * Set the active plugin context.
	 *
	 * @param array $plugin_info Plugin metadata with at least a 'name' key.
	 * @return void
	 */
	public static function set( array $plugin_info ): void {
		self::$current = $plugin_info;
	}

	/**
	 * Get the active plugin context.
	 *
	 * @return array|null The current plugin info, or null if no context is active.
	 */
	public static function get(): ?array {
		return self::$current;
	}

	/**
	 * Clear the active plugin context.
	 *
	 * @return void
	 */
	public static function clear(): void {
		self::$current = null;
	}
}

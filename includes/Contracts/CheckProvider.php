<?php
/**
 * CheckProvider interface.
 *
 * @package ValidationAPI\Contracts
 * @since   1.0.0
 */

namespace ValidationAPI\Contracts;

/**
 * Contract for class-based check registration.
 *
 * Implement this interface to organize validation checks into discrete classes.
 * Each provider is responsible for registering its own checks via the global
 * registration functions (validation_api_register_block_check, etc.).
 *
 * When used with validation_api_register_plugin(), all checks registered within
 * the provider's register() method are automatically attributed to the parent plugin.
 *
 * Example:
 *
 *     use ValidationAPI\Contracts\CheckProvider;
 *
 *     class ImageChecks implements CheckProvider {
 *         public function register(): void {
 *             validation_api_register_block_check( 'core/image', [
 *                 'name'      => 'alt_text',
 *                 'level'     => 'error',
 *                 'error_msg' => 'This image is missing alt text.',
 *             ] );
 *         }
 *     }
 */
interface CheckProvider {

	/**
	 * Register validation checks.
	 *
	 * Called within a scoped plugin context when used with
	 * validation_api_register_plugin(). All checks registered here
	 * are automatically attributed to the parent plugin.
	 *
	 * @return void
	 */
	public function register(): void;
}

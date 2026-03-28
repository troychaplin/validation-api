/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { blockChecksArray } from '../../register';
import {
	isCheckEnabled,
	createIssue,
	hasErrors,
	hasWarnings,
	createValidationResult,
} from '../../../shared/utils/validation';

/**
 * Validates a block against all PHP-registered checks.
 *
 * Checks are registered server-side via PHP and exposed through
 * window.BlockAccessibilityChecks.validationRules. External plugins provide
 * validation logic either via a `validator` function on the check config or
 * via the `ba11yc_validate_block` JS filter.
 *
 * @param {Object} block - The block object containing name, attributes, clientId, etc.
 * @return {Object} Validation result with isValid, issues array, severity mode, clientId, and block name.
 */
export const validateBlock = block => {
	const blockType = block.name;
	const attributes = block.attributes;
	const issues = [];

	// All checks come from PHP-registered rules via wp_localize_script.
	const checks = blockChecksArray[blockType] || {};

	// No checks registered for this block type - return valid.
	if (Object.keys(checks).length === 0) {
		return {
			isValid: true,
			issues: [],
			mode: 'none',
			clientId: block.clientId,
			name: blockType,
		};
	}

	// Run each registered check for this block type.
	Object.entries(checks).forEach(([checkName, checkConfig]) => {
		// Skip checks that have been explicitly disabled.
		if (!isCheckEnabled(checkConfig)) {
			return;
		}

		let isValid = true;

		// If the check config includes a validator function, use it.
		// Otherwise defer entirely to the filter — external plugins own the logic.
		if (typeof checkConfig.validator === 'function') {
			isValid = checkConfig.validator(attributes, block);
		}

		/**
		 * Filter: ba11yc_validate_block
		 *
		 * Primary extension point for block validation logic. External plugins
		 * hook here to implement their check logic and return true (valid) or
		 * false (invalid).
		 */
		isValid = applyFilters(
			'ba11yc_validate_block',
			isValid,
			blockType,
			attributes,
			checkName,
			block
		);

		if (!isValid) {
			issues.push(createIssue(checkConfig, checkName));
		}
	});

	// Errors take precedence over warnings.
	let mode = 'none';
	if (hasErrors(issues)) {
		mode = 'error';
	} else if (hasWarnings(issues)) {
		mode = 'warning';
	}

	return createValidationResult(issues, {
		mode,
		clientId: block.clientId,
		name: blockType,
	});
};

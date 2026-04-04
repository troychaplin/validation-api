/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { ValidationProvider } from './components/ValidationProvider';
import { ValidationAPI } from './validation/ValidationAPI';
import { ValidationSidebar } from './components/ValidationSidebar';

/**
 * Register the validation plugin with WordPress
 *
 * This plugin registration activates the validation system in the block editor,
 * rendering both the ValidationAPI (which handles validation logic and state)
 * and the ValidationSidebar (which displays validation results to users).
 * Both components are rendered together to provide a complete validation experience.
 */
registerPlugin('validation-api', {
	render: () => (
		<>
			<ValidationProvider />
			<ValidationAPI />
			<ValidationSidebar />
		</>
	),
});

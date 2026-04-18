/**
 * Side-effect module. Registers the validation plugin with the block editor.
 *
 * The registered plugin mounts three siblings:
 *   - <ValidationSync />      : invokes useValidationSync, returns null
 *   - <ValidationLifecycle /> : invokes useValidationLifecycle, returns null
 *   - <ValidationSidebar />   : renders the sidebar (null when no issues)
 *
 * Siblings (rather than two hooks inside a single parent component) avoid an
 * infinite-render loop: useValidationSync dispatches to the core/validation
 * store; useValidationLifecycle subscribes to it. Putting both hooks in the
 * same component causes the dispatch to re-render that component, which
 * re-runs the sync hook with fresh array references → another dispatch → loop.
 * Keeping them as siblings isolates their render cycles.
 *
 * Imported for side effects from src/hooks/index.js.
 */

/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { useValidationSync } from './use-validation-sync';
import { useValidationLifecycle } from './use-validation-lifecycle';
import { ValidationSidebar } from '../components/validation-sidebar';

function ValidationSync() {
	useValidationSync();
	return null;
}

function ValidationLifecycle() {
	useValidationLifecycle();
	return null;
}

function ValidationPlugin() {
	return (
		<>
			<ValidationSync />
			<ValidationLifecycle />
			<ValidationSidebar />
		</>
	);
}

registerPlugin('core-validation', {
	render: ValidationPlugin,
});

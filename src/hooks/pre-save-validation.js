/**
 * Side-effect module. Adds the `editor.preSavePost` async filter as a
 * save-time safety net layered on top of `lockPostSaving`.
 *
 * If any error-level validation failures are present in the store at save
 * time, the save is aborted by throwing from the filter callback. In the
 * happy path this never fires — `useValidationLifecycle` locks saving
 * reactively. This hook catches edge cases where the lock may not have
 * propagated (race conditions, direct dispatches, etc.).
 *
 * Imported for side effects from src/hooks/index.js.
 */

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store/constants';

addFilter('editor.preSavePost', 'validation-api/pre-save-gate', async edits => {
	const validationStore = select(STORE_NAME);
	if (validationStore && validationStore.hasErrors && validationStore.hasErrors()) {
		throw new Error(__('Validation errors must be resolved before saving.', 'validation-api'));
	}
	return edits;
});

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store/constants';

/**
 * React hook that reads the three aggregate validation arrays from the store.
 *
 * Consolidates the 3-selector `useSelect` block that was previously duplicated
 * between `useValidationLifecycle` and `ValidationSidebar`. Components that
 * need any or all of these arrays call this hook to read them in one pass.
 *
 * @return {Object} { invalidBlocks, invalidMeta, invalidEditorChecks }
 */
export function useValidationIssues() {
	return useSelect(select => {
		const store = select(STORE_NAME);
		return {
			invalidBlocks: store.getInvalidBlocks(),
			invalidMeta: store.getInvalidMeta(),
			invalidEditorChecks: store.getInvalidEditorChecks(),
		};
	}, []);
}

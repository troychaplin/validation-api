/**
 * Validation API package entry.
 *
 * Side-effect imports register the store, filters, and sidebar plugin on
 * module load. Named exports are provided so a consumer that imports from
 * `build/validation-api.js` can access the public API (store selectors/
 * actions, utilities, components) directly — though the typical consumer
 * will interact with the package via the WP filter hooks and the
 * `core/validation` @wordpress/data store.
 */

import './store';
import './hooks';
import './styles.scss';

export { STORE_NAME } from './store/constants';
export {
	setInvalidBlocks,
	setInvalidMeta,
	setInvalidEditorChecks,
	setBlockValidation,
	clearBlockValidation,
} from './store/actions';
export {
	getInvalidBlocks,
	getInvalidMeta,
	getInvalidEditorChecks,
	getBlockValidation,
	hasErrors,
	hasWarnings,
} from './store/selectors';

export * from './utils';

export { ValidationIcon } from './components/validation-icon';
export { ValidationSidebar } from './components/validation-sidebar';
export { ValidationToolbarButton } from './components/validation-toolbar-button';

export { useValidationSync } from './hooks/use-validation-sync';
export { useValidationLifecycle } from './hooks/use-validation-lifecycle';

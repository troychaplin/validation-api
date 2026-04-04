// Register the plugin
import './editor/register';

// Validate blocks
import './editor/validation/blocks/validateBlock';
import './editor/hoc/withErrorHandling';
import './editor/hoc/withBlockValidationClasses';

// Editor Validation
import './editor/validation/editor/validateEditor';

// Styles
import './styles.scss';

// Export meta validation components for external plugins
import { useMetaField } from './editor/validation/meta/hooks';

// Make available globally
if (typeof window.ValidationAPI === 'undefined') {
	window.ValidationAPI = {};
}

window.ValidationAPI.useMetaField = useMetaField;

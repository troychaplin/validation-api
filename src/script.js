// Register the plugin
import './editor/register';

// Validate blocks
import './editor/validation/blocks/validateBlock';
import './editor/hoc/withErrorHandling';

// Editor Validation
import './editor/validation/editor/validateEditor';

// Styles
import './styles.scss';

// Export meta validation components for external plugins
import { useMetaField } from './editor/validation/meta/hooks';

// Make available globally
if (typeof window.BlockAccessibilityChecks === 'undefined') {
	window.BlockAccessibilityChecks = {};
}

window.BlockAccessibilityChecks.useMetaField = useMetaField;

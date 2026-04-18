/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateAllMetaChecks } from './validate-meta';

/**
 * Custom React hook to manage meta field state, validation, and UI integration.
 *
 * Provides a unified interface for meta field controls in the editor, handling:
 * - Reading current meta field value from the editor store
 * - Updating meta field value when user changes input
 * - Displaying validation errors/warnings in the help text
 * - Applying validation-specific CSS classes for styling
 *
 * @param {string} metaKey      - The meta key to manage (e.g., '_wp_page_template').
 * @param {string} originalHelp - Optional original help text to display alongside validation messages.
 * @return {Object} Object containing value, onChange handler, help text, and className for the control.
 */
export function useMetaField(metaKey, originalHelp = '') {
	// Single useSelect reads post type + meta value + runs validation.
	const { value, validation } = useSelect(
		select => {
			const editor = select('core/editor');
			if (!editor) {
				return {
					value: '',
					validation: {
						isValid: true,
						hasErrors: false,
						hasWarnings: false,
						issues: [],
						wrapperClassName: '',
					},
				};
			}

			const postType = editor.getCurrentPostType();
			const meta = editor.getEditedPostAttribute('meta');
			const currentValue = meta ? meta[metaKey] : '';

			if (!postType || !metaKey) {
				return {
					value: currentValue,
					validation: {
						isValid: true,
						hasErrors: false,
						hasWarnings: false,
						issues: [],
						wrapperClassName: '',
					},
				};
			}

			const result = validateAllMetaChecks(postType, metaKey, currentValue);

			let wrapperClassName = '';
			if (result.hasErrors) {
				wrapperClassName = 'validation-api-meta-error';
			} else if (result.hasWarnings) {
				wrapperClassName = 'validation-api-meta-warning';
			}

			return {
				value: currentValue,
				validation: { ...result, wrapperClassName },
			};
		},
		[metaKey]
	);

	const { editPost } = useDispatch('core/editor');

	// Enhance help text with validation messages if issues exist.
	let helpText = originalHelp;
	if (validation && (validation.hasErrors || validation.hasWarnings)) {
		const messages = validation.issues
			.map(issue => issue.message || issue.errorMsg || issue.warningMsg)
			.join('. ');
		const messageClass = validation.hasErrors
			? 'validation-api-error-text'
			: 'validation-api-warning-text';

		if (helpText) {
			helpText = (
				<>
					{helpText}
					<span className={messageClass}>* {messages}</span>
				</>
			);
		} else {
			helpText = <span className={messageClass}>* {messages}</span>;
		}
	}

	return {
		value: value || '',
		onChange: newValue => {
			if (editPost) {
				editPost({ meta: { [metaKey]: newValue } });
			}
		},
		help: helpText,
		className: validation?.wrapperClassName
			? `validation-api-field ${validation.wrapperClassName}`
			: '',
	};
}

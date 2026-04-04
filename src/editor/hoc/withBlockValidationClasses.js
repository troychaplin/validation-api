/**
 * Internal dependencies
 */
import { getBlockValidation } from '../store';

/**
 * Adds validation CSS classes to the block's own wrapper element.
 *
 * Uses the editor.BlockListBlock filter with wrapperProps to inject
 * classes directly onto the block's native DOM element, avoiding
 * the need for an extra wrapper div.
 *
 * @param {Function} BlockListBlock The original BlockListBlock component.
 * @return {Function} Wrapped component with validation classes.
 */
function withBlockValidationClasses(BlockListBlock) {
	return props => {
		const validation = getBlockValidation(props.clientId);

		if (validation.mode === 'none') {
			return <BlockListBlock {...props} />;
		}

		const validationClass =
			validation.mode === 'error'
				? 'validation-api-block-error'
				: 'validation-api-block-warning';

		const existingWrapperProps = props.wrapperProps || {};
		const newWrapperProps = {
			...existingWrapperProps,
			className: [existingWrapperProps.className, validationClass].filter(Boolean).join(' '),
		};

		return <BlockListBlock {...props} wrapperProps={newWrapperProps} />;
	};
}

wp.hooks.addFilter(
	'editor.BlockListBlock',
	'validation-api/with-block-validation-classes',
	withBlockValidationClasses
);

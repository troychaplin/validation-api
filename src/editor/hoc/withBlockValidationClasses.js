/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store';

/**
 * Adds validation CSS classes to the block's own wrapper element.
 *
 * Uses the editor.BlockListBlock filter with wrapperProps to inject
 * classes directly onto the block's native DOM element, avoiding
 * the need for an extra wrapper div.
 *
 * Reads per-block validation state from the data store, giving it
 * proper reactive subscriptions so classes update when validation changes.
 *
 * @param {Function} BlockListBlock The original BlockListBlock component.
 * @return {Function} Wrapped component with validation classes.
 */
function withBlockValidationClasses(BlockListBlock) {
	return props => {
		const validation = useSelect(
			select => select(STORE_NAME).getBlockValidation(props.clientId),
			[props.clientId]
		);

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

addFilter(
	'editor.BlockListBlock',
	'validation-api/with-block-validation-classes',
	withBlockValidationClasses
);

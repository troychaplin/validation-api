/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { BlockControls } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { validateBlock } from '../validation/blocks';
import { ValidationToolbarButton } from '../components/ValidationToolbarButton';
import { useDebouncedValidation } from '../../shared/hooks';
import { STORE_NAME } from '../store';

/**
 * Higher-order component that adds validation indicators to blocks.
 *
 * Runs debounced validation on each block and:
 * - Syncs the result to the shared validation store so the
 *   editor.BlockListBlock filter can apply CSS classes.
 * - Renders a toolbar button (via BlockControls) when issues exist,
 *   allowing users to view the full issue list in a modal.
 */
const withErrorHandling = createHigherOrderComponent(BlockEdit => {
	return props => {
		const { clientId, attributes } = props;

		const block = useSelect(
			select => {
				return select('core/block-editor').getBlock(clientId);
			},
			[clientId]
		);

		const { setBlockValidation, clearBlockValidation } = useDispatch(STORE_NAME);

		const validationResult = useDebouncedValidation(
			() => {
				if (!block) {
					return { isValid: true, issues: [], mode: 'none' };
				}
				const blockToValidate = {
					...block,
					attributes: attributes || block.attributes,
				};
				return validateBlock(blockToValidate);
			},
			[block, attributes],
			{ delay: 300 }
		);

		// Sync validation state to the data store so the
		// editor.BlockListBlock filter can read it for CSS classes.
		useEffect(() => {
			setBlockValidation(clientId, validationResult);
			return () => clearBlockValidation(clientId);
		}, [clientId, validationResult, setBlockValidation, clearBlockValidation]);

		return (
			<>
				<BlockEdit {...props} />
				{!validationResult.isValid && (
					<BlockControls group="block">
						<ValidationToolbarButton issues={validationResult.issues} />
					</BlockControls>
				)}
			</>
		);
	};
}, 'withErrorHandling');

wp.hooks.addFilter('editor.BlockEdit', 'validation-api/with-error-handling', withErrorHandling);

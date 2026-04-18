/**
 * Internal dependencies
 */
import { DEFAULT_BLOCK_RESULT } from './constants';

/**
 * Get all invalid block validation results for the current post.
 *
 * @example
 *
 * ```js
 * import { useSelect } from '@wordpress/data';
 *
 * const InvalidBlocksCount = () => {
 *     const invalidBlocks = useSelect( ( select ) =>
 *         select( 'core/validation' ).getInvalidBlocks()
 *     );
 *     return <span>{ invalidBlocks.length } block issues</span>;
 * };
 * ```
 *
 * @param {Object} state Store state.
 * @return {Array} Array of invalid block results.
 */
export function getInvalidBlocks(state) {
	return state.blocks;
}

/**
 * Get all invalid meta validation results for the current post.
 *
 * @example
 *
 * ```js
 * import { useSelect } from '@wordpress/data';
 *
 * const InvalidMetaCount = () => {
 *     const invalidMeta = useSelect( ( select ) =>
 *         select( 'core/validation' ).getInvalidMeta()
 *     );
 *     return <span>{ invalidMeta.length } meta field issues</span>;
 * };
 * ```
 *
 * @param {Object} state Store state.
 * @return {Array} Array of invalid meta results.
 */
export function getInvalidMeta(state) {
	return state.meta;
}

/**
 * Get all editor-level validation issues for the current post.
 *
 * @example
 *
 * ```js
 * import { useSelect } from '@wordpress/data';
 *
 * const EditorChecks = () => {
 *     const editorIssues = useSelect( ( select ) =>
 *         select( 'core/validation' ).getInvalidEditorChecks()
 *     );
 *     return <span>{ editorIssues.length } document-level issues</span>;
 * };
 * ```
 *
 * @param {Object} state Store state.
 * @return {Array} Array of editor check issues.
 */
export function getInvalidEditorChecks(state) {
	return state.editor;
}

/**
 * Get a single block's validation result.
 *
 * Returns `{ mode: 'none', issues: [] }` when no result has been stored for
 * the given clientId. The `mode` property is one of `'error'`, `'warning'`,
 * or `'none'`.
 *
 * @example
 *
 * ```js
 * import { useSelect } from '@wordpress/data';
 *
 * const BlockStatus = ( { clientId } ) => {
 *     const { mode, issues } = useSelect(
 *         ( select ) => select( 'core/validation' ).getBlockValidation( clientId ),
 *         [ clientId ]
 *     );
 *     if ( mode === 'none' ) return null;
 *     return <span className={ `validation-${ mode }` }>{ issues.length }</span>;
 * };
 * ```
 *
 * @param {Object} state    Store state.
 * @param {string} clientId Block client ID.
 * @return {Object} Validation result ({ mode, issues }).
 */
export function getBlockValidation(state, clientId) {
	return state.blockValidation[clientId] || DEFAULT_BLOCK_RESULT;
}

/**
 * Check if any validation errors exist across blocks, meta, and editor checks.
 *
 * Commonly used to gate publish/save UI or drive a global warning banner.
 *
 * @example
 *
 * ```js
 * import { useSelect } from '@wordpress/data';
 *
 * const PublishButton = () => {
 *     const hasErrors = useSelect( ( select ) =>
 *         select( 'core/validation' ).hasErrors()
 *     );
 *     return <button disabled={ hasErrors }>Publish</button>;
 * };
 * ```
 *
 * @param {Object} state Store state.
 * @return {boolean} True if any errors exist.
 */
export function hasErrors(state) {
	const hasBlockErrors = state.blocks.some(block => block.mode === 'error');
	const hasMetaErrors = state.meta.some(meta => meta.hasErrors);
	const hasEditorErrors = state.editor.some(issue => issue.type === 'error');
	return hasBlockErrors || hasMetaErrors || hasEditorErrors;
}

/**
 * Check if any validation warnings exist (only when no errors are present).
 *
 * Errors take precedence — if any error exists this returns `false` even
 * when warnings are also present. Use in combination with `hasErrors()` for
 * a tri-state UI.
 *
 * @example
 *
 * ```js
 * import { useSelect } from '@wordpress/data';
 *
 * const StatusBadge = () => {
 *     const { hasErrors, hasWarnings } = useSelect( ( select ) => {
 *         const store = select( 'core/validation' );
 *         return {
 *             hasErrors: store.hasErrors(),
 *             hasWarnings: store.hasWarnings(),
 *         };
 *     } );
 *     if ( hasErrors ) return <Badge tone="error" />;
 *     if ( hasWarnings ) return <Badge tone="warning" />;
 *     return <Badge tone="success" />;
 * };
 * ```
 *
 * @param {Object} state Store state.
 * @return {boolean} True if warnings exist and no errors exist.
 */
export function hasWarnings(state) {
	if (hasErrors(state)) {
		return false;
	}
	const hasBlockWarnings = state.blocks.some(block => block.mode === 'warning');
	const hasMetaWarnings = state.meta.some(meta => meta.hasWarnings && !meta.hasErrors);
	const hasEditorWarnings = state.editor.some(issue => issue.type === 'warning');
	return hasBlockWarnings || hasMetaWarnings || hasEditorWarnings;
}

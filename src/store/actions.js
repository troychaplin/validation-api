/**
 * Internal dependencies
 */
import {
	SET_INVALID_BLOCKS,
	SET_INVALID_META,
	SET_INVALID_EDITOR_CHECKS,
	SET_BLOCK_VALIDATION,
	CLEAR_BLOCK_VALIDATION,
} from './constants';

/**
 * Set the array of invalid block validation results.
 *
 * Typically dispatched by the validation lifecycle hook on every editor
 * change. External plugins rarely need to dispatch this directly.
 *
 * @example
 *
 * ```js
 * import { useDispatch } from '@wordpress/data';
 *
 * const { setInvalidBlocks } = useDispatch( 'core/validation' );
 * setInvalidBlocks( [
 *     { clientId: 'abc', name: 'core/image', mode: 'error', issues: [ ... ] },
 * ] );
 * ```
 *
 * @param {Array} results Invalid block results from useInvalidBlocks.
 * @return {Object} Action object.
 */
export function setInvalidBlocks(results) {
	return { type: SET_INVALID_BLOCKS, results };
}

/**
 * Set the array of invalid meta validation results.
 *
 * @example
 *
 * ```js
 * import { useDispatch } from '@wordpress/data';
 *
 * const { setInvalidMeta } = useDispatch( 'core/validation' );
 * setInvalidMeta( [
 *     { metaKey: 'seo_description', hasErrors: true, issues: [ ... ] },
 * ] );
 * ```
 *
 * @param {Array} results Invalid meta results from useInvalidMeta.
 * @return {Object} Action object.
 */
export function setInvalidMeta(results) {
	return { type: SET_INVALID_META, results };
}

/**
 * Set the array of editor-level validation issues.
 *
 * @example
 *
 * ```js
 * import { useDispatch } from '@wordpress/data';
 *
 * const { setInvalidEditorChecks } = useDispatch( 'core/validation' );
 * setInvalidEditorChecks( [
 *     { type: 'error', errorMsg: 'Posts must start with a heading.' },
 * ] );
 * ```
 *
 * @param {Array} issues Editor check issues from useInvalidEditorChecks.
 * @return {Object} Action object.
 */
export function setInvalidEditorChecks(issues) {
	return { type: SET_INVALID_EDITOR_CHECKS, issues };
}

/**
 * Store a single block's validation result.
 *
 * The per-block validation map is keyed by clientId and read by the
 * `editor.BlockListBlock` filter to apply error/warning CSS classes.
 *
 * @example
 *
 * ```js
 * import { useDispatch } from '@wordpress/data';
 *
 * const { setBlockValidation } = useDispatch( 'core/validation' );
 * setBlockValidation( clientId, { mode: 'warning', issues: [ ... ] } );
 * ```
 *
 * @param {string} clientId Block client ID.
 * @param {Object} result   Validation result ({ mode, issues }).
 * @return {Object} Action object.
 */
export function setBlockValidation(clientId, result) {
	return { type: SET_BLOCK_VALIDATION, clientId, result };
}

/**
 * Remove a single block's validation result.
 *
 * Typically dispatched when a block unmounts so its entry doesn't linger
 * in the per-block validation map.
 *
 * @example
 *
 * ```js
 * import { useDispatch } from '@wordpress/data';
 * import { useEffect } from '@wordpress/element';
 *
 * const { clearBlockValidation } = useDispatch( 'core/validation' );
 * useEffect( () => () => clearBlockValidation( clientId ), [ clientId ] );
 * ```
 *
 * @param {string} clientId Block client ID.
 * @return {Object} Action object.
 */
export function clearBlockValidation(clientId) {
	return { type: CLEAR_BLOCK_VALIDATION, clientId };
}

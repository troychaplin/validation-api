/**
 * Block Validation Store
 *
 * Module-level Map that shares validation state between the
 * editor.BlockEdit filter (writes) and editor.BlockListBlock filter (reads).
 * This avoids the overhead of a full WordPress data store while keeping
 * both filters in sync.
 */

const validationMap = new Map();

const defaultResult = Object.freeze({ mode: 'none', issues: [] });

/**
 * Store a block's validation result.
 *
 * @param {string} clientId      Block client ID.
 * @param {Object} result        Validation result.
 * @param {string} result.mode   'none' | 'error' | 'warning'
 * @param {Array}  result.issues Array of issue objects.
 */
export function setBlockValidation(clientId, result) {
	validationMap.set(clientId, result);
}

/**
 * Read a block's validation result.
 *
 * @param {string} clientId Block client ID.
 * @return {Object} Validation result or default (mode: 'none', issues: []).
 */
export function getBlockValidation(clientId) {
	return validationMap.get(clientId) || defaultResult;
}

/**
 * Remove a block's validation result (call on unmount).
 *
 * @param {string} clientId Block client ID.
 */
export function clearBlockValidation(clientId) {
	validationMap.delete(clientId);
}

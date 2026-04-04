/**
 * Store constants for the validation-api data store.
 */

export const STORE_NAME = 'validation-api';

export const SET_INVALID_BLOCKS = 'SET_INVALID_BLOCKS';
export const SET_INVALID_META = 'SET_INVALID_META';
export const SET_INVALID_EDITOR_CHECKS = 'SET_INVALID_EDITOR_CHECKS';
export const SET_BLOCK_VALIDATION = 'SET_BLOCK_VALIDATION';
export const CLEAR_BLOCK_VALIDATION = 'CLEAR_BLOCK_VALIDATION';

export const DEFAULT_STATE = {
	blocks: [],
	meta: [],
	editor: [],
	blockValidation: {},
};

export const DEFAULT_BLOCK_RESULT = Object.freeze({ mode: 'none', issues: [] });

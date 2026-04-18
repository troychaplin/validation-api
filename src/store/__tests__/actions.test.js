/**
 * Internal dependencies
 */
import {
	setInvalidBlocks,
	setInvalidMeta,
	setInvalidEditorChecks,
	setBlockValidation,
	clearBlockValidation,
} from '../actions';
import {
	SET_INVALID_BLOCKS,
	SET_INVALID_META,
	SET_INVALID_EDITOR_CHECKS,
	SET_BLOCK_VALIDATION,
	CLEAR_BLOCK_VALIDATION,
} from '../constants';

describe('core/validation action creators', () => {
	it('setInvalidBlocks returns SET_INVALID_BLOCKS with results', () => {
		const results = [{ clientId: 'a', mode: 'error', issues: [] }];
		expect(setInvalidBlocks(results)).toEqual({
			type: SET_INVALID_BLOCKS,
			results,
		});
	});

	it('setInvalidMeta returns SET_INVALID_META with results', () => {
		const results = [{ metaKey: 'seo', hasErrors: true, issues: [] }];
		expect(setInvalidMeta(results)).toEqual({
			type: SET_INVALID_META,
			results,
		});
	});

	it('setInvalidEditorChecks returns SET_INVALID_EDITOR_CHECKS with issues', () => {
		const issues = [{ type: 'error', errorMsg: 'Missing heading' }];
		expect(setInvalidEditorChecks(issues)).toEqual({
			type: SET_INVALID_EDITOR_CHECKS,
			issues,
		});
	});

	it('setBlockValidation returns SET_BLOCK_VALIDATION with clientId and result', () => {
		const result = { mode: 'warning', issues: [] };
		expect(setBlockValidation('abc', result)).toEqual({
			type: SET_BLOCK_VALIDATION,
			clientId: 'abc',
			result,
		});
	});

	it('clearBlockValidation returns CLEAR_BLOCK_VALIDATION with clientId', () => {
		expect(clearBlockValidation('abc')).toEqual({
			type: CLEAR_BLOCK_VALIDATION,
			clientId: 'abc',
		});
	});
});

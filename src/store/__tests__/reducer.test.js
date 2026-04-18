/**
 * Internal dependencies
 */
import { reducer } from '../reducer';
import {
	DEFAULT_STATE,
	SET_INVALID_BLOCKS,
	SET_INVALID_META,
	SET_INVALID_EDITOR_CHECKS,
	SET_BLOCK_VALIDATION,
	CLEAR_BLOCK_VALIDATION,
} from '../constants';

describe('core/validation reducer', () => {
	it('returns the default state when called with undefined', () => {
		const next = reducer(undefined, { type: '@@INIT' });
		expect(next).toEqual(DEFAULT_STATE);
	});

	it('returns unchanged state for unknown action types', () => {
		const state = {
			blocks: [{ clientId: 'a', mode: 'error', issues: [] }],
			meta: [],
			editor: [],
			blockValidation: {},
		};
		const next = reducer(state, { type: 'UNRELATED_ACTION' });
		expect(next).toBe(state);
	});

	describe('SET_INVALID_BLOCKS', () => {
		it('replaces the blocks array with the provided results', () => {
			const results = [
				{ clientId: 'abc', mode: 'error', issues: [] },
				{ clientId: 'def', mode: 'warning', issues: [] },
			];
			const next = reducer(DEFAULT_STATE, {
				type: SET_INVALID_BLOCKS,
				results,
			});
			expect(next.blocks).toBe(results);
			expect(next.meta).toBe(DEFAULT_STATE.meta);
			expect(next.editor).toBe(DEFAULT_STATE.editor);
		});
	});

	describe('SET_INVALID_META', () => {
		it('replaces the meta array with the provided results', () => {
			const results = [{ metaKey: 'seo', hasErrors: true, issues: [] }];
			const next = reducer(DEFAULT_STATE, {
				type: SET_INVALID_META,
				results,
			});
			expect(next.meta).toBe(results);
		});
	});

	describe('SET_INVALID_EDITOR_CHECKS', () => {
		it('replaces the editor array with the provided issues', () => {
			const issues = [{ type: 'error', errorMsg: 'Required heading' }];
			const next = reducer(DEFAULT_STATE, {
				type: SET_INVALID_EDITOR_CHECKS,
				issues,
			});
			expect(next.editor).toBe(issues);
		});
	});

	describe('SET_BLOCK_VALIDATION', () => {
		it('stores a per-block result keyed by clientId', () => {
			const result = { mode: 'error', issues: [{ type: 'error' }] };
			const next = reducer(DEFAULT_STATE, {
				type: SET_BLOCK_VALIDATION,
				clientId: 'abc',
				result,
			});
			expect(next.blockValidation.abc).toBe(result);
		});

		it('preserves other per-block results', () => {
			const existing = { mode: 'warning', issues: [] };
			const state = {
				...DEFAULT_STATE,
				blockValidation: { existing },
			};
			const next = reducer(state, {
				type: SET_BLOCK_VALIDATION,
				clientId: 'abc',
				result: { mode: 'error', issues: [] },
			});
			expect(next.blockValidation.existing).toBe(existing);
			expect(next.blockValidation.abc.mode).toBe('error');
		});
	});

	describe('CLEAR_BLOCK_VALIDATION', () => {
		it('removes the entry for the given clientId', () => {
			const state = {
				...DEFAULT_STATE,
				blockValidation: {
					abc: { mode: 'error', issues: [] },
					def: { mode: 'warning', issues: [] },
				},
			};
			const next = reducer(state, {
				type: CLEAR_BLOCK_VALIDATION,
				clientId: 'abc',
			});
			expect(next.blockValidation).not.toHaveProperty('abc');
			expect(next.blockValidation.def).toBeDefined();
		});

		it('is a no-op when the clientId has no entry', () => {
			const state = {
				...DEFAULT_STATE,
				blockValidation: { def: { mode: 'warning', issues: [] } },
			};
			const next = reducer(state, {
				type: CLEAR_BLOCK_VALIDATION,
				clientId: 'abc',
			});
			expect(next.blockValidation).toEqual(state.blockValidation);
		});
	});
});

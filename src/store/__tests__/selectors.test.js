/**
 * Internal dependencies
 */
import {
	getInvalidBlocks,
	getInvalidMeta,
	getInvalidEditorChecks,
	getBlockValidation,
	hasErrors,
	hasWarnings,
} from '../selectors';
import { DEFAULT_STATE, DEFAULT_BLOCK_RESULT } from '../constants';

function buildState(overrides = {}) {
	return { ...DEFAULT_STATE, ...overrides };
}

describe('core/validation selectors', () => {
	describe('getInvalidBlocks / getInvalidMeta / getInvalidEditorChecks', () => {
		it('returns the raw arrays from state', () => {
			const blocks = [{ clientId: 'a', mode: 'error', issues: [] }];
			const meta = [{ metaKey: 'seo', hasErrors: true, issues: [] }];
			const editor = [{ type: 'warning' }];
			const state = buildState({ blocks, meta, editor });

			expect(getInvalidBlocks(state)).toBe(blocks);
			expect(getInvalidMeta(state)).toBe(meta);
			expect(getInvalidEditorChecks(state)).toBe(editor);
		});

		it('returns empty arrays by default', () => {
			const state = buildState();
			expect(getInvalidBlocks(state)).toEqual([]);
			expect(getInvalidMeta(state)).toEqual([]);
			expect(getInvalidEditorChecks(state)).toEqual([]);
		});
	});

	describe('getBlockValidation', () => {
		it('returns the stored result for the given clientId', () => {
			const result = { mode: 'error', issues: [] };
			const state = buildState({ blockValidation: { abc: result } });
			expect(getBlockValidation(state, 'abc')).toBe(result);
		});

		it('returns DEFAULT_BLOCK_RESULT when no entry exists', () => {
			const state = buildState();
			expect(getBlockValidation(state, 'missing')).toBe(DEFAULT_BLOCK_RESULT);
		});
	});

	describe('hasErrors', () => {
		it('returns false when all scopes are empty', () => {
			expect(hasErrors(buildState())).toBe(false);
		});

		it('returns true when a block has mode error', () => {
			const state = buildState({
				blocks: [{ clientId: 'a', mode: 'error', issues: [] }],
			});
			expect(hasErrors(state)).toBe(true);
		});

		it('returns false when blocks only have warnings', () => {
			const state = buildState({
				blocks: [{ clientId: 'a', mode: 'warning', issues: [] }],
			});
			expect(hasErrors(state)).toBe(false);
		});

		it('returns true when a meta entry has hasErrors true', () => {
			const state = buildState({
				meta: [{ metaKey: 'seo', hasErrors: true, hasWarnings: false, issues: [] }],
			});
			expect(hasErrors(state)).toBe(true);
		});

		it('returns true when an editor issue has type error', () => {
			const state = buildState({ editor: [{ type: 'error' }] });
			expect(hasErrors(state)).toBe(true);
		});

		it('returns false when editor has only warning-type issues', () => {
			const state = buildState({ editor: [{ type: 'warning' }] });
			expect(hasErrors(state)).toBe(false);
		});
	});

	describe('hasWarnings', () => {
		it('returns false when all scopes are empty', () => {
			expect(hasWarnings(buildState())).toBe(false);
		});

		it('returns true when a block has mode warning and no errors exist', () => {
			const state = buildState({
				blocks: [{ clientId: 'a', mode: 'warning', issues: [] }],
			});
			expect(hasWarnings(state)).toBe(true);
		});

		it('returns false when an error also exists (errors take precedence)', () => {
			const state = buildState({
				blocks: [
					{ clientId: 'a', mode: 'warning', issues: [] },
					{ clientId: 'b', mode: 'error', issues: [] },
				],
			});
			expect(hasWarnings(state)).toBe(false);
		});

		it('returns true when a meta entry has only warnings', () => {
			const state = buildState({
				meta: [{ metaKey: 'seo', hasErrors: false, hasWarnings: true, issues: [] }],
			});
			expect(hasWarnings(state)).toBe(true);
		});

		it('ignores meta entries where hasErrors is also true', () => {
			const state = buildState({
				meta: [{ metaKey: 'seo', hasErrors: true, hasWarnings: true, issues: [] }],
			});
			// hasErrors short-circuits hasWarnings to false.
			expect(hasWarnings(state)).toBe(false);
		});

		it('returns true when an editor issue has type warning and no errors', () => {
			const state = buildState({ editor: [{ type: 'warning' }] });
			expect(hasWarnings(state)).toBe(true);
		});
	});
});

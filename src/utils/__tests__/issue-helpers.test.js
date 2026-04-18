/**
 * Internal dependencies
 */
import {
	filterIssuesByType,
	getErrors,
	getWarnings,
	hasErrors,
	hasWarnings,
	isCheckEnabled,
	createIssue,
	createValidationResult,
} from '../issue-helpers';

const errorIssue = { type: 'error', message: 'required' };
const warningIssue = { type: 'warning', message: 'suggested' };

describe('filterIssuesByType', () => {
	it('returns only issues matching the given type', () => {
		const result = filterIssuesByType([errorIssue, warningIssue, errorIssue], 'error');
		expect(result).toEqual([errorIssue, errorIssue]);
	});

	it('returns an empty array when no matches exist', () => {
		expect(filterIssuesByType([warningIssue], 'error')).toEqual([]);
	});

	it('returns an empty array for an empty input', () => {
		expect(filterIssuesByType([], 'error')).toEqual([]);
	});
});

describe('getErrors / getWarnings', () => {
	it('getErrors returns issues with type error', () => {
		expect(getErrors([errorIssue, warningIssue])).toEqual([errorIssue]);
	});

	it('getWarnings returns issues with type warning', () => {
		expect(getWarnings([errorIssue, warningIssue])).toEqual([warningIssue]);
	});
});

describe('hasErrors / hasWarnings (array versions)', () => {
	it('hasErrors is true when at least one error exists', () => {
		expect(hasErrors([warningIssue, errorIssue])).toBe(true);
	});

	it('hasErrors is false when no errors exist', () => {
		expect(hasErrors([warningIssue])).toBe(false);
	});

	it('hasErrors is false for empty arrays', () => {
		expect(hasErrors([])).toBe(false);
	});

	it('hasWarnings is true when at least one warning exists', () => {
		expect(hasWarnings([warningIssue])).toBe(true);
	});

	it('hasWarnings is false when no warnings exist', () => {
		expect(hasWarnings([errorIssue])).toBe(false);
	});
});

describe('isCheckEnabled', () => {
	it('returns false for null', () => {
		expect(isCheckEnabled(null)).toBe(false);
	});

	it('returns false for undefined', () => {
		expect(isCheckEnabled(undefined)).toBe(false);
	});

	it('returns false when enabled is explicitly false', () => {
		expect(isCheckEnabled({ enabled: false })).toBe(false);
	});

	it('returns true when enabled is explicitly true', () => {
		expect(isCheckEnabled({ enabled: true })).toBe(true);
	});

	it('returns true when enabled is absent (default)', () => {
		expect(isCheckEnabled({ level: 'error' })).toBe(true);
	});
});

describe('createIssue', () => {
	it('creates an issue with defaults when config is minimal', () => {
		const issue = createIssue({}, 'my_check');
		expect(issue).toMatchObject({
			check: 'my_check',
			checkName: 'my_check',
			type: 'error',
			priority: 1,
			message: '',
			errorMsg: '',
			warningMsg: '',
		});
	});

	it('pulls error_msg from PHP-style config', () => {
		const issue = createIssue({ error_msg: 'Alt text required' }, 'alt_text');
		expect(issue.errorMsg).toBe('Alt text required');
		expect(issue.warningMsg).toBe('Alt text required'); // warning falls back to error
	});

	it('pulls both error_msg and warning_msg when provided', () => {
		const issue = createIssue({ error_msg: 'Required', warning_msg: 'Recommended' }, 'check');
		expect(issue.errorMsg).toBe('Required');
		expect(issue.warningMsg).toBe('Recommended');
	});

	it('sets type from level and assigns matching priority (error=1)', () => {
		const issue = createIssue({ level: 'error' }, 'c');
		expect(issue.type).toBe('error');
		expect(issue.priority).toBe(1);
	});

	it('sets type from level and assigns matching priority (warning=2)', () => {
		const issue = createIssue({ level: 'warning' }, 'c');
		expect(issue.type).toBe('warning');
		expect(issue.priority).toBe(2);
	});

	it('assigns priority 3 for levels other than error/warning', () => {
		const issue = createIssue({ level: 'none' }, 'c');
		expect(issue.priority).toBe(3);
	});

	it('merges additional fields into the issue', () => {
		const issue = createIssue({}, 'c', { metaKey: 'seo' });
		expect(issue.metaKey).toBe('seo');
	});
});

describe('createValidationResult', () => {
	it('isValid is true for an empty issue list', () => {
		const result = createValidationResult([]);
		expect(result.isValid).toBe(true);
		expect(result.hasErrors).toBe(false);
		expect(result.hasWarnings).toBe(false);
		expect(result.issues).toEqual([]);
	});

	it('isValid is false when issues exist', () => {
		const result = createValidationResult([errorIssue]);
		expect(result.isValid).toBe(false);
		expect(result.hasErrors).toBe(true);
		expect(result.hasWarnings).toBe(false);
	});

	it('derives hasErrors and hasWarnings from the issues array', () => {
		const result = createValidationResult([errorIssue, warningIssue]);
		expect(result.hasErrors).toBe(true);
		expect(result.hasWarnings).toBe(true);
	});

	it('merges additional fields into the result', () => {
		const result = createValidationResult([], { clientId: 'abc', name: 'core/image' });
		expect(result.clientId).toBe('abc');
		expect(result.name).toBe('core/image');
	});
});

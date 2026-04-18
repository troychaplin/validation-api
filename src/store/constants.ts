/**
 * Store constants and types for the core/validation data store.
 *
 * This file is the first TypeScript module in the package. Type definitions
 * exported here describe the shapes consumed by selectors, actions, and
 * reducer. Other modules continue to run as JavaScript via babel-preset-
 * typescript; they benefit from the types when edited in a TS-aware editor
 * without requiring .ts migration themselves.
 */

export const STORE_NAME = 'core/validation';

export const SET_INVALID_BLOCKS = 'SET_INVALID_BLOCKS' as const;
export const SET_INVALID_META = 'SET_INVALID_META' as const;
export const SET_INVALID_EDITOR_CHECKS = 'SET_INVALID_EDITOR_CHECKS' as const;
export const SET_BLOCK_VALIDATION = 'SET_BLOCK_VALIDATION' as const;
export const CLEAR_BLOCK_VALIDATION = 'CLEAR_BLOCK_VALIDATION' as const;

/**
 * Severity mode for a block-level validation result.
 */
export type ValidationMode = 'error' | 'warning' | 'none';

/**
 * Severity type for an individual validation issue.
 */
export type IssueType = 'error' | 'warning';

/**
 * A single validation issue produced by `createIssue` in issue-helpers.
 *
 * `metaKey` is populated only for meta-scope issues.
 */
export interface ValidationIssue {
	check: string;
	checkName: string;
	type: IssueType;
	priority: number;
	message: string;
	errorMsg: string;
	warningMsg: string;
	metaKey?: string;
}

/**
 * Validation result for a single block. Produced by `validateBlock` and
 * stored per-clientId in `state.blockValidation`.
 */
export interface BlockValidationResult {
	mode: ValidationMode;
	issues: ValidationIssue[];
	isValid?: boolean;
	hasErrors?: boolean;
	hasWarnings?: boolean;
	clientId?: string;
	name?: string;
}

/**
 * Validation result for a single meta field. Produced by
 * `validateAllMetaChecks` and stored in `state.meta`.
 */
export interface MetaValidationResult {
	metaKey: string;
	isValid: boolean;
	hasErrors: boolean;
	hasWarnings: boolean;
	issues: ValidationIssue[];
}

/**
 * Top-level state shape for the `core/validation` store.
 */
export interface State {
	blocks: BlockValidationResult[];
	meta: MetaValidationResult[];
	editor: ValidationIssue[];
	blockValidation: Record<string, BlockValidationResult>;
}

export const DEFAULT_STATE: State = {
	blocks: [],
	meta: [],
	editor: [],
	blockValidation: {},
};

/**
 * Returned by `getBlockValidation` when no result has been dispatched for
 * a given clientId. Frozen so consumers can compare by reference.
 */
export const DEFAULT_BLOCK_RESULT: Readonly<BlockValidationResult> = Object.freeze({
	mode: 'none' as ValidationMode,
	issues: [],
});

/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store';
import {
	hasErrors as issueHasErrors,
	hasWarnings as issueHasWarnings,
	getEditorContext,
} from '../../shared/utils/validation';

/**
 * Validation API Component
 *
 * Central component that orchestrates validation across blocks, meta fields, and editor checks.
 * Manages post/template saving restrictions and body classes based on validation results. When
 * errors are detected, prevents saving/autosaving and disables the publish sidebar to ensure
 * content meets accessibility requirements before publication.
 *
 * Supports post editor contexts only:
 * - post-editor: Default post/page editing
 * - post-editor-template: Post/page editing with template visible
 *
 * This component doesn't render any UI but manages validation state and editor behavior.
 */
export function ValidationAPI() {
	// Get the editor context from editor settings
	const editorContext = getEditorContext();

	// Check if we're in a supported editor context (post editor only)
	const isValidContext =
		editorContext === 'post-editor' || editorContext === 'post-editor-template';

	// IMPORTANT: lockPostSaving/unlockPostSaving are ONLY in 'core/editor'
	const editorStore = 'core/editor';

	// Call useDispatch unconditionally (React Hook rules - must be before any early returns)
	const dispatch = useDispatch(editorStore);

	// Verify the store exists before using it
	const storeExists = wp.data && wp.data.select && wp.data.select(editorStore);

	// Read validation results from the centralized store
	const { invalidBlocks, invalidMeta, invalidEditorChecks } = useSelect(select => {
		const store = select(STORE_NAME);
		return {
			invalidBlocks: store.getInvalidBlocks(),
			invalidMeta: store.getInvalidMeta(),
			invalidEditorChecks: store.getInvalidEditorChecks(),
		};
	}, []);

	// Destructure functions - these exist in core/editor for both contexts
	const {
		lockPostSaving,
		unlockPostSaving,
		lockPostAutosaving,
		unlockPostAutosaving,
		disablePublishSidebar,
		enablePublishSidebar,
	} = dispatch || {};

	/**
	 * Manage post/template saving restrictions based on validation errors
	 *
	 * Monitors validation results from blocks, meta fields, and editor checks.
	 * When any errors are detected, locks both manual and automatic saving
	 * and disables the publish sidebar. This prevents publishing content with
	 * accessibility issues. When all errors are resolved, re-enables saving.
	 *
	 * Works in post editor contexts only.
	 */
	useEffect(() => {
		// Exit early if not in a supported context or store doesn't exist
		if (!isValidContext || editorContext === 'none' || !storeExists) {
			return;
		}

		// Verify we have the necessary dispatch functions
		if (!lockPostSaving || !unlockPostSaving) {
			return;
		}

		// Check for errors across all validation types
		const hasBlockErrors = invalidBlocks.some(block => block.mode === 'error');
		const hasMetaErrors = invalidMeta.some(meta => meta.hasErrors);
		const hasEditorErrors = issueHasErrors(invalidEditorChecks);

		// Lock saving if any validation errors exist
		if (hasBlockErrors || hasMetaErrors || hasEditorErrors) {
			lockPostSaving('core/validation');
			if (lockPostAutosaving) {
				lockPostAutosaving('core/validation');
			}
			if (disablePublishSidebar) {
				disablePublishSidebar();
			}
		} else {
			// Re-enable saving when all errors are resolved
			unlockPostSaving('core/validation');
			if (unlockPostAutosaving) {
				unlockPostAutosaving('core/validation');
			}
			if (enablePublishSidebar) {
				enablePublishSidebar();
			}
		}
	}, [
		invalidBlocks,
		invalidMeta,
		invalidEditorChecks,
		lockPostSaving,
		unlockPostSaving,
		lockPostAutosaving,
		unlockPostAutosaving,
		disablePublishSidebar,
		enablePublishSidebar,
		isValidContext,
		editorContext,
		storeExists,
	]);

	/**
	 * Manage body classes for validation state styling
	 *
	 * Adds CSS classes to the document body based on validation results from blocks,
	 * meta fields, and editor checks. These classes enable theme/plugin developers to
	 * style the editor interface based on validation state (e.g., highlighting
	 * areas with issues). Classes are removed when validation passes or component unmounts.
	 *
	 * Works in post editor contexts only.
	 */
	useEffect(() => {
		// Exit early if not in a supported context
		if (!isValidContext || editorContext === 'none') {
			return;
		}

		// Ensure document.body is available before manipulating classes
		if (!document.body) {
			return;
		}

		// Check for errors and warnings across all validation types
		const hasBlockErrors = invalidBlocks.some(block => block.mode === 'error');
		const hasBlockWarnings = invalidBlocks.some(block => block.mode === 'warning');
		const hasMetaErrors = invalidMeta.some(meta => meta.hasErrors);
		const hasMetaWarnings = invalidMeta.some(meta => meta.hasWarnings && !meta.hasErrors);
		const hasEditorErrors = issueHasErrors(invalidEditorChecks);
		const hasEditorWarnings = issueHasWarnings(invalidEditorChecks);

		// Check for overall errors first (blocks, meta, or editor)
		const hasAnyErrors = hasBlockErrors || hasMetaErrors || hasEditorErrors;

		// Check for overall warnings only if no errors exist
		const hasAnyWarnings =
			!hasAnyErrors && (hasBlockWarnings || hasMetaWarnings || hasEditorWarnings);

		// Apply error class if errors exist
		if (hasAnyErrors) {
			document.body.classList.add('has-validation-errors');
			document.body.classList.remove('has-validation-warnings');
		}
		// Apply warning class only if no errors but warnings exist
		else if (hasAnyWarnings) {
			document.body.classList.add('has-validation-warnings');
			document.body.classList.remove('has-validation-errors');
		}
		// Remove both classes if no issues
		else {
			document.body.classList.remove('has-validation-errors', 'has-validation-warnings');
		}

		// Cleanup: Remove classes when component unmounts
		return () => {
			if (document.body) {
				document.body.classList.remove('has-validation-errors', 'has-validation-warnings');
			}
		};
	}, [invalidBlocks, invalidMeta, invalidEditorChecks, isValidContext, editorContext]);

	// This component manages side effects only, no UI rendering
	return null;
}

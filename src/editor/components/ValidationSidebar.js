/**
 * WordPress dependencies
 */
import { PluginSidebar } from '@wordpress/editor';
import { PanelBody, PanelRow } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { getBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { ValidationIcon } from './ValidationIcon';
import { STORE_NAME } from '../store';
import { filterIssuesByType, getErrors, getWarnings } from '../../shared/utils/validation';

/**
 * Get display name for a block type
 *
 * Uses WordPress getBlockType to get the official block title, with fallback
 * to a formatted version of the block type name.
 *
 * @param {string} blockType - The block type (e.g., 'core/button').
 * @return {string} The display name for the block.
 */
function getBlockDisplayName(blockType) {
	const blockTypeInfo = getBlockType(blockType);
	if (blockTypeInfo && blockTypeInfo.title) {
		return blockTypeInfo.title;
	}

	// Fallback: format block type name
	const parts = blockType.split('/');
	const blockName = parts[1] || blockType;
	// Convert kebab-case to title case
	return blockName
		.split(/[-_]/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Deduplicate block issues by block type and message
 *
 * Groups issues by block type + message, collecting all clientIds that have
 * the same issue. Returns unique issues with block names and clientIds.
 *
 * @param {Array}  blocks   - Array of invalid block validation results.
 * @param {string} severity - The severity to filter by ('error' or 'warning').
 * @return {Array} Array of deduplicated issues with blockName, message, and clientIds.
 */
function deduplicateBlockIssues(blocks, severity) {
	const issueMap = new Map();

	blocks.forEach(block => {
		const issues =
			severity === 'error' ? getErrors(block.issues || []) : getWarnings(block.issues || []);

		issues.forEach(issue => {
			const message =
				severity === 'error' ? issue.errorMsg : issue.warningMsg || issue.errorMsg;
			const key = `${block.name}|${message}`;

			if (!issueMap.has(key)) {
				issueMap.set(key, {
					blockName: getBlockDisplayName(block.name),
					blockType: block.name,
					message,
					clientIds: [],
				});
			}

			// Add clientId if not already present
			if (block.clientId && !issueMap.get(key).clientIds.includes(block.clientId)) {
				issueMap.get(key).clientIds.push(block.clientId);
			}
		});
	});

	return Array.from(issueMap.values());
}

/**
 * Deduplicate meta issues by meta key and message
 *
 * Groups issues by meta key + message, returning unique issues.
 *
 * @param {Array}  metaArray - Array of invalid meta validation results.
 * @param {string} severity  - The severity to filter by ('error' or 'warning').
 * @return {Array} Array of deduplicated issues with metaKey and message.
 */
function deduplicateMetaIssues(metaArray, severity) {
	const issueMap = new Map();

	metaArray.forEach(meta => {
		const issues =
			severity === 'error' ? getErrors(meta.issues || []) : getWarnings(meta.issues || []);

		issues.forEach(issue => {
			const message =
				severity === 'error' ? issue.errorMsg : issue.warningMsg || issue.errorMsg;
			const key = `${meta.metaKey}|${message}`;

			if (!issueMap.has(key)) {
				issueMap.set(key, {
					metaKey: meta.metaKey,
					message,
				});
			}
		});
	});

	return Array.from(issueMap.values());
}

/**
 * Deduplicate editor issues by message
 *
 * Groups editor issues by message only, returning unique issues.
 *
 * @param {Array}  issues   - Array of editor validation issues.
 * @param {string} severity - The severity to filter by ('error' or 'warning').
 * @return {Array} Array of deduplicated issues with message.
 */
function deduplicateEditorIssues(issues, severity) {
	const issueMap = new Map();

	issues.forEach(issue => {
		const message = severity === 'error' ? issue.errorMsg : issue.warningMsg || issue.errorMsg;
		const key = message;

		if (!issueMap.has(key)) {
			issueMap.set(key, {
				message,
				description: issue.description,
			});
		}
	});

	return Array.from(issueMap.values());
}

/**
 * Unified Validation Sidebar Component
 *
 * Consolidates all validation issues from blocks, editor checks, and meta fields
 * into a single sidebar panel. Provides a comprehensive view of all accessibility
 * and validation issues in the current post, organized by severity (errors/warnings)
 * and source type. Users can click on issues to navigate directly to the relevant
 * block or field in the editor.
 *
 * The sidebar and its toolbar icon are only rendered when validation issues exist.
 * The icon color reflects the highest severity issue present (red for errors, yellow for warnings).
 */
export function ValidationSidebar() {
	// Read validation results from the centralized store
	const { invalidBlocks, invalidMeta, invalidEditorChecks } = useSelect(select => {
		const store = select(STORE_NAME);
		return {
			invalidBlocks: store.getInvalidBlocks(),
			invalidMeta: store.getInvalidMeta(),
			invalidEditorChecks: store.getInvalidEditorChecks(),
		};
	}, []);

	// Get dispatch function to select blocks when user clicks on issues
	const { selectBlock } = useDispatch('core/block-editor');

	// Ref to track scroll timeout for cleanup
	const scrollTimeoutRef = useRef(null);

	// Organize validation issues by type and severity for deduplication
	// Note: Pass all invalid blocks to deduplication functions, not just those with matching mode
	// A block can have both errors AND warnings in its issues array, even if mode is 'error'
	const editorErrors = filterIssuesByType(invalidEditorChecks, 'error');
	const editorWarnings = filterIssuesByType(invalidEditorChecks, 'warning');

	// Deduplicate issues by type and severity
	// Extract errors and warnings from all blocks, regardless of their mode
	const deduplicatedBlockErrors = deduplicateBlockIssues(invalidBlocks, 'error');
	const deduplicatedBlockWarnings = deduplicateBlockIssues(invalidBlocks, 'warning');
	// Extract errors and warnings from all meta, regardless of primary severity
	const deduplicatedMetaErrors = deduplicateMetaIssues(invalidMeta, 'error');
	const deduplicatedMetaWarnings = deduplicateMetaIssues(invalidMeta, 'warning');
	const deduplicatedEditorErrors = deduplicateEditorIssues(editorErrors, 'error');
	const deduplicatedEditorWarnings = deduplicateEditorIssues(editorWarnings, 'warning');

	// Calculate total counts across all validation sources (using deduplicated counts)
	const totalErrors =
		deduplicatedBlockErrors.length +
		deduplicatedMetaErrors.length +
		deduplicatedEditorErrors.length;
	const totalWarnings =
		deduplicatedBlockWarnings.length +
		deduplicatedMetaWarnings.length +
		deduplicatedEditorWarnings.length;

	// Set icon color based on highest severity issue (errors > warnings > none)
	let iconColor = 'currentColor';
	if (totalErrors > 0) {
		iconColor = '#d82000';
	} else if (totalWarnings > 0) {
		iconColor = '#dbc900';
	}

	// Icon that changes colour based on validation severity
	const sidebarIcon = <ValidationIcon fill={iconColor} />;

	/**
	 * Handle clicking on a block validation issue
	 *
	 * Selects the block in the editor and scrolls it into view. Uses multiple
	 * selector strategies to find the block element since WordPress block DOM
	 * structure can vary. Includes a delay to ensure block selection completes
	 * before attempting to scroll.
	 *
	 * @param {string} clientId - The unique client ID of the block to navigate to.
	 */
	const handleBlockClick = clientId => {
		if (!clientId) {
			return;
		}

		// Select the block in the editor (highlights it in the UI)
		selectBlock(clientId);

		// Clear any existing scroll timeout to prevent conflicts
		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current);
		}

		// Delay scroll to ensure block selection and DOM update complete
		scrollTimeoutRef.current = setTimeout(() => {
			// Try primary selector: standard block data attribute
			let blockElement = document.querySelector(`[data-block="${clientId}"]`);

			// Fallback: try with data-type attribute
			if (!blockElement) {
				blockElement = document.querySelector(`[data-type][data-block="${clientId}"]`);
			}

			// Fallback: try with WordPress block class
			if (!blockElement) {
				blockElement = document.querySelector(`.wp-block[data-block="${clientId}"]`);
			}

			// Scroll block into view if found
			if (blockElement) {
				blockElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
			}
		}, 100);
	};

	/**
	 * Cleanup scroll timeout on component unmount
	 *
	 * Prevents memory leaks by clearing any pending scroll timeouts when
	 * the component is unmounted or when the user navigates away.
	 */
	useEffect(() => {
		return () => {
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, []);

	// No issues — don't render the sidebar or its toolbar icon
	if (totalErrors === 0 && totalWarnings === 0) {
		return null;
	}

	return (
		<PluginSidebar
			name="validation-sidebar"
			title={__('Validation', 'validation-api')}
			icon={sidebarIcon}
			className="validation-api-validation-sidebar"
		>
			{/* Errors Panel: Displays all validation errors grouped by source type */}
			{totalErrors > 0 && (
				<PanelBody
					title={sprintf(
						/* translators: %d: number of errors */
						__('Errors (%d)', 'validation-api'),
						totalErrors
					)}
					initialOpen={true}
					className="validation-api-errors-panel"
				>
					{/* Block Errors: Deduplicated block validation issues */}
					{deduplicatedBlockErrors.length > 0 && (
						<PanelRow>
							<div className="validation-api-error-group">
								<p className="validation-api-error-subheading">
									{__('Block Issues', 'validation-api')}
								</p>
								<ul className="validation-api-error-list">
									{deduplicatedBlockErrors.map((issue, index) => {
										const count = issue.clientIds.length;
										const countDisplay = count > 1 ? ` (x${count})` : '';
										return (
											<li key={`block-error-${index}`}>
												<button
													type="button"
													className="validation-api-issue-link"
													onClick={() =>
														handleBlockClick(issue.clientIds[0])
													}
												>
													{issue.blockName}
												</button>
												: {issue.message}
												{countDisplay}
											</li>
										);
									})}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Meta Errors: Deduplicated meta field validation issues */}
					{deduplicatedMetaErrors.length > 0 && (
						<PanelRow>
							<div className="validation-api-error-group">
								<p className="validation-api-error-subheading">
									{__('Field Issues', 'validation-api')}
								</p>
								<ul className="validation-api-error-list">
									{deduplicatedMetaErrors.map((issue, index) => (
										<li key={`meta-error-${index}`}>{issue.message}</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Editor Errors: Deduplicated editor validation issues */}
					{deduplicatedEditorErrors.length > 0 && (
						<PanelRow>
							<div className="validation-api-error-group">
								<p className="validation-api-error-subheading">
									{__('Editor Issues', 'validation-api')}
								</p>
								<ul className="validation-api-error-list">
									{deduplicatedEditorErrors.map((issue, index) => (
										<li key={`editor-error-${index}`}>{issue.message}</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}
				</PanelBody>
			)}

			{/* Warnings Panel: Displays all validation warnings grouped by source type */}
			{totalWarnings > 0 && (
				<PanelBody
					title={sprintf(
						/* translators: %d: number of warnings */
						__('Warnings (%d)', 'validation-api'),
						totalWarnings
					)}
					initialOpen={true}
					className="validation-api-warnings-panel"
				>
					{/* Block Warnings: Deduplicated block validation warnings */}
					{deduplicatedBlockWarnings.length > 0 && (
						<PanelRow>
							<div className="validation-api-warning-group">
								<p className="validation-api-warning-subheading">
									{__('Block Issues', 'validation-api')}
								</p>
								<ul className="validation-api-warning-list">
									{deduplicatedBlockWarnings.map((issue, index) => {
										const count = issue.clientIds.length;
										const countDisplay = count > 1 ? ` (x${count})` : '';
										return (
											<li key={`block-warning-${index}`}>
												<button
													type="button"
													className="validation-api-issue-link"
													onClick={() =>
														handleBlockClick(issue.clientIds[0])
													}
												>
													{issue.blockName}
												</button>
												: {issue.message}
												{countDisplay}
											</li>
										);
									})}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Meta Warnings: Deduplicated meta field validation warnings */}
					{deduplicatedMetaWarnings.length > 0 && (
						<PanelRow>
							<div className="validation-api-warning-group">
								<p className="validation-api-warning-subheading">
									{__('Field Issues', 'validation-api')}
								</p>
								<ul className="validation-api-warning-list">
									{deduplicatedMetaWarnings.map((issue, index) => (
										<li key={`meta-warning-${index}`}>{issue.message}</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Editor Warnings: Deduplicated editor validation warnings */}
					{deduplicatedEditorWarnings.length > 0 && (
						<PanelRow>
							<div className="validation-api-warning-group">
								<p className="validation-api-warning-subheading">
									{__('Editor Issues', 'validation-api')}
								</p>
								<ul className="validation-api-warning-list">
									{deduplicatedEditorWarnings.map((issue, index) => (
										<li key={`editor-warning-${index}`}>{issue.message}</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}
				</PanelBody>
			)}
		</PluginSidebar>
	);
}

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { ToolbarButton, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ValidationIcon } from './ValidationIcon';
import { hasErrors, getErrors, getWarnings } from '../../shared/utils/validation';

/**
 * Validation Toolbar Button
 *
 * Renders a button in the block toolbar that opens a modal displaying
 * all validation issues grouped by severity. The button icon color
 * reflects the highest severity level (red for errors, yellow for warnings).
 *
 * @param {Object}        props        - The component props.
 * @param {Array<Object>} props.issues - Array of validation issues to display.
 */
export function ValidationToolbarButton({ issues }) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	if (!issues || issues.length === 0) {
		return null;
	}

	const hasBlockErrors = hasErrors(issues);
	const errors = getErrors(issues);
	const warnings = getWarnings(issues);

	const icon = hasBlockErrors ? (
		<ValidationIcon fill="#d82000" />
	) : (
		<ValidationIcon fill="#d8c600" />
	);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	return (
		<>
			<ToolbarButton
				icon={icon}
				onClick={openModal}
				label={__('View block issues or concerns', 'validation-api')}
				className="validation-api-toolbar-button"
				isCompact
			/>
			{isModalOpen && (
				<Modal
					title={__('Issues or Concerns', 'validation-api')}
					onRequestClose={closeModal}
					className="validation-api-block-indicator-modal"
				>
					<div className="validation-api-indicator-modal-content">
						{errors.length > 0 && (
							<div className="validation-api-indicator-section validation-api-indicator-errors">
								<h2 className="validation-api-indicator-section-title">
									<span className="validation-api-indicator-section-title-circle"></span>
									{__('Errors', 'validation-api')}
								</h2>
								<ul>
									{errors.map((issue, index) => (
										<li key={`error-${index}`}>{issue.error_msg}</li>
									))}
								</ul>
							</div>
						)}

						{warnings.length > 0 && (
							<div className="validation-api-indicator-section validation-api-indicator-warnings">
								<h2 className="validation-api-indicator-section-title">
									<span className="validation-api-indicator-section-title-circle"></span>
									{__('Warnings', 'validation-api')}
								</h2>
								<ul>
									{warnings.map((warning, index) => (
										<li key={`warning-${index}`}>
											{warning.warning_msg || warning.error_msg}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</Modal>
			)}
		</>
	);
}

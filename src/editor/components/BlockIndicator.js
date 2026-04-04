/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ValidationIcon } from './ValidationIcon';
import { hasErrors, getErrors, getWarnings } from '../../shared/utils/validation';

/**
 * Block Indicator Component
 *
 * Displays a visual indicator icon in the upper-left corner of blocks with
 * validation issues. The indicator shows an error or warning icon based on
 * issue severity. Clicking the indicator opens a modal displaying all
 * validation issues grouped by type and category.
 *
 * @param {Object}        props        - The component props.
 * @param {Array<Object>} props.issues - Array of validation issues to display.
 */
export function BlockIndicator({ issues }) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Don't render indicator if there are no issues
	if (!issues || issues.length === 0) {
		return null;
	}

	// Check issue severity to determine which icon to display
	const hasBlockErrors = hasErrors(issues);

	// Separate issues by severity type
	const errors = getErrors(issues);
	const warnings = getWarnings(issues);

	// Set icon and CSS classes based on severity (errors take precedence)
	const icon = hasBlockErrors ? (
		<ValidationIcon fill="#d82000" />
	) : (
		<ValidationIcon fill="#dbc900" />
	);
	const className = hasBlockErrors
		? 'validation-api-block-indicator validation-api-block-indicator--error'
		: 'validation-api-block-indicator validation-api-block-indicator--warning';

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	return (
		<>
			<div className={className}>
				<Button
					icon={icon}
					onClick={openModal}
					className="validation-api-block-indicator-button"
					aria-label={__('View block issues or concerns', 'validation-api')}
				/>
			</div>
			{isModalOpen && (
				<Modal
					title={__('Issues or Concerns', 'validation-api')}
					onRequestClose={closeModal}
					className="validation-api-block-indicator-modal"
				>
					<div className="validation-api-indicator-modal-content">
						{/* Errors Section */}
						{errors.length > 0 && (
							<div className="validation-api-indicator-section validation-api-indicator-errors">
								<p>
									<strong className="validation-api-indicator-section-title">
										<span className="validation-api-indicator-section-title-circle"></span>
										{__('Errors', 'validation-api')}
									</strong>
								</p>
								<ul>
									{errors.map((issue, index) => (
										<li key={`error-${index}`}>{issue.error_msg}</li>
									))}
								</ul>
							</div>
						)}

						{/* Warnings Section */}
						{warnings.length > 0 && (
							<div className="validation-api-indicator-section validation-api-indicator-warnings">
								<p>
									<strong className="validation-api-indicator-section-title">
										<span className="validation-api-indicator-section-title-circle"></span>
										{__('Warnings', 'validation-api')}
									</strong>
								</p>
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

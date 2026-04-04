/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	GetInvalidBlocks,
	GetInvalidMeta,
	GetInvalidEditorChecks,
} from '../../shared/utils/validation';
import { STORE_NAME } from '../store';

/**
 * Validation Provider Component
 *
 * Renderless component that computes validation state from the three core hooks
 * and dispatches the results into the validation-api data store. This is the
 * single place where validation is computed — all other consumers read from
 * the store via selectors.
 */
export function ValidationProvider() {
	const invalidBlocks = GetInvalidBlocks();
	const invalidMeta = GetInvalidMeta();
	const invalidEditorChecks = GetInvalidEditorChecks();

	const { setInvalidBlocks, setInvalidMeta, setInvalidEditorChecks } = useDispatch(STORE_NAME);

	useEffect(() => {
		setInvalidBlocks(invalidBlocks);
	}, [invalidBlocks, setInvalidBlocks]);

	useEffect(() => {
		setInvalidMeta(invalidMeta);
	}, [invalidMeta, setInvalidMeta]);

	useEffect(() => {
		setInvalidEditorChecks(invalidEditorChecks);
	}, [invalidEditorChecks, setInvalidEditorChecks]);

	return null;
}

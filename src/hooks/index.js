/**
 * Side-effect imports. Each module registers a filter, slot, or plugin at
 * import time; nothing here is re-exported.
 *
 * Note: `use-validation-sync` and `use-validation-lifecycle` are React
 * hooks (not side-effect modules), so they are NOT imported here — they
 * are invoked by the `ValidationPlugin` component in `register-sidebar.js`.
 */

import './register-sidebar';
import './validate-block';
import './block-validation-classes';
import './pre-save-validation';

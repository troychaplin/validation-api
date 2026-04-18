# Pass C — Leanness Review

Review of the Validation API plugin for deletion and collapse candidates. Pass A (conventions) and Pass B (architecture) are done. Pass C asks: what can go away without changing behavior, and what can collapse with equivalent behavior?

## Status

- [x] Review complete
- [x] Action items folded into `pass-a.md` (Batches 1, 4, 5)
- [ ] Execution (awaits consolidated plan)

## Scope of Pass C

| Area examined | Verdict |
|---|---|
| `Meta\Validator` class | **DELETE** (C-1) |
| `Contracts/CheckProvider` interface | **DELETE** (C-2) |
| Dead `Block\Registry` methods (`unregister_check`, `set_check_enabled`) | **DELETE** (C-3) |
| Undocumented lifecycle hooks tied to deleted methods | **DELETE** (C-4) |
| `Editor\Registry::register_editor_check_for_post_types()` | **DELETE** (C-5) |
| `EditorDetection::get_current_screen()` fallback | **DELETE** (C-6) |
| `Core/I18n.php` | **DELETE + inline** (C-7, already in Pass A Batch 3) |
| Registry duplication | **Extract abstract base class** (C-8, new Batch 5) |
| `useValidationIssues()` hook extraction | **ADD** (C-9, absorbed into Batch 1) |
| `useMetaField` dual `useSelect` consolidation | **CONSOLIDATE** (C-10, absorbed into Batch 1) |
| `filterIssuesByType` helper | KEEP (C-11, too marginal to inline) |
| `getValidationConfig` wrapper layer | KEEP (C-12, earns its file) |
| `Logger` trait | KEEP (28 active call sites) |
| `useDebouncedValidation` hook | KEEP (custom "immediate + debounce" not in `@wordpress/compose`) |
| Plugin init chain | KEEP (no no-op steps) |
| Styles | KEEP (no orphaned stylesheets) |

## Reference sources

- Full code audit of `/Users/troychaplin/Develop/wp-projects/validation-api/wp-content/plugins/validation-api/includes/` and `src/`
- Workspace-wide grep for consumers of each candidate (all three plugins: core, settings addon, integration example)
- Documentation audit of `docs/guide/`, `docs/technical/` for public-API contracts

---

## Findings

### C-1: Delete `Meta\Validator` class (109 LOC)

**File:** `includes/Meta/Validator.php`

**What it provides:** One static method `Validator::required()` returning a closure usable as `register_post_meta( ..., 'validate_callback' => Validator::required(...) )`.

**Consumer audit:**

```
grep -r "Meta\\Validator\|Meta::Validator" wp-content/plugins/  → 0 external hits
grep -r "Validator::required" wp-content/plugins/                → 0 hits outside Validator.php
```

- Not used by core plugin
- Not used by integration example
- Not used by settings addon
- Not referenced in `docs/guide/`

**Why to delete:** WordPress's native `register_post_meta( ..., 'validate_callback' )` pattern does the same thing with no helper needed. The 109 LOC solves a non-existent problem.

**Action:** Delete the file. Remove any stale doc references.

**Risk:** Very low. No consumers.

---

### C-2: Delete `Contracts/CheckProvider` interface (47 LOC)

**File:** `includes/Contracts/CheckProvider.php`

```
grep -r "implements CheckProvider"  → 0 hits
grep -r "Contracts\\CheckProvider"  → only in docs/guide/check-providers.md
```

**Why to delete:** Added speculatively for class-based registration. No one adopted it. Can be reintroduced in v1.1 if demand appears.

**Action:** Delete the file; delete (or update) `docs/guide/check-providers.md`; remove the `includes/Contracts/` directory if it becomes empty.

**Risk:** Very low.

---

### C-3 & C-4: Delete dead `Block\Registry` methods and their orphaned hooks

**Methods to delete:**
- `Block\Registry::unregister_check()` — 17 LOC, never called
- `Block\Registry::set_check_enabled()` — 12 LOC, never called

**Actions fired only by these methods:**
- `wp_validation_check_unregistered` — no doc entry, no consumer
- `wp_validation_check_toggled` — no doc entry, no consumer

**Consumer audit:**

```
grep -r "unregister_check\|set_check_enabled"  → 0 hits outside Block/Registry.php
grep -r "wp_validation_check_unregistered\|wp_validation_check_toggled"  → only in Block/Registry.php definition
```

**Lifecycle actions that stay** (documented in `docs/technical/hooks.md`, part of declared public API):
- `wp_validation_initialized`
- `wp_validation_ready`
- `wp_validation_editor_checks_ready`
- `wp_validation_check_registered`

**Filter hooks that stay:**
- `wp_validation_check_args` (documented)
- `wp_validation_should_register_check` (documented)
- `wp_validation_check_level` (actively consumed by settings addon)

**Action:** Delete both methods + both actions. Keep all other lifecycle hooks.

**Risk:** Very low.

---

### C-5: Delete `Editor\Registry::register_editor_check_for_post_types()` (9 LOC)

**Consumer audit:**

```
grep -r "register_editor_check_for_post_types"  → 0 hits outside Editor/Registry.php
```

Bulk-convenience helper that loops `register_editor_check()` over an array of post types. Never called. Users who need the pattern can write a `foreach` in three lines.

**Action:** Delete the method.

**Risk:** Very low.

---

### C-6: Delete `EditorDetection::get_current_screen()` fallback (8 LOC)

**File:** `includes/Core/Traits/EditorDetection.php`

Inside `get_editor_context()`, after the `$pagenow === 'post.php' || 'post-new.php'` branch and its post-type resolution, there's a fallback:

```php
if ( function_exists( 'get_current_screen' ) ) {
    $current_screen = \get_current_screen();
    if ( $current_screen && isset( $current_screen->post_type ) ) {
        if ( ! in_array( $current_screen->post_type, $this->get_site_editor_post_types(), true ) ) {
            return 'post-editor';
        }
    }
}
```

**Why it's unreachable:** `$GLOBALS['pagenow']` is set by WP for every admin page. If `$pagenow` is neither `post.php` nor `post-new.php`, we're not in the post editor. The `get_current_screen()` fallback adds nothing.

**Pass B context:** Pass B confirmed the trait's overall role is correct (no Gutenberg helper replaces it). Pass C trims the internals.

**Action:** Delete the fallback block.

**Risk:** Very low. Even in the edge case where `$pagenow` isn't set (e.g., custom CLI contexts), the function returning `'none'` is the safe default.

---

### C-7: `Core/I18n.php` — delete and inline (58 LOC)

**Already planned:** Pass A Batch 3 calls for this. Pass C confirms it's correct.

**File summary:** 58 LOC class with a constructor storing two values and one method calling `wp_set_script_translations()`.

**Action:** Delete class. Inline the one `wp_set_script_translations()` call in `Core/Assets.php` at the enqueue site.

**Risk:** None.

---

### C-8: Extract `AbstractValidationRegistry` base class (~115 LOC saved)

**Pass A context:** Pass A recommended "collapse three registries into one parameterized class." Pass C refines this based on concrete audit of the three files.

**Current LOC:**
- `Block\Registry` — 300 LOC
- `Meta\Registry` — 240 LOC
- `Editor\Registry` — 244 LOC
- **Total: 784 LOC**

**Duplicated code across all three (identical or near-identical):**

1. Defaults + `wp_parse_args` (~10 LOC × 3):
   ```php
   $defaults = array(
       'error_msg'    => '',
       'warning_msg'  => '',
       'level'        => 'error',
       'priority'     => 10,
       'enabled'      => true,
       'description'  => '',
       'configurable' => true,
   );
   $check_args = \wp_parse_args( $check_args, $defaults );
   ```

2. Required-field validation (~8 LOC × 3)

3. Level validation (~8 LOC × 3):
   ```php
   $valid_levels = array( 'error', 'warning', 'none' );
   if ( ! in_array( $check_args['level'], $valid_levels, true ) ) { ... }
   ```

4. `warning_msg` fallback to `error_msg` (~3 LOC × 3)

5. Namespace stamping (`_namespace` internal key) (~5 LOC × 3)

6. Priority sort via `uasort` (~3 LOC × 3)

**Why full collapse is wrong:**

- `Meta\Registry` has 3-level storage (`[post_type][meta_key][check_name]`) vs 2-level for Block/Editor
- Scope-specific methods (`get_registered_block_types` on Block only)
- Different hook-name suffixes per scope

**Right approach — abstract base class:**

```
ValidationAPI\AbstractRegistry (new, ~100 LOC)
├── normalize_args( $args ): array
├── validate_required_args( $args, $required ): bool
├── stamp_namespace( $args ): array
├── sort_by_priority( &$checks ): void
└── uses Logger trait

Block\Registry extends AbstractRegistry (~200 LOC)
Meta\Registry extends AbstractRegistry (~180 LOC)
Editor\Registry extends AbstractRegistry (~190 LOC)
```

**After extraction:**
- Total LOC: ~670 (from 784)
- Saved: ~115 LOC
- Public API unchanged
- Singleton pattern preserved

**Action:** New Batch 5. Checklist in `pass-a.md`.

**Risk:** Medium. Requires careful behavior parity verification across all three scopes.

---

### C-9: Extract `useValidationIssues()` hook (saves ~10 LOC)

**Duplicated block** in two files (14 LOC total):

```js
// ValidationAPI.js and ValidationSidebar.js, identical:
const { invalidBlocks, invalidMeta, invalidEditorChecks } = useSelect( ( select ) => {
  const store = select( STORE_NAME );
  return {
    invalidBlocks: store.getInvalidBlocks(),
    invalidMeta: store.getInvalidMeta(),
    invalidEditorChecks: store.getInvalidEditorChecks(),
  };
}, [] );
```

**Consolidation:**

```js
// src/utils/use-validation-issues.js
export function useValidationIssues() {
  return useSelect( ( select ) => {
    const store = select( validationStore );
    return {
      invalidBlocks: store.getInvalidBlocks(),
      invalidMeta: store.getInvalidMeta(),
      invalidEditorChecks: store.getInvalidEditorChecks(),
    };
  }, [] );
}
```

Both call sites become:

```js
const { invalidBlocks, invalidMeta, invalidEditorChecks } = useValidationIssues();
```

**Action:** Fold into Batch 1 (both consumers are already moving).

**Risk:** Low.

---

### C-10: Consolidate dual `useSelect` in `useMetaField` (saves ~12 LOC)

**Current:** `useMetaField` calls `useMetaValidation()` (which has its own `useSelect`) AND does a separate `useSelect` for the meta value. Same component fetches from the editor store twice.

**Fix:** Single `useSelect` reads both meta value and validation-derived state in one pass.

**Action:** Fold into Batch 1 (file is already moving to `src/utils/use-meta-field.js`).

**Risk:** Low.

---

### C-11: `filterIssuesByType` — skip

**Helper:** `issues => issues.filter( i => i.type === type )` — 3 LOC, called 4 times.

**Inlining savings:** 3 LOC total. Not worth disrupting the helper's existence.

**Action:** None.

---

### C-12: `getValidationConfig` wrapper layer — skip

**Analysis:** Five named exports (`getValidationRules`, `getMetaValidationRules`, `getEditorValidationRules`, `getEditorContext`, `getRegisteredBlockTypes`) each doing one line of editor-settings access. Collapsing saves ~30 LOC but forces call sites to nested property access.

**Verdict:** Named exports are self-documenting; the 30 LOC is earning its keep.

**Action:** None.

---

## Items KEPT after Pass C — do not change

| Item | Reason |
|---|---|
| `Core/Traits/Logger` | 28 active call sites; debug consistency valuable |
| `getValidationConfig.js` | Named exports earn their file |
| `useDebouncedValidation` | Custom "immediate + debounce" behavior not in `@wordpress/compose` |
| HOC files (`withErrorHandling`, `withBlockValidationClasses`) | Already minimal |
| Store selectors/actions | All 11 exports used |
| Reducer | All action types have corresponding creators |
| Plugin initialization chain | No no-op steps |
| Styles | All stylesheets correspond to live components |
| `Meta\hooks\useMetaField` / `useMetaValidation` | Actively consumed by integration example |
| Lifecycle hooks (the 4 kept + 3 filters) | Documented public API |

---

## Summary table

| Item | Current LOC | Action | LOC saved | Risk | Batch |
|---|---|---|---|---|---|
| `Meta\Validator` class | 109 | DELETE | 109 | Very low | 4 |
| `Core/I18n.php` | 58 | DELETE + inline | 58 | Very low | 3 (Pass A) |
| `Contracts/CheckProvider` interface | 47 | DELETE | 47 | Very low | 4 |
| `Block\Registry::unregister_check()` | 17 | DELETE | 17 | Very low | 4 |
| `Block\Registry::set_check_enabled()` | 12 | DELETE | 12 | Very low | 4 |
| `Editor\Registry::register_editor_check_for_post_types()` | 9 | DELETE | 9 | Very low | 4 |
| `EditorDetection` `get_current_screen()` fallback | 8 | DELETE | 8 | Very low | 4 |
| `wp_validation_check_unregistered` action | coupled | DELETE | 0 extra | Very low | 4 |
| `wp_validation_check_toggled` action | coupled | DELETE | 0 extra | Very low | 4 |
| Registry shared logic (AbstractRegistry extraction) | ~60 duplicated × 3 | EXTRACT base class | ~115 | Medium | 5 |
| `useValidationIssues()` extraction | 14 duplicated | EXTRACT hook | ~10 | Low | 1 |
| `useMetaField` dual `useSelect` | 12 | CONSOLIDATE | ~12 | Low | 1 |

**Totals:**
- PHP deletions (Batch 4): ~260 LOC
- PHP collapse (Batch 5): ~115 LOC
- JS absorbed into Batch 1: ~22 LOC
- I18n (Batch 3): 58 LOC
- **Grand total: ~455 LOC** (~11% of ~4,000 LOC codebase)

## Notes

- No dead code found in JS. No TODO/FIXME/XXX comments, no commented-out blocks, no console.log leftovers. JS codebase is already tight.
- No dead code found in PHP either. Deletions are of unused-but-well-written public API surfaces, not neglected code.
- Both the deletions and the registry extraction are reversible — if a consumer later emerges, reintroduction is straightforward.

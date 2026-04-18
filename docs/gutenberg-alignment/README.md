# Gutenberg Alignment

Planning docs for aligning the Validation API plugin with current Gutenberg conventions, in preparation for a potential core-merge proposal. These are planning artifacts — not active implementation yet.

## Read in this order

1. **[consolidated-plan.md](consolidated-plan.md)** — Start here. The authoritative execution plan: five batches, order, acceptance criteria, verification steps.
2. **[pass-a.md](pass-a.md)** — Convention & alignment findings. Contains the full checklist for every batch.
3. **[pass-b.md](pass-b.md)** — Architectural review. Explains why `ValidationProvider` + `ValidationAPI` convert to hooks and why `editor.preSavePost` gets added.
4. **[pass-c.md](pass-c.md)** — Leanness review. Explains the ~375 LOC of deletable PHP.
5. **[core-pr-migration.md](core-pr-migration.md)** — Deferred items. Activate only when all NOW-batches ship and a core PR is being cut.

## Scope

| Document | Covers | Status |
|---|---|---|
| `pass-a.md` | Naming, file layout, style, REST namespace, package-ready src/ layout | Complete |
| `pass-b.md` | Renderless components vs hooks, SlotFills, `registerPlugin`, save-locking pattern, REST permissions | Complete |
| `pass-c.md` | Dead code, duplication, abstraction cost/benefit | Complete |
| `consolidated-plan.md` | Batch sequencing, acceptance criteria, manual verification | Complete |
| `core-pr-migration.md` | PSR-4 → WP-core style, text domain, `@since`, sidebar mount, CSS prefix | Complete (dormant until PR) |

## NOW vs. deferred

- **NOW batches** (in `consolidated-plan.md` + `pass-a.md`) preserve standalone-plugin viability. No public API breaking changes except the REST namespace (coordinated with the only consumer, the settings addon).
- **Deferred migrations** (in `core-pr-migration.md`) would break standalone functionality and only make sense when translating the plugin into core-style PHP/JS. Activate when cutting the actual core PR.

## Ownership context

User owns all three related plugins (`validation-api`, `validation-api-settings`, `validation-api-integration-example`). No backward-compat concerns apply to internal consumers; coordinated changes across all three are acceptable.

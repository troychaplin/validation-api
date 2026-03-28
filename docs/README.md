# Validation API Documentation

## Developer Guide

For plugin authors integrating with the Validation API.

- **[Getting Started](guide/README.md)** — Register your first check in 30 lines
- **[Block Checks](guide/block-checks.md)** — Validate block attributes (alt text, links, required fields)
- **[Meta Checks](guide/meta-checks.md)** — Validate post meta fields with server-side enforcement
- **[Editor Checks](guide/editor-checks.md)** — Validate document-level concerns (heading hierarchy, content structure)
- **[Severity Model](guide/severity.md)** — Error vs. warning vs. none, and how to override levels at runtime
- **[CheckProvider Pattern](guide/check-providers.md)** — Class-based registration for enterprise-scale plugins
- **[Examples](guide/examples.md)** — Complete integration examples and common recipes

## Technical Reference

For contributors and the WordPress core team reviewing this plugin.

- **[Architecture](technical/README.md)** — System design, registries, coordinator, and UI components
- **[Data Flow](technical/data-flow.md)** — How checks move from PHP registration through to JS validation and UI
- **[Hooks Reference](technical/hooks.md)** — Every PHP action/filter and JS filter with signatures
- **[API Reference](technical/api.md)** — All public functions, registry methods, and contracts
- **[Companion Package](technical/companion-package.md)** — Settings companion architecture and the filter bridge
- **[Design Decisions](technical/decisions.md)** — Why the API is shaped the way it is

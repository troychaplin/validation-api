# Validation API Documentation

## Start here

- **[PR-READINESS.md](PR-READINESS.md)** — Where is this plugin on the road to a Gutenberg core PR? Start here if you're resuming the work or picking it up fresh.

## Developer Guide

For plugin authors integrating with the Validation API.

- **[Getting Started](guide/README.md)** — Register your first check in 30 lines
- **[Block Checks](guide/block-checks.md)** — Validate block attributes (alt text, links, required fields)
- **[Meta Checks](guide/meta-checks.md)** — Validate post meta fields with server-side enforcement
- **[Editor Checks](guide/editor-checks.md)** — Validate document-level concerns (heading hierarchy, content structure)
- **[Severity Model](guide/severity.md)** — Error vs. warning vs. none, and how to override levels at runtime
- **[Examples](guide/examples.md)** — Complete integration examples and common recipes
- **[Troubleshooting](guide/troubleshooting.md)** — Common issues and how to diagnose them

## Technical Reference

For contributors and the WordPress core team reviewing this plugin.

- **[Architecture](technical/README.md)** — System design, registries, data store, hooks layer, UI components
- **[Data Flow](technical/data-flow.md)** — How checks move from PHP registration through to JS validation and UI
- **[Hooks Reference](technical/hooks.md)** — Every PHP action/filter and JS filter with signatures
- **[API Reference](technical/api.md)** — All public registration functions and registry methods
- **[Companion Package](technical/companion-package.md)** — Settings companion architecture and the filter bridge
- **[Design Decisions](technical/decisions.md)** — Why the API is shaped the way it is

## Core-merge proposal

For the Gutenberg core team.

- **[PROPOSAL.md](PROPOSAL.md)** — RFC-style case for adopting this framework into Gutenberg core
- **[INTEGRATION.md](INTEGRATION.md)** — Gutenberg landscape, component mapping, four-phase contribution plan
- **[gutenberg-alignment/](gutenberg-alignment/README.md)** — Execution record of the alignment work and checklist for the actual PR

## Working notes

- **[TODO.md](TODO.md)** — Active to-do list (testing gaps, perf benchmarks, future features)

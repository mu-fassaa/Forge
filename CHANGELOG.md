# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2026-07-08

### Added
- **Start Graph Node**: Created a visual `StartNode` canvas component acting as the graph execution entry point.
- **Single Start Node Enforcement**: Restricted canvas additions to a single Start node per graph, blocking duplicates and throwing warning toast alerts.
- **Atomic Choice Synchronization**: Linked dynamic choice output ports to internal node payload `data.choices` list.
- **Dialogue Simulator (Previewer)**: Stateful preview sandbox executing dialogue nodes, picking branch paths, and tracking variables state live.
- **Visual Validation Engine**: Implemented checking algorithms for unreachable nodes, disconnected choices, missing starts, and infinite loops, rendering alert badges directly on nodes.
- **Relational JSON Compiler**: Integrated a standalone relational compiler utility. Exposes compiled graphs to exporter targets.

## [0.2.1] - 2026-07-08

### Added
- **Core Manifesto (`MANIFESTO.md`)**: Declared five core design principles for Forge: Engine-agnostic, Plugin-first, Human-readable formats, Extensible before optimized, and Consistency over complexity.
- **Technical Specifications Directory (`docs/`)**: Created visions, architecture specs, node schemas, workspace lifecycle details, project file formatting specs, and design system guidelines.

## [0.2.0] - 2026-07-08

### Added
- **Save System & Project Metadata**: Implemented dynamic localStorage save and load integration with dynamic metadata attributes (name, version, creation timestamp, last saved timestamp).
- **Unsaved Changes Indicator**: Added a visual glowing indicator in the header bar representing dirty edit state.
- **Autosave Routine**: Added background debounced autosave trigger executing automatically every 15 seconds on dirty workspaces.
- **Undo/Redo History Stacks**: Implemented timeline and snapshot-based past/future stacks for full canvas state rollback support.
- **Workspace Prefs & Settings Modal**: Added custom settings controls for Light/Dark themes, snap-to-grid controls, visual background grid layout toggle, and localization selector.
- **Publish Pipeline Modal**: Built step-by-step validator and build compiler animations with progress tracking.
- **User profile Menu**: Profile popover overlay providing access to account license status and about menus.
- **Internal Documentation**: Built native guide page documenting Forge structure, shortcuts cheatsheet, and loader examples for Godot (GDScript).

## [0.1.0] - 2026-07-08

### Added
- **Core Node Registry**: Centralized `nodeRegistry` for modular node configuration.
- **Inspector Panel**: Sidebar component to edit node data dynamically.
- **Dynamic Output Ports**: `PortListEditor` component for creating and editing ports dynamically (e.g., dialogue choices).
- **Generic Node Types**: Completed migration of Dialogue, Condition, Event, Variable, and End nodes into the new registry and inspector system.
- **Reactive Handle Recalculation**: Wrapped React Flow handles with `useUpdateNodeInternals` to ensure proper positioning of dynamic ports.
- **Multi-Port JSON Export**: Godot-compatible relational JSON export containing `choices` branching mappings.

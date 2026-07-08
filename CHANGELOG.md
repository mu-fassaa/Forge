# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-07-08

### Added
- **Core Node Registry**: Centralized `nodeRegistry` for modular node configuration.
- **Inspector Panel**: Sidebar component to edit node data dynamically.
- **Dynamic Output Ports**: `PortListEditor` component for creating and editing ports dynamically (e.g., dialogue choices).
- **Generic Node Types**: Completed migration of Dialogue, Condition, Event, Variable, and End nodes into the new registry and inspector system.
- **Reactive Handle Recalculation**: Wrapped React Flow handles with `useUpdateNodeInternals` to ensure proper positioning of dynamic ports.
- **Multi-Port JSON Export**: Godot-compatible relational JSON export containing `choices` branching mappings.

# Forge Development Roadmap

This document outlines development roadmap goals structured by Milestones.

---

## Milestone 1: Core Registry & Custom Nodes (Completed)
- Centralized node registry for side-effect registrations.
- Unification of Dialogue, Condition, Event, Variable, and End nodes.
- Integrated dynamic output handles with React Flow internals.

## Milestone 2: Workspace Foundation (Completed)
- Local save/load state routines.
- Unsaved changes indicator and debounced background autosave.
- Undo/redo snapshot history timeline logging.
- Global Toast Notifications.
- Project preferences dialog.

## Milestone 3: Dialogue Plugin Complete (Completed)
- Start & End visual nodes implementation.
- Enforced single Start node constraint per graph canvas.
- Dynamic data.choices synchronization inside Dialogue Inspector.
- Visual validation engine rendering warning alert indicators on nodes.
- Full interactive Dialogue Simulator preview sandbox.
- Relational JSON Compiler module.

## Milestone 4: File System & Local Assets (Planned)
- Physical file management (opening/writing `.forge` extensions).
- Drag-and-drop file import routines.
- Asset database crawler mapping game assets (sprites, audios) directly into node selectors.

## Milestone 5: Variable Database & Nodes (Planned)
- Central variable manager interface.
- Dropdown autocomplete selectors for condition/variable nodes based on registered variable keys.

## Milestone 6: Visual Graph Refinements (Future Vision)
- Graph layout auto-formatting algorithms.
- Custom edge routing styles.
- Group nodes / sub-graphs support.

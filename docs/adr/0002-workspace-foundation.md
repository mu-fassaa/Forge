# ADR 0002: Workspace Foundation

## Context
Forge aims to support multiple different editors (Dialogue Trees, Quest flowcharts, Skill Trees). Each editor needs a set of common workspace services: project save/load status, background autosave, undo/redo change history, and toast notifications. Writing this logic repeatedly inside every plugin creates extreme code duplication and inconsistent user experiences.

## Decision
We implemented a shared **Workspace State Context** (`WorkspaceContext.tsx`) that governs the global shell environment:
- Holds project metadata, user preferences (Settings), and notification queues.
- Manages an undo/redo stack that captures canvas snapshot states.
- Triggers a debounced background autosave routine (runs every 15 seconds if changes are detected).
- Exposes registration interfaces (`setActiveEditor`) allowing the currently mounted editor canvas to delegate its nodes, edges, and state-setters to the global workspace.

## Consequences
- **Positive**: Single-source-of-truth workspace lifecycle. Save buttons, history panels, settings toggles, and autosave work instantly across any editor layout.
- **Trade-off**: Requires every editor component to register its React Flow state methods to the context upon mounting. If an editor fails to register, global actions (like Save or Undo) will be disabled.

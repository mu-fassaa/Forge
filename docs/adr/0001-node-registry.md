# ADR 0001: Centralized Node Registry System

## Context
Forge requires a modular node layout where developers can add custom nodes with unique data structures, shapes, input/output counts, and sidebar inspector edit forms. Hardcoding a React Flow `nodeTypes` dictionary creates high coupling, making the core canvas editor file grow dynamically with each added node.

## Decision
We implemented a centralized, singleton-based **Node Registry System** (`nodeRegistry.ts`). Nodes are registered with:
- `type`: Unique node string (e.g. `'dialogue'`, `'condition'`).
- `component`: React Flow canvas node component.
- `inspectorComponent`: React sidebar editing form component.
- Visual descriptors (icon, accent colors).
- Default properties (inputs, outputs, default data payload).

Registration is performed via side-effect imports (e.g. `import './dialogueNode.def'`), decoupling the core engine from editor implementations.

## Consequences
- **Positive**: High extensibility. Adding a new node type requires zero modifications to the core editor canvas files.
- **Trade-off**: Relies on registration side-effects during startup. If imports are missed in the index definition, nodes will fail to render on the canvas.

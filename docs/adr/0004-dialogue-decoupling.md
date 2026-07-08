# ADR 0004: Dialogue Decoupling

## Context
Initial implementations of dialogue compiling, preview simulations, and local savings were tightly coupled with the core. The core `PreviewModal` contained dialogue-specific bubble layouts, while `WorkspaceContext` hardcoded saving under `'dialogue'` keys. This blocked adding other editor types (like Quest or Skill editors) without changing the core codebase.

## Decision
We executed a complete **Dialogue Decoupling (v0.3.5)** using **Dependency Inversion**:
- **Dynamic Previews**: Moved dialogue-specific simulation logic (bubble dialogs, condition paths, variable assignments) into the Dialogue plugin: `DialoguePreviewSimulator.tsx`. Core `PreviewModal` only renders a generic log shell and injects the active editor's component dynamically.
- **Dynamic Save/Load**: Updated serialization methods in `WorkspaceContext.tsx` to read/write under the active editor's ID dynamically, incorporating a merge mechanism to preserve other plugin states.
- **Pluggable Metadata**: Exposed dynamic compile descriptions (`publishInfo`) to customize publishing screen outputs.

## Consequences
- **Positive**: 100% decoupled core. The Forge Core has zero knowledge of Dialogue-specific interfaces, making it a truly generic node engine.
- **Trade-off**: Slightly increases configuration requirements during plugin initialization.

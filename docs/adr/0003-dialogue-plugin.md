# ADR 0003: Dialogue Plugin Integration

## Context
Forge requires a narrative node-editor for creating complex dialogue flows. It needs to support speakers, dialogue text, branching choices, conditional routing, event signaling, variable tracking, and conversation end statuses.

## Decision
We developed a complete **Dialogue Plugin (v0.3.0)** containing:
- Specific node definitions: Start Node, Dialogue Node (with custom choices mapping to dynamic output ports), Condition Node (fixed True/False ports), Event Node, Variable Node, and End Node.
- Enforcement of a single Start Node per graph canvas.
- Active choice synchronization mapping inspector port labels directly to React Flow's `outputs` handles and node payload `data.choices`.
- Interactive dialogue preview sandbox to playtest narrative branching live inside the editor.

## Consequences
- **Positive**: Immediate usability for game designers. Clear tree structures and instant narrative simulator playtesting.
- **Trade-off**: High coupling in the early phase of implementation where preview simulators, compiling, and serialization paths were hardcoded directly inside core components.

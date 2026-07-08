# Node System Specification

This document details the visual and relational model for graph nodes in the Forge editor.

---

## 1. Data Models

Every node registered in the workspace conforms to the following type schema:

```typescript
interface ForgeNode<TData = Record<string, unknown>> {
  id: string;                      // Unique node identifier
  type: string;                    // Registered node type string
  position: { x: number; y: number }; // Visual coordinates on the canvas
  data: TData;                     // Plugin-specific key-value payload
  inputs: NodePort[];              // Input ports list
  outputs: NodePort[];             // Output ports list
}

interface NodePort {
  id: string;                      // Dynamic port ID
  label?: string;                  // Optional label shown on the node
}
```

---

## 2. Visual Rendering (BaseNodeWrapper)

Rather than defining HTML borders and handles inside individual plugin nodes, all nodes use `BaseNodeWrapper` as their visual shell:
- **Horizontal Handle Distribution**: Input ports are rendered on the top edge, and output ports on the bottom edge. Positions are calculated dynamically based on percentage distribution:
  $$\text{position} = \frac{(index + 1) \cdot 100}{length + 1}\%$$
- **Dynamic Updates**: When ports are added/removed (e.g. Dialogue choices), the wrapper calls `useUpdateNodeInternals` to alert React Flow to update coordinates.

---

## 3. Scope Status

- **BaseNodeWrapper Shell**: `Implemented`.
- **Dynamic Port Recalculation**: `Implemented`.
- **Custom Port Drag Validation**: `Planned` (enforcing handle-to-handle type matching logic during edge creation).

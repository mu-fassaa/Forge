# Plugin System Specification

This document details how modules/editors register custom nodes and settings to the global Forge workspace.

---

## 1. Registry API

Plugins hook into the core registry using a simple interface:

```typescript
interface NodeDefinition<TData = Record<string, unknown>> {
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  component: ComponentType<NodeProps<Node<TData>>>;
  inspectorComponent: ComponentType<InspectorProps<TData>>;
  defaultData: TData;
  inputs: NodePort[];
  outputs: NodePort[];
}
```

---

## 2. Dynamic Component Binding

By separating the **Canvas Node component** from the **Inspector form**, Forge keeps the visual canvas lightweight:

1. **Canvas Component (`component`)**: Shows read-only labels, title bars, and status icons. Keeps UI zoom actions responsive.
2. **Inspector Component (`inspectorComponent`)**: Mounts on the workspace sidebar, rendering larger controls, textarea inputs, and conditional logic.

---

## 3. Scope Status

- **Side-Effect Registries**: `Implemented` (plugins register node models upon import).
- **Global Module Bundler**: `Planned` (a dynamic plugin manager allowing plugins to be registered externally at runtime).

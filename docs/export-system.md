# Export System Specification

This document details the architecture of the compilation and export engine in Forge.

---

## 1. Relational Graph Compiler

To keep runtime loaders simple, Forge parses the raw visual graph structure (nodes and connections) and compiles it into a relational JSON map.

### Dialogue Node Compile Pipeline
If a node contains custom ports (choices), it compiles into a list of choice targets mapping labels directly to the destination node ID:

```json
"dialogue_node_01": {
  "id": "dialogue_node_01",
  "type": "dialogue",
  "data": {
    "speaker": "Juned",
    "text": "Choose your drink:"
  },
  "choices": [
    { "port_id": "port_1", "label": "Kopi", "next": "dialogue_node_kopi" },
    { "port_id": "port_2", "label": "Matcha", "next": "dialogue_node_matcha" }
  ]
}
```

---

## 2. Decoupled Pipeline Architecture

We separate internal editor data from compiled runtime schemas:

```
┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
│  Internal save  │             │   Forge Core    │             │ Compiled schema │
│    (.forge)     │ ──────────► │  Export System  │ ──────────► │     (.json)     │
│  nodes & edges  │             │  (this module)  │             │  relational map │
└─────────────────┘             └─────────────────┘             └─────────────────┘
```

This prevents runtime file sizes from bloating, as editor-only visual details (node coordinates, selected status, grid configs) are stripped out during the build compilation step.

---

## 3. Scope Status

- **JSON Export Modal & Downloader**: `Implemented`.
- **Relational Choice Compiler**: `Implemented`.
- **CLI Compilation Tool**: `Future Vision` (a CLI tool to automatically compile `.forge` project files in a CI/CD build pipeline).

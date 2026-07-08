# Architecture Specification

This document details the system architecture of the Forge editor workspace.

---

## 1. High-Level Component Relationship

```
                     ┌───────────────────────────────────┐
                     │            UI Layer               │
                     │ (DashboardLayout, Sidebar, Header)│
                     └─────────────────┬─────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │        Workspace Context          │
                     │ (Save, Settings, History, Toast)  │
                     └─────────────────┬─────────────────┘
                                       │
                                       ▼
 ┌─────────────────────────────────────┴─────────────────────────────────────┐
 │                               Core Engine                                 │
 │  ┌─────────────────────────────────────────────────────────────────────┐  │
 │  │                            Node Registry                            │  │
 │  │            (Stores NodeDefinitions: Components, Inspectors)          │  │
 │  └───────────────────▲─────────────────────────────────────▲───────────┘  │
 └──────────────────────│─────────────────────────────────────│──────────────┘
                        │ registers                           │ registers
            ┌───────────┴───────────┐             ┌───────────┴───────────┐
            │    Dialogue Plugin    │             │   Future BT Plugin    │
            │ (DialogueNode, fields)│             │  (Behavior Tree, etc) │
            └───────────────────────┘             └───────────────────────┘
```

---

## 2. Core Modules

### 2.1 UI Layer
- **Shell**: `DashboardLayout` manages outer wrappers, workspace headers (Save, Publish triggers), and sidebar navigation lists.
- **Modals**: Settings, User overlays, and Publish validators are wrapped globally and activated via state triggers.

### 2.2 Workspace Context
- **Global Provider**: Acts as the communication bridge.
- **Active Registry**: Maintains a reference to the active editor state (`nodes`, `edges`, state setters) so external commands (e.g. Save, Undo, Redo, Autosave) can modify canvas elements directly.

### 2.3 Node Registry (Plugin Hook)
- A singleton registry object (`nodeRegistry`).
- Holds metadata mapping `type` keys to canvas components (`component`) and editing fields (`inspectorComponent`).

### 2.4 Export System
- Agnostic JSON export module compiling active graph elements to Godot-ready schema files.

---

## 3. Scope Status

- **Global Context Architecture**: `Implemented`.
- **Global Active Editor Registry**: `Implemented`.
- **Multi-Editor Routing**: `Planned` (routing between multiple simultaneous node editors in the workspace).

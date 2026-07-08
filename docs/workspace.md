# Workspace & Lifecycle Specification

This document details the global state, saving mechanics, timeline tracking, preferences, and modal flows of the Forge workspace shell.

---

## 1. State Management

The workspace lifecycle is managed by `WorkspaceContext`, holding:
- **Dirty Flag (`isDirty`)**: Triggers when nodes, edges, or settings are modified. Cleared when saved.
- **Autosave Debouncer**: Runs in the background. If `autosave` is active and the workspace becomes `dirty`, commits changes to local storage after 15 seconds of inactivity.
- **Notification Queue**: Thread-safe toast messages triggered globally.
- **Command Palette State (`isPaletteOpen`)**: Managed by context. Exposed as `openPalette()` / `closePalette()` for any component to trigger.

---

## 2. History Stack & Rollbacks

Undo/Redo capabilities are supported through immutable state snapshots:
- **Undo Actions**: Pushes the current canvas snapshot to the `futureStack`, Pops the last snapshot from the `pastStack` and updates active editor nodes/edges.
- **Redo Actions**: Pushes the current canvas snapshot to the `pastStack`, Pops the last snapshot from the `futureStack` and updates active editor nodes/edges.
- **Logs**: User changes are logged in the sidebar panel.

---

## 3. Command Registry (`src/registry/commandRegistry.ts`)

A singleton class-based registry that stores all executable commands. Commands use dot-namespaced IDs (`workspace.save`, `dialogue.export`).

- **Core** registers workspace and navigation commands on `WorkspaceProvider` mount.
- **Plugins** register their own commands in a `useEffect` on mount, and unregister on unmount.
- Core never imports from plugins — dependency flows Plugin → Core only.

---

## 4. Shortcut Registry (`src/registry/shortcutRegistry.ts`)

Decoupled from Command Registry. Stores `ShortcutDefinition` entries keyed by normalized key strings (`ctrl+s`, `ctrl+shift+p`).

- A **single global listener** is mounted in `DashboardLayout.tsx` — it calls `shortcutRegistry.resolve(event)` and executes the matched handler.
- Shortcuts are ignored when focus is in an input field, except `escape`, `ctrl+k`, and `ctrl+shift+p`.
- Plugins register their shortcuts on mount and unregister on unmount.

---

## 5. Recent Graph Manager (`src/services/recentGraphManager.ts`)

localStorage-based service (`forge_recent_graphs_v1`) that tracks graphs opened in the current session.

- Stores: `graphId`, `projectName`, `editorType`, `lastOpenedAt`, `nodeCount`, `edgeCount`.
- Max 10 entries. Auto-dedup by `graphId` (most recent is always first).
- `getLatest()` is used by Dashboard hero card to show accurate last-opened time and node/edge counts.

---

## 6. Scope Status

| Feature | Status |
|---|---|
| Save, Autosave & Change Logs | `Implemented` |
| Undo/Redo Snapshot Rollbacks | `Implemented` |
| Keyboard Shortcut Registry | `Implemented` (v0.5.0) |
| Command Registry | `Implemented` (v0.5.0) |
| Command Palette (Ctrl+K) | `Implemented` (v0.5.0) |
| Recent Graph Manager | `Implemented` (v0.5.0) |
| Multi-user Collaboration | `Planned (Beta SDK)` |


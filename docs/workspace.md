# Workspace & Lifecycle Specification

This document details the global state, saving mechanics, timeline tracking, preferences, and modal flows of the Forge workspace shell.

---

## 1. State Management

The workspace lifecycle is managed by `WorkspaceContext`, holding:
- **Dirty Flag (`isDirty`)**: Triggers when nodes, edges, or settings are modified. Cleared when saved.
- **Autosave Debouncer**: Runs in the background. If `autosave` is active and the workspace becomes `dirty`, commits changes to local storage after 15 seconds of inactivity.
- **Notification Queue**: Thread-safe toast messages triggered globally.

---

## 2. History Stack & Rollbacks

Undo/Redo capabilities are supported through immutable state snapshots:
- **Undo Actions**: Pushes the current canvas snapshot to the `futureStack`, Pops the last snapshot from the `pastStack` and updates active editor nodes/edges.
- **Redo Actions**: Pushes the current canvas snapshot to the `pastStack`, Pops the last snapshot from the `futureStack` and updates active editor nodes/edges.
- **Logs**: User changes are logged in the sidebar panel.

---

## 3. Scope Status

- **Save, Autosave & Change Logs**: `Implemented`.
- **Undo/Redo Snapshot Rollbacks**: `Implemented`.
- **Keyboard Shortcut Hooks**: `Planned` (global listeners for `Ctrl+S`, `Ctrl+Z`, and `Ctrl+Y`).

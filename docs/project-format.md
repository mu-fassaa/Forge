# Project File Format Specification

This document details the schema of the Forge project file format (`.forge`).

---

## 1. Project Format Structure

Forge files are serialized as formatted, human-readable JSON payloads containing project metadata, application preferences, and separate plugin blocks:

```json
{
  "metadata": {
    "name": "My Dialogue Project",
    "version": "0.1.0",
    "createdAt": "2026-07-08T15:25:13.123Z",
    "lastSavedAt": "2026-07-08T15:45:00.000Z"
  },
  "settings": {
    "theme": "dark",
    "autosave": false,
    "grid": true,
    "snap": true,
    "language": "id"
  },
  "editorData": {
    "dialogue": {
      "nodes": [],
      "edges": []
    }
  }
}
```

---

## 2. Component Blocks

### 2.1 Metadata Block
Contains project identifying information. Useful for project manager landing views and revision auditing.

### 2.2 Settings Block
Stores developer-specific IDE configurations so layouts restore identically across editing sessions.

### 2.3 EditorData Block
Houses raw plugin data. Stored as separate sub-keys (`dialogue`, `behavior_tree`, etc.) to prevent key collisions between different editors in the same project.

---

## 3. Scope Status

- **JSON Storage Schema**: `Implemented` (currently writing to local storage).
- **Physical File Serialization (.forge)**: `Planned` (exposing file download/upload handlers).

# The Forge Manifesto

**Forge exists to help developers design game logic visually without locking them to a specific engine.**

We believe that game development tools should be as flexible, modular, and creative as the games they help build. The logic of your game belongs to you, not to the engine's proprietary editor or binary formats.

---

## Our Core Principles

### 1. Engine-Agnostic
Forge generates structured, raw relational schemas. It does not compile binary files for a single runtime. Whether your game is built on Godot, Unity, Unreal, or a custom homebrew engine, Forge's output remains parser-ready and clean.

### 2. Plugin-First Architecture
The editor shell (Forge Core) is completely agnostic to game logic. Dialogue trees, quest systems, and skill trees are external plugins. If a feature can be a plugin, it **must** be a plugin.

### 3. Human-Readable Project Format
Our raw project save format (`.forge`) is plain, formatted JSON. It is readable, easily diffable in version control (Git), and straightforward for developers to script, modify, or merge.

### 4. Extensible Before Optimized
We design APIs and generic abstractions first. Code readability and clean structural interfaces take absolute priority over micro-optimizations until performance measurements prove optimization is necessary.

### 5. Consistency Over Complexity
A single visual language, a shared interface guideline, and a unified state management lifecycle. We solve complex problems by maintaining simple, consistent rules across the workspace.

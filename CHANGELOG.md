# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.1] - 2026-07-09

### Added
- **Navigation Service** (`src/services/navigationService.ts`): Singleton bridge between platform services and React navigation. Plugin calls `navigationService.navigate()` without knowing React internals.
- **Session Service** (`src/services/sessionService.ts`): Persists `lastActiveTab` to localStorage. Forge always opens Dashboard on startup; Dashboard "Resume" button reads last session.
- **Search Service** (`src/services/searchService.ts`): Provider-pattern search aggregator. Core registers `workspace.navigation` and `workspace.recent` providers. Plugins extend via `addProvider()`.
- **Context Menu Registry** (`src/registry/contextMenuRegistry.ts`): Plugin registers `ContextMenuGroup` on mount, unregisters on unmount. Canvas-only scope (v0.5.1).
- **Tab Bar** (`src/components/workspace/TabBar.tsx`): Visual strip below header showing active editor as tab. Single active graph (Q1 decision). Home tab always present; editor tab closeable via ×.
- **Context Menu Overlay** (`src/components/workspace/ContextMenuOverlay.tsx`): Global overlay that listens to `forge:contextmenu` custom event and renders `contextMenuRegistry` groups.
- **Dialogue Canvas Context Menu**: Right-click on canvas shows Add Node, Validate Graph, Clear Canvas.
- **Navigation Commands**: `navigation.dashboard`, `navigation.dialogue`, `navigation.docs` registered in CommandRegistry.
- **Workspace Undo/Redo Commands**: `workspace.undo` (Ctrl+Z) and `workspace.redo` (Ctrl+Y) registered in both CommandRegistry and ShortcutRegistry.
- **Global Search (Ctrl+P)**: Command Palette extended with dual mode — Commands (Ctrl+K) and Search (Ctrl+P) in one overlay.

### Changed
- **`activeTab` migrated from `App.tsx` to `WorkspaceContext`**: Eliminates prop drilling. All navigation goes through `navigate()` from context or `navigationService.navigate()`.
- **`DashboardLayout`**: Removed `activeTab`/`setActiveTab` props — now reads from `useWorkspace()`.
- **`Dashboard`**: Removed `onSelectTool` prop — calls `navigate()` directly from context. "Resume Last Session" button targets `lastSessionTab`.
- **Command Palette**: Extended with Search mode tab. Ctrl+K → Commands, Ctrl+P → Search.

---

## [0.5.0] - 2026-07-09


### Added
- **Command Registry** (`src/registry/commandRegistry.ts`): Singleton class-based registry. Plugins register commands on mount and unregister on unmount. Core is agnostic to plugin implementations.
- **Shortcut Registry** (`src/registry/shortcutRegistry.ts`): Decoupled from Command Registry. Single global listener in `DashboardLayout` delegates to `shortcutRegistry.resolve()`. Handles input-field focus gracefully.
- **Command Palette** (`src/components/workspace/CommandPalette.tsx`): VS Code-style overlay triggered via `Ctrl+K` / `Ctrl+Shift+P`. Realtime search, grouped categories, keyboard navigation (↑↓ Enter Esc), shortcut badges, and empty state.
- **Recent Graph Manager** (`src/services/recentGraphManager.ts`): localStorage service tracking last-opened graphs with node/edge counts. Dashboard hero card now shows accurate last-opened time.
- **Core Commands Registered**: `workspace.settings`, `workspace.publish`, `workspace.preview`, `workspace.palette`.
- **Dialogue Commands Registered**: `dialogue.save`, `dialogue.validate`, `dialogue.preview`, `dialogue.export` (registered on plugin mount).
- **Core Shortcuts**: `Ctrl+K`, `Ctrl+Shift+P` (palette), `Ctrl+,` (settings), `Escape` (close modals/palette).
- **Dialogue Shortcuts**: `Ctrl+S` (save, registered by Dialogue plugin on mount).

### Changed
- Dashboard hero card now shows `LAST OPENED` timestamp from Recent Graph Manager.
- Dashboard Dialogue card shows node/edge counts from Recent Graph Manager (falls back to localStorage if not available).

---

## [0.4.0] - 2026-07-08

### Added
- **Design System**: Centralized `@theme` tokens in `src/index.css` — Electric Blue (`#00A3FF`), Deep Navy (`#07122A`), Geist + JetBrains Mono fonts.
- **Status Bar**: Bottom-docked bar showing autosave, grid/snap mode, validation counts, and locale.
- **Dashboard Workspace Launcher**: Restructured landing page with hero banner, Dialogue spotlight card, and muted module row for unreleased editors.
- **History Tab View**: Full timeline activity panel on `Explorer → History` tab.
- **Collaborators Tab View**: Team management panel (alpha placeholder) on `Explorer → Collaborators` tab.
- **Contextual Header Breadcrumb**: `PROJECT: [NAME] / WORKSPACE: [CONTEXT]` in JetBrains Mono.

### Changed
- Renamed sidebar button `New Module` → `New Graph`.
- Dialogue editor toolbar reorganized into semantic groups: Node Creator | Operations | Danger.
- Removed all pink accent colors (`#ec4899`, `#e879f9`) — migrated to Electric Blue throughout.

---

## [0.3.0] - 2026-07-08


### Added
- **Start Graph Node**: Created a visual `StartNode` canvas component acting as the graph execution entry point.
- **Single Start Node Enforcement**: Restricted canvas additions to a single Start node per graph, blocking duplicates and throwing warning toast alerts.
- **Atomic Choice Synchronization**: Linked dynamic choice output ports to internal node payload `data.choices` list.
- **Dialogue Simulator (Previewer)**: Stateful preview sandbox executing dialogue nodes, picking branch paths, and tracking variables state live.
- **Visual Validation Engine**: Implemented checking algorithms for unreachable nodes, disconnected choices, missing starts, and infinite loops, rendering alert badges directly on nodes.
- **Relational JSON Compiler**: Integrated a standalone relational compiler utility. Exposes compiled graphs to exporter targets.

## [0.2.1] - 2026-07-08

### Added
- **Core Manifesto (`MANIFESTO.md`)**: Declared five core design principles for Forge: Engine-agnostic, Plugin-first, Human-readable formats, Extensible before optimized, and Consistency over complexity.
- **Technical Specifications Directory (`docs/`)**: Created visions, architecture specs, node schemas, workspace lifecycle details, project file formatting specs, and design system guidelines.

## [0.2.0] - 2026-07-08

### Added
- **Save System & Project Metadata**: Implemented dynamic localStorage save and load integration with dynamic metadata attributes (name, version, creation timestamp, last saved timestamp).
- **Unsaved Changes Indicator**: Added a visual glowing indicator in the header bar representing dirty edit state.
- **Autosave Routine**: Added background debounced autosave trigger executing automatically every 15 seconds on dirty workspaces.
- **Undo/Redo History Stacks**: Implemented timeline and snapshot-based past/future stacks for full canvas state rollback support.
- **Workspace Prefs & Settings Modal**: Added custom settings controls for Light/Dark themes, snap-to-grid controls, visual background grid layout toggle, and localization selector.
- **Publish Pipeline Modal**: Built step-by-step validator and build compiler animations with progress tracking.
- **User profile Menu**: Profile popover overlay providing access to account license status and about menus.
- **Internal Documentation**: Built native guide page documenting Forge structure, shortcuts cheatsheet, and loader examples for Godot (GDScript).

## [0.1.0] - 2026-07-08

### Added
- **Core Node Registry**: Centralized `nodeRegistry` for modular node configuration.
- **Inspector Panel**: Sidebar component to edit node data dynamically.
- **Dynamic Output Ports**: `PortListEditor` component for creating and editing ports dynamically (e.g., dialogue choices).
- **Generic Node Types**: Completed migration of Dialogue, Condition, Event, Variable, and End nodes into the new registry and inspector system.
- **Reactive Handle Recalculation**: Wrapped React Flow handles with `useUpdateNodeInternals` to ensure proper positioning of dynamic ports.
- **Multi-Port JSON Export**: Godot-compatible relational JSON export containing `choices` branching mappings.

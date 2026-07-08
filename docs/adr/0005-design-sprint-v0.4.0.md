# ADR 0005: Design Sprint v0.4.0 — Visual Identity, UX Polish & Workspace Refinement

## Context
After completing Dialogue Plugin (v0.3.0) and Dialogue Decoupling (v0.3.5), Forge's functional architecture was solid but the visual layer had several problems:

1. **Wrong Visual Identity**: Pink/neon accent colors and drop shadows made the UI feel like a SaaS marketing dashboard rather than a game development authoring tool.
2. **No Design System**: Fonts, colors, and spacing were inconsistent across components — no shared token system.
3. **Weak Dashboard UX**: The landing page showed a static metadata grid. Users had no clear entry point to resume their work.
4. **False Tab Affordances**: `Explorer`, `History`, and `Collaborators` header tabs changed state but rendered identical content on the Dashboard.
5. **Inconsistent Terminology**: Sidebar button called "New Module" — ambiguous against Forge's Plugin/Graph/Editor taxonomy.
6. **Ungrouped Editor Toolbar**: Dialogue editor buttons were unstructured and retained pink styling inconsistent with the rest of the UI.

## Decision
We executed a complete visual and UX overhaul across the 0.4.x series, consolidated here as a single release:

### 1. Central Design System (`src/index.css`)
- Loaded `Geist` (sans-serif body) and `JetBrains Mono` (monospace for IDs, coordinates, metadata labels).
- Defined Tailwind v4 `@theme` tokens:
  - Background: `Deep Navy` `#07122A`
  - Card: `#0c1833`, Active Layer: `#122247`
  - Border: `#1a2d54`
  - Primary: `Electric Blue` `#00A3FF`
  - Text: Off-White `#F3F4F6`, Muted `#8E9BB4`

### 2. Workspace Layout (`DashboardLayout.tsx`)
- Replaced all pink buttons and borders with Electric Blue tonal layering.
- Added `StatusBar` component docked at the bottom, displaying: autosave status, grid snap mode, active validation counts, and locale.
- Renamed `New Module` → `New Graph`.
- Header now displays contextual path: `PROJECT: [NAME] / WORKSPACE: [LAUNCHER | DIALOGUE | DOCS]`.

### 3. Dashboard — Workspace Launcher (`Dashboard.tsx`)
- Restructured the landing page into a focused **Workspace Launcher**:
  - **Hero Banner**: Compact greeting (`"Welcome back."`) with `Resume Last Session` and `View Documentation` CTAs.
  - **Dialogue Spotlight Card**: Full-width active session card showing live node/edge counts from saved data, validation status, last modified time, and `Continue Editing →` action.
  - **Muted Module Row**: Quest, Skill Tree, Wave Spawner, Item Database, Enemy Database rendered as a single dim row (18% opacity) to prevent visual competition with the active editor.
- `History` tab → Timeline Activity panel (history log list + compile savepoint states).
- `Collaborators` tab → Team management panel (member table + disabled invite form placeholder).

### 4. Canvas Nodes (`BaseNodeWrapper.tsx`, `StartNode.tsx`, `DialogueNode.tsx`)
- Compacted node width to `w-56`, tightened header/content padding.
- Applied Electric Blue selection borders, brand-border default edges.
- JetBrains Mono for node ID tags and port labels.

### 5. Dialogue Editor Toolbar (`DialogueEditor.tsx`)
- Reorganized into three semantic groups separated by dividers:
  - **Node Creator**: Type selector + `Add Node` (Electric Blue)
  - **Operations**: `Preview Graph` (emerald) + `Export JSON` (Electric Blue outline)
  - **Danger**: `Clear` (red muted)
- Removed all remaining pink accent classes from buttons, empty canvas state, and Export JSON modal.
- Updated empty canvas copy from Indonesian placeholder to English: `"Select node type and click 'Add Node' to begin editing narrative tracks."`

## Consequences
- **Positive**: Forge now visually and functionally resembles a professional game authoring tool (comparable to Godot, Figma, Cursor). Every interactive element has clear, honest behavior — no silent no-ops.
- **Trade-off**: Strict color discipline is now required for all future additions. Collaborators and multi-user features remain deferred to a future SDK beta.

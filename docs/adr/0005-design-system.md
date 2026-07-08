# ADR 0005: IDE-Inspired Design System & Constitution

## Context
Forge is a professional game development authoring tool, not a typical SaaS dashboard. Prior layouts featured inconsistent typography, heavy shadow elevations, marketing-style animations, and neon pink buttons. These elements distracted users and conflicted with the "Calm, Technical, Engineering-first" visual requirements of an IDE.

## Decision
We executed a complete visual overhaul based on the new **Design Constitution**:
1.  **Refactored Colors**: Standardized background to `Deep Navy` (`#07122A`) and primary accents to `Electric Blue` (`#00A3FF`).
2.  **Tonal Layering**: Replaced heavy drop shadows with subtle border outlines (`#1a2d54`) and layered card backgrounds (`#0c1833`).
3.  **Typography standard**: Imported and loaded `Geist` (for headings/body) and `JetBrains Mono` (for coordinate values, metadata tags, and IDs) to create a clean, IDE-like aesthetic.
4.  **Pro Project Launcher**: Redesigned the main dashboard into a multi-column project manager displaying active workspace metadata, live graph validation status, history change logs, and editor launching cards.
5.  **Docked Status Bar**: Added an agnostic status bar (`StatusBar.tsx`) at the bottom of the screen displaying snaps, grid scales, and validation error counts.

## Consequences
- **Positive**: High visual coherence. The workspace resembles professional desktop applications like Figma, Godot, and Cursor, enhancing usability and density of information.
- **Trade-off**: Requires strict discipline to use the new CSS color variables and typography classes on any future nodes or editors.

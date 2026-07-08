# Forge UI Guidelines

This document details visual design systems, layout variables, typography, and styling rules for the Forge editor workspace.

---

## 1. Visual Aesthetics & Themes

Forge uses a high-contrast, premium neon-dark aesthetic:
- **Palette Principles**: Deep slate/dark background canvas contrasted with vibrant, glowing visual accent variables (fuchsia, indigo, violet, amber).
- **Glassmorphism**: Modals and dropdown wrappers use backdrop blur utilities (`backdrop-blur-md`) overlaid on highly transparent backgrounds (`bg-black/60` or `bg-[#0b0c1e]/95`).

---

## 2. Layout Dimensions

- **Header Bar**: Height: `h-14` (56px). Fixed position.
- **Sidebar**: Width: `w-64` (256px).
- **Inspector Panel / History Panel**: Width: `w-72` (288px).
- **Borders**: Border width: `border` (1px). Border color: `#14152a` or `#1a1c36`.

---

## 3. Typography

- **Fonts**: Primary interface font is `Inter` (sans-serif) or system-default fallback values. Code snippets and ID numbers use monospace family configurations.
- **Visual Scale**:
  - Main Page Headers: `text-base` or `text-sm`, font-black.
  - Sub-section Labels / Badges: `text-[10px]` or `text-[9px]`, uppercase, letter-spacing tracking-wider, font-extrabold.
  - Form Fields / General copy: `text-xs`.

---

## 4. Micro-Animations

Transitions between states should look premium and fluid:
- Modal entries fade-in and scale up using custom cubic-bezier timelines.
- Toast notifications slide-in from the right edge.
- Progress loaders use pulsing, repeating background gradients.

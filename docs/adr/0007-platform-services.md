# ADR 0007: Platform Services Layer (v0.5.1)

## Context
Setelah v0.5.0 membangun fondasi registry (CommandRegistry, ShortcutRegistry, RecentGraphManager), Forge membutuhkan lapisan service yang lebih matang agar plugin tidak perlu memanipulasi state React secara langsung. Navigasi, pencarian, context menu, dan session management harus dapat digunakan oleh plugin tanpa mengetahui implementasi Core.

## Decisions

### 1. NavigationService (`src/services/navigationService.ts`)
Singleton yang menyimpan reference ke `setActiveTabState` dari WorkspaceContext. Plugin memanggil `navigationService.navigate(tab)` — Core yang menentukan bagaimana navigasi dilakukan.

**Pattern**: Dependency Inversion — plugin bergantung pada service abstrak, bukan React state setter.

**Lifecycle**: `navigationService.register(fn)` dipanggil dalam `useEffect` di `WorkspaceProvider` setelah React state siap. Service aman dipanggil dari mana saja tanpa import React.

### 2. activeTab Migration (App.tsx → WorkspaceContext)
State `activeTab` dipindahkan dari `App.tsx` ke `WorkspaceContext`. Ini menghapus prop drilling (`activeTab`/`setActiveTab`) di seluruh component tree.

Sebelum:
```
App.tsx → DashboardLayout (props) → sidebar buttons (setActiveTab)
App.tsx → Dashboard (onSelectTool prop)
```

Sesudah:
```
WorkspaceContext.navigate() ← digunakan langsung oleh DashboardLayout
WorkspaceContext.navigate() ← digunakan langsung oleh Dashboard
```

### 3. SessionService (`src/services/sessionService.ts`)
Menyimpan `lastActiveTab` ke localStorage key `forge_workspace_session_v1`. Forge selalu membuka Dashboard saat startup (Q4 decision). Dashboard "Resume Last Session" button membaca `lastSessionTab` dari context untuk menentukan ke mana user akan diarahkan.

### 4. SearchService (`src/services/searchService.ts`)
Provider pattern — Core mendaftarkan built-in providers (`workspace.navigation`, `workspace.recent`). Plugin dapat menambahkan provider sendiri via `searchService.addProvider()`.

Pencarian diakses via Command Palette dalam mode 'search' (`Ctrl+P`). Bukan overlay terpisah — keputusan Q2 untuk menjaga scope minimal.

### 5. ContextMenuRegistry (`src/registry/contextMenuRegistry.ts`)
Plugin mendaftarkan `ContextMenuGroup` saat mount, unregister saat unmount. `ContextMenuOverlay` menangkap custom event `forge:contextmenu` (bukan native `contextmenu` prop) agar Overlay tidak membutuhkan referensi langsung ke canvas component.

Scope v0.5.1: canvas area saja (Q3 decision).

### 6. TabBar (`src/components/workspace/TabBar.tsx`)
Visual tab strip antara header dan main content. Hanya satu editor tab yang aktif dalam satu waktu (Q1 decision — single active graph). Dashboard selalu ada sebagai home tab. Editor tab bisa ditutup dengan × yang melakukan `navigate('dashboard')`.

### 7. CommandPalette — Dual Mode
Palette diperluas dengan dua mode: `command` dan `search`. `Ctrl+K` → command mode. `Ctrl+P` → search mode. Mode ditampilkan sebagai tab indicator di atas input field. Data dari `commandRegistry` (commands) dan `searchService` (search results).

### 8. Undo/Redo via ShortcutRegistry
`Ctrl+Z` dan `Ctrl+Y` kini terdaftar di `shortcutRegistry` dan `commandRegistry`. Handler menggunakan `activeEditorRef` untuk mendapatkan nodes/edges/setters tanpa stale closure.

## Consequences

**Positive**:
- Plugin dapat navigate, search, dan mendaftarkan context menu tanpa import dari Core.
- `activeTab` tidak lagi di-prop-drill — satu sumber kebenaran di WorkspaceContext.
- `Ctrl+Z`/`Ctrl+Y` bekerja via platform layer, bukan inline handler per-editor.

**Trade-off**:
- `NavigationService` menggunakan mutable reference. Hati-hati jika WorkspaceProvider di-unmount dan re-mount (edge case: HMR dev mode). Solusi: register ulang di `useEffect`.

## Files Added
- `src/services/navigationService.ts`
- `src/services/sessionService.ts`
- `src/services/searchService.ts`
- `src/registry/contextMenuRegistry.ts`
- `src/components/workspace/TabBar.tsx`
- `src/components/workspace/ContextMenuOverlay.tsx`

## Files Modified
- `src/context/WorkspaceContext.tsx` — activeTab state, navigate, session, search providers
- `src/App.tsx` — remove activeTab local state
- `src/layouts/DashboardLayout.tsx` — remove props, mount TabBar
- `src/features/dashboard/Dashboard.tsx` — remove onSelectTool prop
- `src/features/dialogue-editor/DialogueEditor.tsx` — context menu registration
- `src/components/workspace/CommandPalette.tsx` — dual mode rendering

# ADR 0006: Command Registry, Shortcut Registry & Command Palette (v0.5.0)

## Context
Forge perlu mendukung multiple editors (Dialogue, Quest, Skill Tree, dll.) yang masing-masing memiliki command dan keyboard shortcut sendiri. Tanpa sistem registry terpusat, menambahkan editor baru berarti memodifikasi Core — melanggar prinsip Plugin-First arsitektur Forge.

Selain itu, pengguna perlu cara cepat untuk menemukan dan menjalankan command tanpa harus ingat semua shortcut atau lokasi tombol di UI.

## Decision

### 1. Command Registry (`src/registry/commandRegistry.ts`)
Singleton class-based registry (pola identik dengan `nodeRegistry.ts`). Setiap command memiliki:
- `id` — Namespace dot-separated: `workspace.save`, `dialogue.export`
- `label`, `description`, `category` — Untuk Command Palette
- `icon` — Lucide icon name
- `shortcut` — Display string untuk badge (opsional)
- `handler` — Fungsi yang dieksekusi

Core mendaftarkan workspace commands saat `WorkspaceProvider` mount. Plugin mendaftarkan commandnya sendiri saat mount dan unregister saat unmount. Core tidak mengimpor apapun dari plugin.

### 2. Shortcut Registry (`src/registry/shortcutRegistry.ts`)
Dipisah dari Command Registry agar shortcut bisa diganti tanpa mengubah command handler. Mendukung:
- `normalizeKeyEvent(e: KeyboardEvent): string` — konversi event ke key canonical
- Abaikan shortcut saat fokus di input field (kecuali `escape`, `ctrl+k`, `ctrl+shift+p`)

Global listener dipasang **satu kali** di `DashboardLayout.tsx`. Layout tidak mengetahui isi shortcut — hanya mendelegasikan ke `shortcutRegistry.resolve()`.

### 3. Recent Graph Manager (`src/services/recentGraphManager.ts`)
Service localStorage-based yang menyimpan riwayat graph terakhir dibuka (max 10 entries). Mendukung dedup otomatis berdasarkan `graphId`, dan `updateCounts()` untuk memperbarui node/edge count tanpa re-add entry. Dashboard hero card membacanya via `getLatest()`.

### 4. Command Palette (`src/components/workspace/CommandPalette.tsx`)
Overlay global (`z-[9999]`) yang terbuka via `Ctrl+K` / `Ctrl+Shift+P`. Fitur:
- Realtime search via `commandRegistry.search(query)`
- Grouped per category dengan divider
- Keyboard navigation: `↑↓` navigasi, `Enter` execute, `Esc` close
- Shortcut badge per command
- Empty state
- State `isPaletteOpen` dikelola di `WorkspaceContext`

## Consequences
- **Positive**: Menambahkan editor baru cukup mendaftarkan commands di `useEffect` mount — zero touch pada Core. Sistem ini sepenuhnya extensible untuk Plugin SDK di masa depan.
- **Trade-off**: Command handlers menggunakan `ref` pattern (bukan langsung di `useEffect` deps) untuk menghindari stale closure. Ini perlu dijaga konsistensinya saat menambahkan commands baru.

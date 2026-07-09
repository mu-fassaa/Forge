# ADR 0008: Plugin Proof - Hello Plugin (v0.5.5)

## Context
Untuk memverifikasi modularitas arsitektur Platform Layer Forge sebelum melangkah ke pembuatan Plugin SDK formal, kita memerlukan implementasi satu plugin pembuktian ("Hello Plugin"). Plugin ini harus membuktikan bahwa seluruh Platform Services dapat dikonsumsi secara modular tanpa adanya modifikasi core.

## Decisions

### 1. Sidebar Extensibility (`src/registry/sidebarRegistry.ts`)
Sebelumnya, sidebar bersifat statis dan hardcoded melalui array `EDITOR_TOOLS`. Kami membuat `sidebarRegistry` untuk menampung entri sidebar dari plugin secara dinamis di bawah section "Installed Plugins". Registry ini juga menangani state dynamic enablement (enable/disable toggle) per plugin yang disimpan di `localStorage`.

### 2. Editor View Registry (`src/registry/editorViewRegistry.ts`)
Untuk mengizinkan plugin merender Editor View miliknya sendiri tanpa hardcoded conditional di `App.tsx`, kami membangun `editorViewRegistry`. `App.tsx` sekarang secara dinamis merender custom editor component jika editor ID tersebut terdaftar dalam registry. `EditorType` di `src/types/index.ts` direlaksasi dari closed union type menjadi `string` agar dapat menerima ID plugin arbitrer.

### 3. Documentation Extensibility (`src/registry/docsRegistry.ts`)
Sistem dokumentasi sebelumnya bersifat statis (`DocsPage.tsx`). Kami memperkenalkan `docsRegistry` yang memungkinkan plugin mendaftarkan custom documentation section. `DocsPage` akan secara dinamis membaca docsRegistry dan merender section tersebut di bawah konten manual inti.

### 4. Hello Plugin Implementation (`src/features/hello-plugin/`)
Kami mengimplementasikan "Hello Plugin" untuk memverifikasi 6 kapabilitas:
1. **Command Registration**: Mendaftarkan command `hello.greet` di `commandRegistry` yang dipicu melalui Command Palette (Ctrl+K).
2. **Keyboard Shortcut**: Mendaftarkan shortcut `Ctrl+H` di `shortcutRegistry` yang context-sensitive (aktif hanya saat Hello Plugin terbuka).
3. **Context Menu**: Mendaftarkan canvas right-click context menu group `hello.canvas` berisi menu "Say Hello" dan "Platform Status".
4. **Sidebar Entry**: Mendaftarkan entry "Hello Plugin" di sidebar lengkap dengan toggle enable/disable.
5. **Node Registration**: Mendaftarkan custom node type `hello.greeting` di `nodeRegistry`. Node ini otomatis muncul dan dapat ditambahkan di Dialogue Editor.
6. **Documentation**: Menyediakan section dokumentasi di `DocsPage` yang merinci kode implementasi platform services.

## Consequences

**Positif**:
- Core Forge kini tidak mengetahui implementasi internal "Hello Plugin" (loose-coupling total).
- Desain arsitektur terbukti modular karena penambahan fitur hanya memerlukan dynamic registry registration.
- Toggle enable/disable berhasil memutus koneksi plugin dan melakukan pembersihan registry (unregistration) secara bersih.

**Modifikasi File**:
- `src/registry/sidebarRegistry.ts` (NEW)
- `src/registry/editorViewRegistry.ts` (NEW)
- `src/registry/docsRegistry.ts` (NEW)
- `src/types/index.ts` (Modified: relaksasi EditorType)
- `src/layouts/DashboardLayout.tsx` (Modified: integrasi dynamic plugin sidebar section + toggle)
- `src/App.tsx` (Modified: dynamic editor rendering + mount plugin loader)
- `src/features/docs/DocsPage.tsx` (Modified: dynamic plugin documentation section)
- `src/features/hello-plugin/*` (NEW: Hello Plugin implementation)

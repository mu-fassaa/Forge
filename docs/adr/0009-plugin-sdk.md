# ADR 0009: Plugin SDK Architecture (v0.6.0)

## Context
Sebelum v0.6.0, plugin (seperti Dialogue Editor dan Hello Plugin) berinteraksi secara langsung dengan singleton registries dan Core files. Hal ini merusak modularitas Forge dan menyulitkan developer eksternal. Kami memerlukan lapisan abstraksi formal (SDK) yang mengontrol lifecycle plugin, membatasi akses API Core, dan menyederhanakan registrasi layanan secara deklaratif.

## Decisions

### 1. Reorganisasi Folder
Untuk mempertegas batas arsitektur antara core platform, SDK, dan plugin konkret, kami membagi struktur folder menjadi:
- `src/platform/` — Layanan core global (commands, navigation, workspace, notifications) yang disediakan Forge.
- `src/plugin/` — SDK resmi berupa API publik untuk developer plugin.
- `src/plugins/` — Implementasi plugin konkret (dialogue dan hello) yang mengonsumsi SDK.

### 2. createPlugin() & PluginDefinition
Helper `createPlugin` bertindak sebagai single entry point deklaratif. Plugin cukup mengekspor objek definisi bertipe `PluginDefinition` yang berisi:
- `manifest`: Metadata terstandarisasi.
- `commands`, `shortcuts`, `sidebar`, `docs`, `nodes`, `editorView`, `contextMenus`: Deklarasi layanan secara deklaratif.
- Lifecycle hooks: `onInstall`, `onEnable`, `onDisable`, `onUnload`.

### 3. Sandbox Plugin Context (`PluginContext`)
Plugin dilarang keras mengimpor registries global secara langsung. Akses ke platform API di-wrap dalam sandbox `PluginContext` yang dilewatkan ke fungsi lifecycle. Context menyediakan akses terbatas untuk navigasi, workspace project, notifikasi, log riwayat, dan search provider.

### 4. Lifecycle & Auto-Registration (`PluginManager`)
`PluginManager` menangani penambahan plugin dan pendaftaran otomatis layanannya ke registries yang bersangkutan ketika plugin diaktifkan (`enablePlugin`). Ketika dinonaktifkan (`disablePlugin`), manager otomatis melakukan unregister untuk semua command, shortcut, sidebar items, node definitions, editor view, context menus, dan docs sections untuk menjamin kebersihan memori (no memory leak).

### 5. Id Duplication Validation
Untuk mencegah konflik antar plugin di runtime, `PluginManager` memvalidasi keunikan ID sebelum instalasi:
- Duplicate plugin ID.
- Duplicate command ID.
- Duplicate sidebar ID.
- Duplicate node ID.

## Consequences

**Positif**:
- Core Forge (`App.tsx` dan `DashboardLayout.tsx`) kini bersih dari import plugin secara hardcoded. Seluruh plugin dimuat secara dinamis.
- Pembersihan memori saat plugin dinonaktifkan terjamin karena unregistrasi dilakukan secara terpusat oleh SDK.
- SDK menyediakan type safety lengkap yang memandu developer plugin dengan error duplikasi yang jelas.

**File Ditambahkan**:
- `src/plugin/PluginManifest.ts`
- `src/plugin/PluginContext.ts`
- `src/plugin/createPlugin.ts`
- `src/plugin/PluginManager.ts`
- `src/plugin/PluginLoader.tsx`
- `src/plugins/dialogue/index.ts`
- `src/plugins/dialogue/nodeDefinitions.ts`
- `src/plugins/hello/index.ts`

**File Dimodifikasi**:
- `src/App.tsx` (Remove hardcoded imports & DialogueEditor render slot)
- `src/components/PortListEditor.tsx` (Adjust types import)
- `src/plugins/dialogue/DialogueEditor.tsx` (Remove manual registries usage, bind via setDialogueHandlers)
- `src/plugins/hello/HelloPlugin.tsx` (Remove manual registries usage)

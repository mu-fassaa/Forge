// ─────────────────────────────────────────────────────────────
// Registry entry point untuk Dialogue Editor.
//
// Cukup import file ini SEKALI di DialogueEditor.tsx:
//   import './components/nodes/definitions';
//
// Semua node di bawah ini akan otomatis terdaftar ke nodeRegistry
// sebagai side-effect dari import.
//
// Untuk menambah node baru:
//   1. Buat file [nama]Node.def.ts di folder ini
//   2. Tambahkan import-nya di sini
//   Selesai — tidak perlu ubah file lain.
// ─────────────────────────────────────────────────────────────

import './dialogueNode.def';
import './conditionNode.def';
import './eventNode.def';
import './variableNode.def';
import './endNode.def';
import './startNode.def';

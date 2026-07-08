import { type EditorTool } from '../types';

export const EDITOR_TOOLS: EditorTool[] = [
  {
    id: 'dialogue',
    name: 'Dialogue Tree Editor',
    sidebarName: 'Dialogue Trees',
    description: 'Rancang percakapan percabangan, dialog interaktif, dan alur naratif game secara visual dengan engine node kami yang canggih.',
    icon: 'MessageSquare',
    status: 'active',
    color: 'from-purple-500 to-indigo-500',
    badge: 'v1.0'
  },
  {
    id: 'quest',
    name: 'Quest Editor',
    sidebarName: 'Quest Editor',
    description: 'Buat alur quest, objektif, prasyarat, dan hadiah quest dengan sistem berbasis node yang terintegrasi dengan database.',
    icon: 'Compass',
    status: 'coming-soon',
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'skill',
    name: 'Skill Tree Editor',
    sidebarName: 'Skill Tree',
    description: 'Desain pohon kemampuan karakter, ketergantungan skill, dan peningkatan stat secara visual untuk RPG modern.',
    icon: 'GitFork',
    status: 'coming-soon',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'wave',
    name: 'Wave Spawner Editor',
    sidebarName: 'Wave Spawner',
    description: 'Atur pola kemunculan musuh (waves), waktu spawn, tipe musuh, dan tingkat kesulitan secara dinamis.',
    icon: 'Waves',
    status: 'coming-soon',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'items',
    name: 'Item Database',
    sidebarName: 'Asset Library',
    description: 'Kelola data katalog item, stats peralatan, inventaris, kelangkaan, dan deskripsi dalam format tabular.',
    icon: 'Package',
    status: 'coming-soon',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'enemies',
    name: 'Enemy Database',
    sidebarName: 'Enemy Database',
    description: 'Definisikan statistik musuh, tabel loot drop, behavior AI dasar, dan aset visual untuk setiap lawan.',
    icon: 'Skull',
    status: 'coming-soon',
    color: 'from-red-500 to-rose-600'
  }
];

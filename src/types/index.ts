// Known core editor IDs (documented for reference):
// 'dashboard' | 'dialogue' | 'quest' | 'skill' | 'wave' | 'items' | 'enemies' | 'docs'
// Plugin editors extend this with any string ID via EditorViewRegistry.
export type EditorType = string;

export interface EditorTool {
  id: EditorType;
  name: string;
  sidebarName?: string;
  description: string;
  icon: string; // Lucide icon name
  status: 'active' | 'coming-soon';
  color: string; // Tailwind accent border/text color class
  badge?: string;
}

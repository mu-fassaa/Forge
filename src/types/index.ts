export type EditorType = 'dashboard' | 'dialogue' | 'quest' | 'skill' | 'wave' | 'items' | 'enemies' | 'docs';

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

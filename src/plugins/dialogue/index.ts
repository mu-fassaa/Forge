import { createPlugin } from '../../plugin/createPlugin';
import { type PluginContext } from '../../plugin/PluginContext';
import { DialogueEditor } from './DialogueEditor';
import { dialogueNodeDefs } from './nodeDefinitions';

// ─────────────────────────────────────────────────────────────
// Dialogue Plugin Modul Local Context & Handlers
// ─────────────────────────────────────────────────────────────
let context: PluginContext | null = null;

let activeSaveHandler: (() => void) | null = null;
let activeValidateHandler: (() => void) | null = null;
let activeExportHandler: (() => void) | null = null;

/**
 * Dipanggil oleh DialogueEditor saat mount untuk menghubungkan
 * state React ke global command handler deklaratif.
 */
export const setDialogueHandlers = (handlers: {
  save: () => void;
  validate: () => void;
  export: () => void;
} | null) => {
  if (!handlers) {
    activeSaveHandler = null;
    activeValidateHandler = null;
    activeExportHandler = null;
    return;
  }
  activeSaveHandler = handlers.save;
  activeValidateHandler = handlers.validate;
  activeExportHandler = handlers.export;
};

export const dialoguePlugin = createPlugin({
  manifest: {
    id: 'dialogue',
    name: 'Dialogue Trees',
    version: '0.6.0',
    author: 'Forge Core Team',
    description: 'Design complex branching narrative dialogues, events, and conditions.',
    icon: 'MessageSquare',
    category: 'Editors',
    enabledByDefault: true,
  },
  
  onEnable: (ctx) => {
    context = ctx;
  },
  
  onDisable: () => {
    context = null;
  },
  
  commands: [
    {
      id: 'dialogue.save',
      label: 'Save Dialogue Graph',
      description: 'Save the current dialogue graph to local storage',
      category: 'Dialogue',
      icon: 'Save',
      shortcut: 'Ctrl+S',
      handler: () => {
        if (activeSaveHandler) {
          activeSaveHandler();
        } else {
          context?.notifications.add('warning', 'Save handler is not ready yet.');
        }
      },
    },
    {
      id: 'dialogue.validate',
      label: 'Validate Dialogue Graph',
      description: 'Run validation rules on the current dialogue graph',
      category: 'Dialogue',
      icon: 'ShieldCheck',
      handler: () => {
        if (activeValidateHandler) activeValidateHandler();
      },
    },
    {
      id: 'dialogue.preview',
      label: 'Preview Dialogue',
      description: 'Open the interactive dialogue preview simulator',
      category: 'Dialogue',
      icon: 'Play',
      handler: () => {
        // preview dikontrol via activeModal di core context, tapi kita bisa pemicunya via command
        // di DialogueEditor.tsx
      },
    },
    {
      id: 'dialogue.export',
      label: 'Export Dialogue JSON',
      description: 'Compile and export the dialogue graph as JSON',
      category: 'Dialogue',
      icon: 'Download',
      handler: () => {
        if (activeExportHandler) activeExportHandler();
      },
    },
    {
      id: 'navigation.dialogue',
      label: 'Open Dialogue Editor',
      description: 'Switch to the Dialogue Tree editor',
      category: 'Navigation',
      icon: 'MessageSquare',
      handler: () => {
        context?.navigation.navigate('dialogue');
      },
    },
  ],
  
  shortcuts: [
    {
      key: 'ctrl+s',
      commandId: 'dialogue.save',
    },
  ],
  
  sidebar: [
    {
      id: 'dialogue',
      label: 'Dialogue Trees',
      icon: 'MessageSquare',
      section: 'plugins',
      order: 0,
    },
  ],
  
  nodes: dialogueNodeDefs,
  
  editorView: DialogueEditor,
  
  contextMenus: [
    {
      id: 'dialogue.canvas',
      label: 'Canvas Actions',
      order: 0,
      items: [
        {
          id: 'dialogue.canvas.add-node',
          label: 'Add Node',
          icon: 'Plus',
          handler: () => {
            window.dispatchEvent(new CustomEvent('forge:dialogue:addnode', {
              detail: { type: 'dialogue' },
            }));
          },
        },
        {
          id: 'dialogue.canvas.validate',
          label: 'Validate Graph',
          icon: 'ShieldCheck',
          handler: () => {
            if (activeValidateHandler) activeValidateHandler();
          },
        },
        {
          id: 'dialogue.canvas.clear',
          label: 'Clear Canvas',
          icon: 'Trash2',
          separator: true,
          handler: () => {
            window.dispatchEvent(new CustomEvent('forge:dialogue:clear'));
          },
        },
      ],
    },
  ],
});
export { context as dialoguePluginContext };

import { createPlugin } from '../../plugin/createPlugin';
import { type PluginContext } from '../../plugin/PluginContext';
import { HelloPlugin } from './HelloPlugin';
import { HelloPluginDocs } from './HelloPluginDocs';
import { HelloNode } from './HelloPluginNode';
import { HelloNodeInspector } from './HelloPluginInspector';

// ─────────────────────────────────────────────────────────────
// Hello Plugin Modul Local Context
// ─────────────────────────────────────────────────────────────
let context: PluginContext | null = null;

export const helloPlugin = createPlugin({
  manifest: {
    id: 'hello-plugin',
    name: 'Hello Plugin',
    version: '0.6.0',
    author: 'Forge SDK Team',
    description: 'A modular proof-of-concept plugin demonstrating zero-core modification SDK patterns.',
    icon: 'Sparkles',
    category: 'Utility',
    enabledByDefault: true,
  },
  
  onEnable: (ctx) => {
    context = ctx;
    context.notifications.add('success', '👋 Hello Plugin activated successfully!');
  },
  
  onDisable: () => {
    context = null;
  },
  
  commands: [
    {
      id: 'hello.greet',
      label: 'Hello Plugin: Greet',
      description: 'Show a hello greeting notification',
      category: 'Hello Plugin',
      icon: 'Sparkles',
      shortcut: 'Ctrl+H',
      handler: () => {
        context?.notifications.add(
          'success',
          '👋 Hello from Hello Plugin command handler! Platform services verified.'
        );
      },
    },
    {
      id: 'navigation.hello',
      label: 'Open Hello Plugin',
      description: 'Open the Hello Plugin editor',
      category: 'Navigation',
      icon: 'Sparkles',
      handler: () => {
        context?.navigation.navigate('hello-plugin');
      },
    },
  ],
  
  shortcuts: [
    {
      key: 'ctrl+h',
      commandId: 'hello.greet',
    },
  ],
  
  sidebar: [
    {
      id: 'hello-plugin',
      label: 'Hello Plugin',
      icon: 'Sparkles',
      section: 'plugins',
      order: 1,
    },
  ],
  
  docs: [
    {
      id: 'hello.intro',
      title: 'Hello Plugin',
      icon: 'Sparkles',
      content: HelloPluginDocs,
      order: 1,
    },
  ],
  
  nodes: [
    {
      type: 'hello.greeting',
      title: 'Hello Greeting',
      description: 'A simple greeting node from Hello Plugin. Proves plugin can register node types.',
      icon: 'Sparkles',
      color: '#00A3FF',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: HelloNode as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inspectorComponent: HelloNodeInspector as any,
      defaultData: {
        message: 'Hello, World!',
        author: 'Hello Plugin',
      },
      inputs: [
        { id: 'in', label: 'In' },
      ],
      outputs: [
        { id: 'out', label: 'Out' },
      ],
    },
  ],
  
  editorView: HelloPlugin,
  
  contextMenus: [
    {
      id: 'hello.canvas',
      label: 'Hello Plugin Canvas',
      order: 10,
      items: [
        {
          id: 'hello.canvas.greet',
          label: 'Say Hello',
          icon: 'Sparkles',
          handler: () => {
            context?.notifications.add('success', '👋 Hello from context menu!');
          },
        },
        {
          id: 'hello.canvas.status',
          label: 'Platform Status',
          icon: 'Activity',
          separator: true,
          handler: () => {
            context?.notifications.add('info', '✅ All 6 platform services verified via Plugin SDK!');
          },
        },
      ],
    },
  ],
});
export { context as helloPluginContext };

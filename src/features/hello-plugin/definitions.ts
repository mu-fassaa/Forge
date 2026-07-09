// ─────────────────────────────────────────────────────────────
// Hello Plugin — Node Definitions
// Side-effect import: mendaftarkan semua node Hello Plugin
// ke nodeRegistry global.
//
// Diimport sekali oleh HelloPlugin.tsx.
// ─────────────────────────────────────────────────────────────

import { nodeRegistry } from '../../registry/nodeRegistry';
import { HelloNode } from './HelloPluginNode';
import { HelloNodeInspector } from './HelloPluginInspector';

nodeRegistry.register({
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
});

import { nodeRegistry } from '../../../../../registry/nodeRegistry';
import { DialogueNode } from '../DialogueNode';
import { DialogueInspector } from '../inspectors/DialogueInspector';
import { type DialogueNodeData } from '../../../types/nodes';

nodeRegistry.register({
  type: 'dialogue',
  title: 'Dialogue Card',
  description: 'Karakter berbicara — menampilkan teks percakapan.',
  icon: 'MessageSquare',
  color: '#D946EF',
  component: DialogueNode as any,
  inspectorComponent: DialogueInspector as any,
  defaultData: {
    speaker: 'Karakter',
    text: 'Isi percakapan...',
  } satisfies DialogueNodeData,
  inputs: [{ id: 'in', label: 'In' }],
  outputs: [{ id: 'out', label: 'Out' }],
});

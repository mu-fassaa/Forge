import { nodeRegistry } from '../../../../../registry/nodeRegistry';
import { EndNode } from '../EndNode';
import { EndInspector } from '../inspectors/EndInspector';
import { type EndNodeData } from '../../../types/nodes';

nodeRegistry.register({
  type: 'end',
  title: 'End Conversation',
  description: 'Mengakhiri alur percakapan — selesai, gagal, atau default.',
  icon: 'CircleStop',
  color: '#EF4444',
  component: EndNode as any,
  inspectorComponent: EndInspector as any,
  defaultData: {
    endType: 'default',
  } satisfies EndNodeData,
  inputs: [{ id: 'in', label: 'In' }],
  outputs: [], // End node tidak memiliki output
});

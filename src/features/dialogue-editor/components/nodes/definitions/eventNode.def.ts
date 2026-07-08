import { nodeRegistry } from '../../../../../registry/nodeRegistry';
import { EventNode } from '../EventNode';
import { EventInspector } from '../inspectors/EventInspector';
import { type EventNodeData } from '../../../types/nodes';

nodeRegistry.register({
  type: 'event',
  title: 'Trigger Event',
  description: 'Memicu event ke game engine — quest start, cutscene, dll.',
  icon: 'Zap',
  color: '#10B981',
  component: EventNode as any,
  inspectorComponent: EventInspector as any,
  defaultData: {
    eventName: 'MulaiQuest',
    eventValue: 'quest_id_01',
  } satisfies EventNodeData,
  inputs: [{ id: 'in', label: 'In' }],
  outputs: [{ id: 'out', label: 'Out' }],
});

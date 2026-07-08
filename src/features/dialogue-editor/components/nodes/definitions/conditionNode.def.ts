import { nodeRegistry } from '../../../../../registry/nodeRegistry';
import { ConditionNode } from '../ConditionNode';
import { ConditionInspector } from '../inspectors/ConditionInspector';
import { type ConditionNodeData } from '../../../types/nodes';

nodeRegistry.register({
  type: 'condition',
  title: 'Condition Branch',
  description: 'Percabangan berdasarkan kondisi variabel — True / False.',
  icon: 'GitBranch',
  color: '#F59E0B',
  component: ConditionNode as any,
  inspectorComponent: ConditionInspector as any,
  defaultData: {
    parameter: 'player_gold',
    operator: '==',
    value: '10',
  } satisfies ConditionNodeData,
  inputs: [{ id: 'in', label: 'In' }],
  outputs: [
    { id: 'true', label: 'True' },
    { id: 'false', label: 'False' },
  ],
});

import { nodeRegistry } from '../../../../../registry/nodeRegistry';
import { VariableNode } from '../VariableNode';
import { VariableInspector } from '../inspectors/VariableInspector';
import { type VariableNodeData } from '../../../types/nodes';

nodeRegistry.register({
  type: 'variable',
  title: 'Set Variable',
  description: 'Mengubah nilai variabel game — flag, counter, status.',
  icon: 'Variable',
  color: '#6366F1',
  component: VariableNode as any,
  inspectorComponent: VariableInspector as any,
  defaultData: {
    variableName: 'player_has_met_cat',
    operation: 'set',
    value: 'true',
  } satisfies VariableNodeData,
  inputs: [{ id: 'in', label: 'In' }],
  outputs: [{ id: 'out', label: 'Out' }],
});

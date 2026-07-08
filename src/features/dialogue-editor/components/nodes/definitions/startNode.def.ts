import { nodeRegistry } from '../../../../../registry/nodeRegistry';
import { StartNode } from '../StartNode';
import { StartInspector } from '../inspectors/StartInspector';

nodeRegistry.register({
  type: 'start',
  title: 'Start Node',
  description: 'First node to evaluate - Execution entry point.',
  icon: 'Play',
  color: '#10B981',
  component: StartNode as any,
  inspectorComponent: StartInspector as any,
  defaultData: {},
  inputs: [], // No input handles
  outputs: [{ id: 'out', label: 'Out' }], // 1 output handle
});

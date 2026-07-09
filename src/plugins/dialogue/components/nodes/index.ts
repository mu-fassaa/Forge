import { DialogueNode } from './DialogueNode';
import { ConditionNode } from './ConditionNode';
import { EventNode } from './EventNode';
import { VariableNode } from './VariableNode';
import { EndNode } from './EndNode';

// Pemetaan tipe node kustom dengan komponen React-nya masing-masing
export const nodeTypes = {
  dialogue: DialogueNode,
  condition: ConditionNode,
  event: EventNode,
  variable: VariableNode,
  end: EndNode,
};

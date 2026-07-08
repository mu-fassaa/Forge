export type ValidationErrorType =
  | 'no-start'
  | 'multiple-starts'
  | 'no-output'
  | 'disconnected-choice'
  | 'unreachable'
  | 'circular-loop';

export interface ValidationError {
  nodeId: string;
  type: ValidationErrorType;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Menganalisis graph nodes dan edges untuk mencari error validasi secara generik.
 * Mendukung deteksi no-start, multiple start, disconnected ports, unreachable nodes,
 * dan infinite loop (circular path tanpa dialogue card sebagai pemutus).
 */
export const validateDialogueGraph = (nodes: any[], edges: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  // 1. Validasi Keberadaan Start Node
  const startNodes = nodes.filter((n) => n.type === 'start');
  if (startNodes.length === 0) {
    // Tambahkan error global (nodeId kosong atau dikaitkan ke editor)
    errors.push({
      nodeId: 'global',
      type: 'no-start',
      message: 'Workspace graph has no Start Node.',
      severity: 'error',
    });
  } else if (startNodes.length > 1) {
    startNodes.forEach((n) => {
      errors.push({
        nodeId: n.id,
        type: 'multiple-starts',
        message: 'Multiple Start Nodes detected. Only one is allowed.',
        severity: 'error',
      });
    });
  }

  // 2. Validasi Port Keluaran (Disconnected Ports) per Node
  nodes.forEach((node) => {
    const outgoing = edges.filter((e) => e.source === node.id);

    if (node.type === 'start') {
      if (outgoing.length === 0) {
        errors.push({
          nodeId: node.id,
          type: 'no-output',
          message: 'Start Node must connect to another node.',
          severity: 'error',
        });
      }
    } else if (node.type === 'dialogue') {
      const choices = node.data?.choices || [];
      if (choices.length > 0) {
        // Dialogue dengan banyak pilihan
        choices.forEach((choice: any) => {
          const hasConnection = outgoing.some((e) => e.sourceHandle === choice.id);
          if (!hasConnection) {
            errors.push({
              nodeId: node.id,
              type: 'disconnected-choice',
              message: `Choice option "${choice.text || 'Untitled'}" is not connected.`,
              severity: 'warning',
            });
          }
        });
      } else {
        // Dialogue biasa (single output)
        if (outgoing.length === 0) {
          errors.push({
            nodeId: node.id,
            type: 'no-output',
            message: 'Dialogue Card has no connected output.',
            severity: 'warning',
          });
        }
      }
    } else if (node.type === 'condition') {
      // Condition harus punya koneksi true & false
      const hasTrue = outgoing.some((e) => e.sourceHandle === 'true');
      const hasFalse = outgoing.some((e) => e.sourceHandle === 'false');
      
      if (!hasTrue) {
        errors.push({
          nodeId: node.id,
          type: 'disconnected-choice',
          message: 'Condition branch "True" is not connected.',
          severity: 'warning',
        });
      }
      if (!hasFalse) {
        errors.push({
          nodeId: node.id,
          type: 'disconnected-choice',
          message: 'Condition branch "False" is not connected.',
          severity: 'warning',
        });
      }
    } else if (node.type === 'event' || node.type === 'variable') {
      if (outgoing.length === 0) {
        errors.push({
          nodeId: node.id,
          type: 'no-output',
          message: 'Node has no connected output path.',
          severity: 'warning',
        });
      }
    }
  });

  // 3. Validasi Reachability (Ketercapaian Node)
  if (startNodes.length === 1) {
    const startNodeId = startNodes[0].id;
    const visited = new Set<string>([startNodeId]);
    const queue: string[] = [startNodeId];

    // BFS Traversal
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      // Cari target-target node yang terhubung dari node saat ini
      const outgoingEdges = edges.filter((e) => e.source === currentId);
      outgoingEdges.forEach((edge) => {
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          queue.push(edge.target);
        }
      });
    }

    // Node mana saja yang tidak terkunjungi?
    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        errors.push({
          nodeId: node.id,
          type: 'unreachable',
          message: 'Node is unreachable from the Start Node.',
          severity: 'warning',
        });
      }
    });
  }

  // 4. Deteksi Infinite Loop (Cycle tanpa Dialogue card)
  // Dialogue graph boleh memiliki loop (misal balik ke menu pilihan).
  // Tetapi loop yang hanya berisi Condition, Event, atau Variable node akan
  // menyebabkan infinite loop di runtime karena tidak ada text/input dialogue untuk menahan execution frame.
  const checkInfiniteLoops = () => {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      const outgoing = edges.filter((e) => e.source === nodeId);
      for (const edge of outgoing) {
        const neighbor = edge.target;
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          // Siklus terdeteksi! Periksa apakah di dalam lintasan siklus ini ada Dialogue Card.
          const cycleStartIndex = path.indexOf(neighbor);
          const cyclePath = path.slice(cycleStartIndex);
          
          // Cek apakah ada dialogue node
          const hasDialogueNode = cyclePath.some((id) => {
            const node = nodes.find((n) => n.id === id);
            return node && node.type === 'dialogue';
          });

          if (!hasDialogueNode) {
            // Infinite loop terdeteksi (loop tanpa dialogue card)
            cyclePath.forEach((id) => {
              errors.push({
                nodeId: id,
                type: 'circular-loop',
                message: 'Infinite loop detected: closed cycle containing no Dialogue Cards.',
                severity: 'error',
              });
            });
            return true;
          }
        }
      }

      recStack.delete(nodeId);
      path.pop();
      return false;
    };

    // Jalankan DFS untuk setiap node
    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    });
  };

  if (nodes.length > 0) {
    checkInfiniteLoops();
  }

  return errors;
};

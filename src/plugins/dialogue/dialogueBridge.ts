// ─────────────────────────────────────────────────────────────
// dialogueBridge.ts: memutus circular dependency antara
// DialogueEditor.tsx dan index.ts.
// Menampung global callback bridge secara terpisah.
// ─────────────────────────────────────────────────────────────

export let activeSaveHandler: (() => void) | null = null;
export let activeValidateHandler: (() => void) | null = null;
export let activeExportHandler: (() => void) | null = null;

export const setDialogueHandlers = (handlers: {
  save: () => void;
  validate: () => void;
  export: () => void;
} | null) => {
  if (!handlers) {
    activeSaveHandler = null;
    activeValidateHandler = null;
    activeExportHandler = null;
    return;
  }
  activeSaveHandler = handlers.save;
  activeValidateHandler = handlers.validate;
  activeExportHandler = handlers.export;
};

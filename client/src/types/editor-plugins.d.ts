declare module 'editorjs-drag-drop' {
  interface DragDropOptions {
    editor?: any;
    settings?: {
      backgroundColor?: string;
      borderColor?: string;
    };
  }

  class DragDrop {
    constructor(editor: any, borderStyle?: string);
  }

  export = DragDrop;
}

declare module 'editorjs-undo' {
  interface UndoOptions {
    editor: any;
    maxLength?: number;
    onUpdate?: () => void;
  }

  class Undo {
    constructor(options: UndoOptions);
    initialize(): void;
    destroy(): void;
  }

  export = Undo;
}
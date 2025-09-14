import { InlineTool, API } from '@editorjs/editorjs';

export default class HighlightTool implements InlineTool {
  private api: API;
  private button: HTMLButtonElement | null = null;
  private CSS = {
    highlight: 'highlight'
  };

  static get isInline() {
    return true;
  }

  static get title() {
    return 'Highlight';
  }

  constructor({ api }: { api: API }) {
    this.api = api;
  }

  render(): HTMLButtonElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 19h18v2H3v-2zM13 5.83L15.17 8l-5.34 5.34L8 11.17L13 5.83zm4.24-2.24l1.41-1.41c.78-.78 2.05-.78 2.83 0l2.34 2.34c.78.78.78 2.05 0 2.83l-1.41 1.41L17.24 3.59z" fill="currentColor"/></svg>';
    this.button.classList.add('ce-inline-tool');
    this.button.title = 'Highlight';

    return this.button;
  }

  surround(range: Range): void {
    if (!range) return;

    const selectedText = range.extractContents();
    const highlight = document.createElement('span');
    
    highlight.classList.add(this.CSS.highlight);
    highlight.appendChild(selectedText);
    range.insertNode(highlight);
  }

  checkState(selection: Selection): boolean {
    if (!selection || selection.rangeCount === 0) return false;

    const anchorNode = selection.anchorNode;
    const element = anchorNode?.nodeType === Node.TEXT_NODE 
      ? anchorNode.parentElement 
      : anchorNode as Element;

    return element?.closest(`.${this.CSS.highlight}`) !== null;
  }

  renderActions(): HTMLElement {
    return document.createElement('div');
  }

  clear(): void {
    // Remove highlight from selected text
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const element = range.commonAncestorContainer;
    
    if (element.nodeType === Node.TEXT_NODE) {
      const parent = element.parentElement;
      if (parent?.classList.contains(this.CSS.highlight)) {
        const textNode = document.createTextNode(parent.textContent || '');
        parent.parentNode?.replaceChild(textNode, parent);
      }
    }
  }
}
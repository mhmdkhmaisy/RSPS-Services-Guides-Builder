export default class HighlightTool {
  private api: any;
  private button: HTMLElement | null = null;
  private tag: string = 'SPAN';
  private class: string = 'highlight';

  static get isInline() {
    return true;
  }

  static get title() {
    return 'Highlight';
  }

  get state() {
    return this._state;
  }

  set state(state: boolean) {
    this._state = state;
    if (this.button) {
      this.button.classList.toggle('ce-inline-tool--active', state);
    }
  }

  private _state: boolean = false;

  constructor({ api }: { api: any }) {
    this.api = api;
  }

  render(): HTMLElement {
    this.button = document.createElement('button') as HTMLButtonElement;
    (this.button as HTMLButtonElement).type = 'button';
    this.button.innerHTML = '🖍️';
    this.button.title = 'Highlight';
    this.button.classList.add('ce-inline-tool');

    return this.button;
  }

  surround(range: Range): void {
    if (this.state) {
      this.unwrap(range);
    } else {
      this.wrap(range);
    }
  }

  wrap(range: Range): void {
    const selectedText = range.extractContents();
    const highlight = document.createElement(this.tag);
    
    highlight.classList.add(this.class);
    highlight.appendChild(selectedText);
    range.insertNode(highlight);

    this.api.selection.expandToTag(highlight);
  }

  unwrap(range: Range): void {
    const highlight = this.api.selection.findParentTag(this.tag, this.class);
    if (!highlight) return;

    // Safely unwrap by replacing the highlight element with its content
    const parent = highlight.parentNode;
    if (parent) {
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
    }
  }

  checkState(): boolean {
    const highlight = this.api.selection.findParentTag(this.tag, this.class);
    this.state = !!highlight;
    return this.state;
  }

  static get sanitize() {
    return {
      span: {
        class: 'highlight'
      }
    };
  }
}
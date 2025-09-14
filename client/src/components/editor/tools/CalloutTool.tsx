import { BlockTool, BlockToolData, ToolConfig, API } from '@editorjs/editorjs';

interface CalloutData extends BlockToolData {
  text: string;
  type: 'note' | 'info' | 'warning';
}

export default class CalloutTool implements BlockTool {
  private api: API;
  private data: CalloutData;
  private wrapper: HTMLElement | undefined;

  static get toolbox() {
    return {
      title: 'Callout',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>'
    };
  }

  constructor({ data, api }: { data?: CalloutData; api: API }) {
    this.api = api;
    this.data = data || {
      text: '',
      type: 'note'
    };
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('callout-tool');
    
    const typeSelector = this.createTypeSelector();
    const textArea = this.createTextArea();
    const calloutContainer = this.createCalloutContainer();
    
    this.wrapper.appendChild(typeSelector);
    this.wrapper.appendChild(calloutContainer);
    
    calloutContainer.appendChild(this.createIcon());
    calloutContainer.appendChild(textArea);
    
    this.updateCalloutStyle();
    
    return this.wrapper;
  }

  private createTypeSelector(): HTMLElement {
    const select = document.createElement('select');
    select.classList.add('callout-type-selector');
    select.style.cssText = 'margin-bottom: 8px; padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; background: white;';
    
    const types = [
      { value: 'note', label: 'Note' },
      { value: 'info', label: 'Info' },
      { value: 'warning', label: 'Warning' }
    ];
    
    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type.value;
      option.textContent = type.label;
      option.selected = this.data.type === type.value;
      select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
      this.data.type = (e.target as HTMLSelectElement).value as 'note' | 'info' | 'warning';
      this.updateCalloutStyle();
    });
    
    return select;
  }

  private createCalloutContainer(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('callout-container');
    container.style.cssText = 'display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 8px; border-left: 4px solid;';
    return container;
  }

  private createIcon(): HTMLElement {
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('callout-icon');
    iconContainer.style.cssText = 'flex-shrink: 0; margin-top: 2px;';
    return iconContainer;
  }

  private createTextArea(): HTMLElement {
    const textArea = document.createElement('div');
    textArea.classList.add('callout-text');
    textArea.contentEditable = 'true';
    textArea.style.cssText = 'flex: 1; outline: none; background: transparent; min-height: 20px; line-height: 1.5;';
    textArea.dataset.placeholder = 'Enter your text...';
    
    textArea.innerHTML = this.data.text || '';
    
    textArea.addEventListener('input', () => {
      this.data.text = textArea.innerHTML;
    });
    
    textArea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // Allow Enter key but prevent creating new blocks accidentally
      }
    });
    
    return textArea;
  }

  private updateCalloutStyle(): void {
    if (!this.wrapper) return;
    
    const container = this.wrapper.querySelector('.callout-container') as HTMLElement;
    const icon = this.wrapper.querySelector('.callout-icon') as HTMLElement;
    
    if (!container || !icon) return;
    
    const styles = {
      note: {
        bg: 'rgba(59, 130, 246, 0.1)',
        border: '#3b82f6',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#3b82f6"/></svg>'
      },
      info: {
        bg: 'rgba(6, 182, 212, 0.1)',
        border: '#06b6d4',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#06b6d4"/></svg>'
      },
      warning: {
        bg: 'rgba(245, 158, 11, 0.1)',
        border: '#f59e0b',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#f59e0b"/></svg>'
      }
    };
    
    const style = styles[this.data.type];
    container.style.backgroundColor = style.bg;
    container.style.borderLeftColor = style.border;
    icon.innerHTML = style.icon;
  }

  save(blockContent: HTMLElement): CalloutData {
    const textElement = blockContent.querySelector('.callout-text') as HTMLElement;
    return {
      text: textElement?.innerHTML || '',
      type: this.data.type
    };
  }

  static get sanitize() {
    return {
      text: {
        br: true,
        strong: true,
        em: true,
        u: true
      }
    };
  }
}
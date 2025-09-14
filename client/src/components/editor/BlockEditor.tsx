import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import CodeTool from "@editorjs/code";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import DragDrop from "editorjs-drag-drop";
import Undo from "editorjs-undo";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BlockEditorProps {
  initialData?: any;
  onChange?: (data: any) => void;
  placeholder?: string;
}

export default function BlockEditor({ initialData, onChange, placeholder }: BlockEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!holderRef.current || editorRef.current) return;

    // Normalize data structure to match Editor.js expectations
    const preparedData = initialData && initialData.blocks ? {
      time: initialData.time || Date.now(),
      blocks: initialData.blocks.map((block: any) => {
        // Fix list items - Editor.js expects simple string arrays, not objects
        if (block.type === 'list' && block.data?.items) {
          const normalizedItems = block.data.items.map((item: any) => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item.content) return item.content;
            return String(item);
          });
          return {
            ...block,
            data: {
              ...block.data,
              items: normalizedItems
            }
          };
        }
        return block;
      }),
      version: initialData.version || "2.31.0"
    } : {
      blocks: [],
      time: Date.now(),
      version: "2.31.0"
    };

    console.log('Prepared data for editor:', JSON.stringify(preparedData, null, 2));

    const editor = new EditorJS({
      holder: holderRef.current,
      placeholder: placeholder || "Start writing your guide...",
      data: preparedData,
      tools: {
        header: Header,
        paragraph: Paragraph,
        code: {
          class: CodeTool,
          config: {
            placeholder: "Enter code here...",
          },
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        image: {
          class: Image,
          config: {
            endpoints: {
              byFile: '/api/upload/image',
            },
            field: 'image',
            types: 'image/*',
          },
        },
      },
      onChange: async () => {
        if (onChange && editorRef.current) {
          try {
            const data = await editorRef.current.save();
            onChange(data);
          } catch (error) {
            console.error('Failed to save editor data:', error);
          }
        }
      },
      onReady: () => {
        setIsReady(true);
        // Initialize drag and drop functionality
        new DragDrop(editor);
        // Initialize undo functionality
        new Undo({ editor });
      },
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // Remove the problematic re-render effect - data is now validated during initialization

  return (
    <div className="editor-container">
      <div
        ref={holderRef}
        className="prose-editor min-h-[400px] p-4 focus-within:outline-none"
        data-testid="block-editor"
      />
      
      {/* Add Block Toolbar */}
      <div className="mt-8 p-4 border border-dashed border-border rounded-lg">
        <div className="flex items-center justify-center space-x-4">
          <p className="text-sm text-muted-foreground mr-4">Add a new block:</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.blocks.insert('header', { text: '', level: 2 });
              }
            }}
            data-testid="add-header-button"
            disabled={!isReady}
          >
            <Plus className="w-4 h-4 mr-2" />
            Header
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.blocks.insert('paragraph', { text: '' });
              }
            }}
            data-testid="add-text-button"
            disabled={!isReady}
          >
            <Plus className="w-4 h-4 mr-2" />
            Text
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.blocks.insert('code', { code: '' });
              }
            }}
            data-testid="add-code-button"
            disabled={!isReady}
          >
            <Plus className="w-4 h-4 mr-2" />
            Code
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.blocks.insert('list', { style: 'unordered', items: [''] });
              }
            }}
            data-testid="add-list-button"
            disabled={!isReady}
          >
            <Plus className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </div>
    </div>
  );
}

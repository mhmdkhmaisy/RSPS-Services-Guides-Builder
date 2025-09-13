import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import CodeTool from "@editorjs/code";
import List from "@editorjs/list";
import Image from "@editorjs/image";
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

    const editor = new EditorJS({
      holder: holderRef.current,
      placeholder: placeholder || "Start writing your guide...",
      data: initialData,
      tools: {
        header: {
          class: Header,
          config: {
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2,
          },
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
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

  useEffect(() => {
    if (isReady && initialData && editorRef.current) {
      editorRef.current.render(initialData);
    }
  }, [isReady, initialData]);

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
              // This would be handled by Editor.js built-in functionality
              // Just for visual consistency with the design
            }}
            data-testid="add-header-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Header
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // This would be handled by Editor.js built-in functionality
            }}
            data-testid="add-text-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Text
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // This would be handled by Editor.js built-in functionality
            }}
            data-testid="add-code-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Code
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // This would be handled by Editor.js built-in functionality
            }}
            data-testid="add-image-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Image
          </Button>
        </div>
      </div>
    </div>
  );
}

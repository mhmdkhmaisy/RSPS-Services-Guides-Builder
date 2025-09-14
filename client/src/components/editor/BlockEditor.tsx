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
  guideId?: string; // Used to detect when we're editing a different guide
}

export default function BlockEditor({ initialData, onChange, placeholder, guideId }: BlockEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const hasAppliedInitial = useRef(false);
  const lastGuideId = useRef<string | undefined>(undefined);

  // Initialize editor only once
  useEffect(() => {
    if (!holderRef.current || editorRef.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      placeholder: placeholder || "Start writing your guide...",
      data: { blocks: [], time: Date.now(), version: "2.31.0" }, // Start with empty data
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
        // Initialize editor plugins
        try {
          new DragDrop(editor);
          new Undo({ editor });
        } catch (error) {
          console.error('Failed to initialize editor plugins:', error);
        }
      }
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // Apply initial content only once per guide to prevent re-render loops
  useEffect(() => {
    if (!editorRef.current || !isReady || !initialData) return;
    
    // Only apply initial data if we haven't applied it yet, or if we're editing a different guide
    const guideChanged = guideId !== lastGuideId.current;
    if (hasAppliedInitial.current && !guideChanged) return;

    // Normalize data structure to match Editor.js expectations
    const preparedData = initialData.blocks ? {
      time: initialData.time || Date.now(),
      blocks: initialData.blocks.map((block: any) => {
        // Normalize header blocks
        if (block.type === 'header') {
          const text = block.data?.text || block.data?.content || "";
          const level = Math.max(1, Math.min(6, Number(block.data?.level) || 2));
          return {
            ...block,
            data: { text, level }
          };
        }
        
        // Normalize paragraph blocks
        if (block.type === 'paragraph') {
          const text = block.data?.text || block.data?.content || "";
          return {
            ...block,
            data: { text }
          };
        }
        
        // Normalize code blocks
        if (block.type === 'code') {
          const code = block.data?.code || block.data?.text || "";
          return {
            ...block,
            data: { code }
          };
        }
        
        // Fix list items - Editor.js expects simple string arrays, not objects
        if (block.type === 'list' && block.data?.items) {
          const normalizedItems = block.data.items.map((item: any) => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item.content) return item.content;
            return String(item);
          });
          const style = block.data.style || 'unordered';
          return {
            ...block,
            data: {
              style,
              items: normalizedItems
            }
          };
        }
        
        return block;
      }).filter((block: any) => {
        // Only filter out blocks that are completely empty or invalid
        // Be less aggressive - preserve blocks with whitespace content
        if (block.type === 'header' && (!block.data?.text || block.data.text === '')) return false;
        if (block.type === 'paragraph' && (!block.data?.text || block.data.text === '')) return false;
        if (block.type === 'code' && (!block.data?.code && block.data?.code !== '')) return false; // Keep even empty code blocks
        if (block.type === 'list' && !block.data?.items?.length) return false;
        return true;
      }),
      version: initialData.version || "2.31.0"
    } : {
      blocks: [],
      time: Date.now(),
      version: "2.31.0"
    };

    // Render the prepared data
    editorRef.current.render(preparedData).catch(console.error);
    
    // Mark as applied and remember which guide this was for
    hasAppliedInitial.current = true;
    lastGuideId.current = guideId;
  }, [initialData, isReady, guideId]);

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
                editorRef.current.blocks.insert('header', { text: 'Enter header text...', level: 2 });
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
                editorRef.current.blocks.insert('paragraph', { text: 'Start writing your content...' });
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
                editorRef.current.blocks.insert('code', { code: '// Enter your code here...' });
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
                editorRef.current.blocks.insert('list', { style: 'unordered', items: ['First item', 'Second item'] });
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

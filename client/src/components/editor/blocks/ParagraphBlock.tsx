import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Plus } from "lucide-react";

interface ParagraphBlockProps {
  data: {
    text: string;
  };
  onChange: (data: any) => void;
  onDelete: () => void;
}

export default function ParagraphBlock({ data, onChange, onDelete }: ParagraphBlockProps) {
  const [text, setText] = useState(data.text || "");

  const handleTextChange = (value: string) => {
    setText(value);
    onChange({ ...data, text: value });
  };

  return (
    <div className="editor-block group mb-6" data-block-type="paragraph" data-testid="paragraph-block">
      <div className="flex">
        <div className="block-toolbar mr-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm"
            className="w-6 h-6 p-0 bg-muted hover:bg-muted/80"
            data-testid="button-drag"
          >
            <GripVertical className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-6 h-6 p-0 bg-muted hover:bg-muted/80"
            data-testid="button-add"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Start writing..."
          className="flex-1 border-none bg-transparent text-foreground leading-relaxed resize-none min-h-[60px] focus-visible:ring-0"
          data-testid="textarea-paragraph"
        />
      </div>
    </div>
  );
}

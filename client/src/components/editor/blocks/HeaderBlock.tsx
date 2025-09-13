import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Plus } from "lucide-react";

interface HeaderBlockProps {
  data: {
    text: string;
    level: number;
  };
  onChange: (data: any) => void;
  onDelete: () => void;
}

export default function HeaderBlock({ data, onChange, onDelete }: HeaderBlockProps) {
  const [text, setText] = useState(data.text || "");
  const [level, setLevel] = useState(data.level || 2);

  const handleTextChange = (value: string) => {
    setText(value);
    onChange({ ...data, text: value });
  };

  const handleLevelChange = (value: string) => {
    const newLevel = parseInt(value);
    setLevel(newLevel);
    onChange({ ...data, level: newLevel });
  };

  const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const headerClasses = {
    1: "text-4xl",
    2: "text-3xl", 
    3: "text-2xl",
    4: "text-xl",
    5: "text-lg",
    6: "text-base"
  };

  return (
    <div className="editor-block group mb-6" data-block-type="header" data-testid="header-block">
      <div className="flex items-center">
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
        
        <div className="flex-1 flex items-center space-x-4">
          <Select value={level.toString()} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-20" data-testid="select-header-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1</SelectItem>
              <SelectItem value="2">H2</SelectItem>
              <SelectItem value="3">H3</SelectItem>
              <SelectItem value="4">H4</SelectItem>
              <SelectItem value="5">H5</SelectItem>
              <SelectItem value="6">H6</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter header text..."
            className={`flex-1 border-none bg-transparent ${headerClasses[level as keyof typeof headerClasses]} font-bold text-primary focus-visible:ring-0`}
            data-testid="input-header-text"
          />
        </div>
      </div>
    </div>
  );
}

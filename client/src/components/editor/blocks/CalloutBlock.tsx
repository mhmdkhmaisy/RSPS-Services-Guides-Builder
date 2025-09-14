import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Plus, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface CalloutBlockProps {
  data: {
    text: string;
    type: 'note' | 'info' | 'warning';
  };
  onChange: (data: any) => void;
  onDelete: () => void;
}

const CALLOUT_TYPES = [
  { 
    value: "note", 
    label: "Note", 
    icon: AlertCircle,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400"
  },
  { 
    value: "info", 
    label: "Info", 
    icon: Info,
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30", 
    borderColor: "border-cyan-200 dark:border-cyan-800",
    iconColor: "text-cyan-600 dark:text-cyan-400"
  },
  { 
    value: "warning", 
    label: "Warning", 
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800", 
    iconColor: "text-yellow-600 dark:text-yellow-400"
  }
];

export default function CalloutBlock({ data, onChange, onDelete }: CalloutBlockProps) {
  const [text, setText] = useState(data.text || "");
  const [type, setType] = useState(data.type || "note");

  const handleTextChange = (value: string) => {
    setText(value);
    onChange({ ...data, text: value });
  };

  const handleTypeChange = (value: string) => {
    setType(value as 'note' | 'info' | 'warning');
    onChange({ ...data, type: value });
  };

  const currentType = CALLOUT_TYPES.find(t => t.value === type) || CALLOUT_TYPES[0];
  const IconComponent = currentType.icon;

  return (
    <div className="editor-block group mb-6" data-block-type="callout" data-testid="callout-block">
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
        
        <div className="flex-1">
          <div className="mb-2">
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-32" data-testid="select-callout-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALLOUT_TYPES.map((calloutType) => {
                  const TypeIcon = calloutType.icon;
                  return (
                    <SelectItem key={calloutType.value} value={calloutType.value}>
                      <div className="flex items-center space-x-2">
                        <TypeIcon className={`w-4 h-4 ${calloutType.iconColor}`} />
                        <span>{calloutType.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className={`rounded-lg border-l-4 p-4 ${currentType.bgColor} ${currentType.borderColor}`}>
            <div className="flex items-start space-x-3">
              <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${currentType.iconColor}`} />
              <Textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`Enter ${currentType.label.toLowerCase()} text...`}
                className="border-none bg-transparent text-foreground leading-relaxed resize-none min-h-[60px] focus-visible:ring-0 flex-1"
                data-testid="textarea-callout"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
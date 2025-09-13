import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GripVertical, Plus, Copy } from "lucide-react";

interface CodeBlockProps {
  data: {
    code: string;
    language?: string;
  };
  onChange: (data: any) => void;
  onDelete: () => void;
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "php", label: "PHP" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "sql", label: "SQL" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
];

export default function CodeBlock({ data, onChange, onDelete }: CodeBlockProps) {
  const { toast } = useToast();
  const [code, setCode] = useState(data.code || "");
  const [language, setLanguage] = useState(data.language || "javascript");

  const handleCodeChange = (value: string) => {
    setCode(value);
    onChange({ ...data, code: value });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    onChange({ ...data, language: value });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="editor-block group mb-6" data-block-type="code" data-testid="code-block">
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
        
        <div className="flex-1 code-block">
          <div className="bg-muted rounded-lg overflow-hidden border border-border">
            <div className="flex items-center justify-between bg-secondary px-4 py-2 border-b border-border">
              <div className="flex items-center space-x-2">
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-32 h-8" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="copy-button text-xs hover:bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid="button-copy"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
            <Textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="Enter your code here..."
              className="p-4 border-none bg-transparent font-mono text-sm resize-none min-h-[120px] focus-visible:ring-0"
              data-testid="textarea-code"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

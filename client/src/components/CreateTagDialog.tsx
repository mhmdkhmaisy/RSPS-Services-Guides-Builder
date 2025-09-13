import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import type { Tag, InsertTag } from "@shared/schema";

interface CreateTagDialogProps {
  trigger?: React.ReactNode;
  onTagCreated?: (tag: Tag) => void;
}

export default function CreateTagDialog({ trigger, onTagCreated }: CreateTagDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#58a6ff");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTagMutation = useMutation({
    mutationFn: async (tagData: InsertTag) => {
      const response = await apiRequest("POST", "/api/tags", tagData);
      return response.json() as Promise<Tag>;
    },
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      toast({
        title: "Success",
        description: "Tag created successfully!",
      });
      setIsOpen(false);
      setName("");
      setColor("#58a6ff");
      onTagCreated?.(newTag);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tag",
        variant: "destructive",
      });
    },
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'tag';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Tag name is required",
        variant: "destructive",
      });
      return;
    }

    const tagData: InsertTag = {
      name: name.trim(),
      slug: generateSlug(name.trim()),
      color: color,
    };

    createTagMutation.mutate(tagData);
  };

  const defaultTrigger = (
    <Button data-testid="button-create-tag">
      <Plus className="w-4 h-4 mr-2" />
      Create Tag
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent data-testid="dialog-create-tag">
        <DialogHeader>
          <DialogTitle>Create New Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag-name">Tag Name</Label>
            <Input
              id="tag-name"
              type="text"
              placeholder="Enter tag name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-tag-name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tag-color">Tag Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="tag-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1 border rounded"
                data-testid="input-tag-color"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#58a6ff"
                className="flex-1"
                data-testid="input-tag-color-hex"
              />
            </div>
          </div>

          {name && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div 
                className="inline-block px-2 py-1 rounded text-sm font-medium"
                style={{ 
                  backgroundColor: `${color}20`, 
                  color: color,
                  border: `1px solid ${color}40`
                }}
                data-testid="tag-preview"
              >
                {name}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              data-testid="button-cancel-tag"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTagMutation.isPending || !name.trim()}
              data-testid="button-submit-tag"
            >
              {createTagMutation.isPending ? "Creating..." : "Create Tag"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
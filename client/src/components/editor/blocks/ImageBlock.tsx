import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GripVertical, Plus, Upload, Image as ImageIcon } from "lucide-react";

interface ImageBlockProps {
  data: {
    file?: { url: string };
    url?: string;
    caption?: string;
  };
  onChange: (data: any) => void;
  onDelete: () => void;
}

export default function ImageBlock({ data, onChange, onDelete }: ImageBlockProps) {
  const [url, setUrl] = useState(data.file?.url || data.url || "");
  const [caption, setCaption] = useState(data.caption || "");

  const handleUrlChange = (value: string) => {
    setUrl(value);
    onChange({ ...data, file: { url: value } });
  };

  const handleCaptionChange = (value: string) => {
    setCaption(value);
    onChange({ ...data, caption: value });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you'd upload the file to your server
      // For now, we'll create a local URL for preview
      const localUrl = URL.createObjectURL(file);
      handleUrlChange(localUrl);
    }
  };

  return (
    <div className="editor-block group mb-8" data-block-type="image" data-testid="image-block">
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
          {url ? (
            <figure>
              <img 
                src={url}
                alt={caption || ""}
                className="w-full rounded-lg border border-border max-h-96 object-cover"
                data-testid="image-preview"
              />
              <div className="mt-4 space-y-2">
                <div>
                  <Label htmlFor="caption" className="text-sm font-medium">
                    Caption (optional)
                  </Label>
                  <Input
                    id="caption"
                    type="text"
                    value={caption}
                    onChange={(e) => handleCaptionChange(e.target.value)}
                    placeholder="Add a caption for this image..."
                    className="mt-1"
                    data-testid="input-caption"
                  />
                </div>
                <div>
                  <Label htmlFor="image-url" className="text-sm font-medium">
                    Image URL
                  </Label>
                  <Input
                    id="image-url"
                    type="url"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                    data-testid="input-url"
                  />
                </div>
              </div>
            </figure>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload" className="sr-only">
                    Upload file
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    data-testid="input-file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    data-testid="button-upload"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">or</div>
                
                <div className="max-w-sm mx-auto">
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="Paste image URL..."
                    data-testid="input-url-empty"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

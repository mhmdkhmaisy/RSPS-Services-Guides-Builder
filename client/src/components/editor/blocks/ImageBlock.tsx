import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GripVertical, Plus, Upload, Image as ImageIcon, ZoomIn } from "lucide-react";

interface ImageBlockProps {
  data: {
    file?: { url: string; externalUrl?: string };
    url?: string;
    caption?: string;
  };
  onChange: (data: any) => void;
  onDelete: () => void;
}

export default function ImageBlock({ data, onChange, onDelete }: ImageBlockProps) {
  // Prefer external URL for display, fallback to local URL
  const displayUrl = data.file?.externalUrl || data.file?.url || data.url || "";
  const [url, setUrl] = useState(displayUrl);
  const [caption, setCaption] = useState(data.caption || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    // Preserve existing externalUrl if it exists
    onChange({ 
      ...data, 
      file: { 
        ...data.file,
        url: value 
      } 
    });
  };

  const handleCaptionChange = (value: string) => {
    setCaption(value);
    onChange({ ...data, caption: value });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Create FormData for upload
        const formData = new FormData();
        formData.append('image', file);
        
        // Upload to server
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Update with both local and external URLs
          const imageData = {
            ...data,
            file: {
              url: result.file.url,
              externalUrl: result.file.externalUrl
            }
          };
          onChange(imageData);
          // Use external URL for display if available
          setUrl(result.file.externalUrl || result.file.url);
        } else {
          console.error('Upload failed:', result.message);
          // Fallback to local preview
          const localUrl = URL.createObjectURL(file);
          handleUrlChange(localUrl);
        }
      } catch (error) {
        console.error('Upload error:', error);
        // Fallback to local preview
        const localUrl = URL.createObjectURL(file);
        handleUrlChange(localUrl);
      }
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
              <div className="relative group/image">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer relative">
                      <img 
                        src={url}
                        alt={caption || ""}
                        className="max-w-full h-auto rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                        data-testid="image-preview"
                        style={{ objectFit: 'contain' }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full">
                    <div className="flex items-center justify-center p-4">
                      <img 
                        src={url}
                        alt={caption || ""}
                        className="max-w-full max-h-[80vh] object-contain"
                      />
                    </div>
                    {caption && (
                      <div className="text-center text-sm text-muted-foreground mt-2">
                        {caption}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    data-testid="input-file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
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

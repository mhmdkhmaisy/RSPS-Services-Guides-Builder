import { useState, useEffect } from "react";
import { useLocation, useRoute, useRouter } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import BlockEditor from "@/components/editor/BlockEditor";
import TagFilter from "@/components/TagFilter";
import { apiRequest } from "@/lib/queryClient";
import { Save, Download, Eye, ArrowLeft } from "lucide-react";
import type { GuideWithTags, Tag } from "@shared/schema";

export default function GuideEditorPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute("/guides/:id/edit");
  const isEditing = !!params?.id;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [slug, setSlug] = useState("");
  
  const { data: guide, isLoading: guideLoading } = useQuery<GuideWithTags>({
    queryKey: ["/api/guides", params?.id],
    enabled: isEditing,
  });

  const { data: tags, isLoading: tagsLoading } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  useEffect(() => {
    if (guide) {
      setTitle(guide.title);
      setDescription(guide.description || "");
      setContent(guide.content);
      setSlug(guide.slug);
      setSelectedTags(guide.tags.map(tag => tag.id));
    }
  }, [guide]);

  useEffect(() => {
    if (title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [title]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/guides", data);
      return response.json();
    },
    onSuccess: (newGuide) => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides"] });
      toast({
        title: "Success",
        description: "Guide created successfully!",
      });
      navigate(`/guides/${newGuide.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create guide",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/guides/${params?.id}`, data);
      return response.json();
    },
    onSuccess: (updatedGuide) => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides"] });
      queryClient.setQueryData(["/api/guides", params?.id], updatedGuide);
      toast({
        title: "Success",
        description: "Guide updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update guide",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!content || !content.blocks || content.blocks.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const data = {
      title: title.trim(),
      slug,
      description: description.trim() || null,
      content,
      tagIds: selectedTags,
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleExport = async () => {
    if (!isEditing || !params?.id) return;
    
    try {
      const response = await fetch(`/api/guides/${params.id}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug || guide?.id || 'guide'}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Guide exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export guide",
        variant: "destructive",
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditing && guideLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/guides')} data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
              {isEditing ? "Edit Guide" : "Create Guide"}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing && (
              <>
                <Button variant="outline" onClick={handleExport} data-testid="button-export">
                  <Download className="w-4 h-4 mr-2" />
                  Export HTML
                </Button>
                <Button variant="outline" onClick={() => navigate(`/guides/${params?.id}`)} data-testid="button-preview">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </>
            )}
            <Button 
              onClick={handleSave} 
              disabled={isPending}
              data-testid="button-save"
            >
              <Save className="w-4 h-4 mr-2" />
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guide Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Title *
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter guide title..."
                  data-testid="input-title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Slug
                </label>
                <Input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-friendly-slug"
                  data-testid="input-slug"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the guide..."
                  rows={3}
                  data-testid="textarea-description"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <TagFilter
                tags={tags || []}
                selectedTag=""
                selectedTags={selectedTags}
                onTagSelect={(tagId) => {
                  setSelectedTags(prev => 
                    prev.includes(tagId) 
                      ? prev.filter(id => id !== tagId)
                      : [...prev, tagId]
                  );
                }}
                isLoading={tagsLoading}
                multiSelect
              />
              
              {selectedTags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground mb-2">Selected Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = tags?.find(t => t.id === tagId);
                      return tag ? (
                        <Badge 
                          key={tagId} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => setSelectedTags(prev => prev.filter(id => id !== tagId))}
                          data-testid={`badge-tag-${tag.slug}`}
                        >
                          {tag.name} ×
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-3">
          <Card className="min-h-[600px]">
            <CardContent className="p-6">
              <BlockEditor
                initialData={content}
                onChange={setContent}
                placeholder="Start writing your guide..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

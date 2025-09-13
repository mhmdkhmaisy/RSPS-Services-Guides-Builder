import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import type { Tag } from "@shared/schema";

interface TagFilterProps {
  tags: Tag[];
  selectedTag: string;
  selectedTags?: string[];
  onTagSelect: (tagId: string) => void;
  isLoading?: boolean;
  multiSelect?: boolean;
}

export default function TagFilter({ 
  tags, 
  selectedTag, 
  selectedTags = [],
  onTagSelect, 
  isLoading = false,
  multiSelect = false
}: TagFilterProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-16" />
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No tags available
      </div>
    );
  }

  const handleTagClick = (tagId: string) => {
    if (multiSelect) {
      onTagSelect(tagId);
    } else {
      onTagSelect(selectedTag === tagId ? "" : tagId);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {multiSelect ? "Select Tags" : "Filter by Tag"}
        </p>
        {!multiSelect && selectedTag && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onTagSelect("")}
            data-testid="button-clear-filter"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = multiSelect 
            ? selectedTags.includes(tag.id)
            : selectedTag === tag.id;
            
          return (
            <Badge
              key={tag.id}
              variant={isSelected ? "default" : "secondary"}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              style={
                isSelected 
                  ? { backgroundColor: tag.color || '#58a6ff', color: 'white' }
                  : { backgroundColor: `${tag.color || '#58a6ff'}20`, color: tag.color || '#58a6ff' }
              }
              onClick={() => handleTagClick(tag.id)}
              data-testid={`tag-filter-${tag.slug}`}
            >
              {tag.name}
              {isSelected && multiSelect && (
                <X className="w-3 h-3 ml-1" />
              )}
            </Badge>
          );
        })}
      </div>
      
      {tags.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {tags.length} tag{tags.length !== 1 ? 's' : ''} available
        </p>
      )}
    </div>
  );
}

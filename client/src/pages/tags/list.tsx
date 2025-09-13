import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Tag as TagIcon } from "lucide-react";
import type { Tag } from "@shared/schema";

export default function TagsListPage() {
  const { data: tags, isLoading } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="page-title">All Tags</h1>
          <p className="text-muted-foreground">
            {tags?.length || 0} tags available
          </p>
        </div>
        <Button data-testid="button-create-tag">
          <Plus className="w-4 h-4 mr-2" />
          Create Tag
        </Button>
      </div>

      {/* Tags Grid */}
      {tags?.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-muted-foreground mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <TagIcon className="w-8 h-8" />
              </div>
              <p>No tags created yet. Create your first tag to get started!</p>
            </div>
            <Button data-testid="button-create-first-tag">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Tag
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags?.map((tag) => (
            <Card key={tag.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate" data-testid={`tag-name-${tag.slug}`}>
                    {tag.name}
                  </span>
                  <Badge 
                    variant="secondary" 
                    style={{ 
                      backgroundColor: `${tag.color || '#58a6ff'}20`, 
                      color: tag.color || '#58a6ff' 
                    }}
                    data-testid={`tag-color-${tag.slug}`}
                  >
                    {tag.slug}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" data-testid={`button-view-guides-${tag.slug}`} asChild>
                  <Link href={`/guides?tag=${tag.id}`}>
                    View Guides
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
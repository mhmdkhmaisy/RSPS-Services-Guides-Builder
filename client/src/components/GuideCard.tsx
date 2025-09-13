import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Eye, Edit, Download } from "lucide-react";
import type { GuideWithTags } from "@shared/schema";

interface GuideCardProps {
  guide: GuideWithTags;
  viewMode: "grid" | "list";
}

export default function GuideCard({ guide, viewMode }: GuideCardProps) {
  const handleExport = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/guides/${guide.id}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${guide.slug || guide.id}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:bg-muted/20 transition-colors" data-testid={`guide-card-${guide.id}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Link href={`/guides/${guide.id}`}>
                    <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate" data-testid={`guide-title-${guide.id}`}>
                      {guide.title}
                    </h3>
                  </Link>
                  {guide.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid={`guide-description-${guide.id}`}>
                      {guide.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    {guide.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="secondary"
                        style={{ backgroundColor: `${tag.color || '#58a6ff'}20`, color: tag.color || '#58a6ff' }}
                        className="text-xs"
                        data-testid={`badge-tag-${tag.slug}`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {guide.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{guide.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  {guide.createdAt && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(guide.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Link href={`/guides/${guide.id}`}>
                <Button variant="ghost" size="sm" data-testid={`button-view-${guide.id}`}>
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
              <Link href={`/guides/${guide.id}/edit`}>
                <Button variant="ghost" size="sm" data-testid={`button-edit-${guide.id}`}>
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleExport} data-testid={`button-export-${guide.id}`}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:bg-muted/20 transition-colors cursor-pointer" data-testid={`guide-card-${guide.id}`}>
      <Link href={`/guides/${guide.id}`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground hover:text-primary transition-colors" data-testid={`guide-title-${guide.id}`}>
            {guide.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {guide.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`guide-description-${guide.id}`}>
              {guide.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2 flex-wrap">
              {guide.tags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="secondary"
                  style={{ backgroundColor: `${tag.color || '#58a6ff'}20`, color: tag.color || '#58a6ff' }}
                  className="text-xs"
                  data-testid={`badge-tag-${tag.slug}`}
                >
                  {tag.name}
                </Badge>
              ))}
              {guide.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{guide.tags.length - 2}
                </Badge>
              )}
            </div>
            {guide.createdAt && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(guide.createdAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

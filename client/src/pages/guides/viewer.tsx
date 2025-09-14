import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import TOC from "@/components/TOC";
import { ArrowLeft, Edit, Download, Share2, Copy, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import type { GuideWithTags } from "@shared/schema";

export default function GuideViewerPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [, params] = useRoute("/guides/:id");
  
  const { data: guide, isLoading } = useQuery<GuideWithTags>({
    queryKey: ["/api/guides", params?.id],
  });

  const handleExport = async () => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/guides/${params.id}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${guide?.slug || guide?.id || 'guide'}.html`;
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

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "Guide link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex">
          <aside className="w-80 bg-card border-r border-border h-screen sticky top-16 overflow-y-auto p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-full mb-6" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </aside>
          <main className="flex-1 p-8">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Guide Not Found</h1>
        <p className="text-muted-foreground mb-6">The guide you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/guides')} data-testid="button-back-to-guides">
          Back to Guides
        </Button>
      </div>
    );
  }

  const blocks = (guide?.content as any)?.blocks || [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex">
        {/* Sidebar TOC */}
        <TOC blocks={blocks} />

        {/* Main Content */}
        <main className="flex-1 min-h-screen bg-background">
          {/* Guide Header */}
          <div className="sticky top-16 bg-background/95 backdrop-blur border-b border-border z-40">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" onClick={() => navigate('/guides')} data-testid="button-back">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground" data-testid="guide-title">
                      {guide.title}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex space-x-2">
                        {guide.tags.map((tag) => (
                          <Badge 
                            key={tag.id} 
                            variant="secondary"
                            style={{ backgroundColor: `${tag.color || '#58a6ff'}20`, color: tag.color || '#58a6ff' }}
                            data-testid={`badge-tag-${tag.slug}`}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      {guide.createdAt && (
                        <span className="text-sm text-muted-foreground">
                          Created {format(new Date(guide.createdAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleCopyLink} size="sm" data-testid="button-copy-link">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={handleExport} size="sm" data-testid="button-export">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => navigate(`/guides/${params?.id}/edit`)} size="sm" data-testid="button-edit">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Guide Content */}
          <div className="px-8 py-6">
            <div className="max-w-4xl mx-auto prose-editor">
              {guide.description && (
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed" data-testid="guide-description">
                  {guide.description}
                </p>
              )}

              {blocks.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground">This guide has no content yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {blocks.map((block: any, index: number) => (
                    <GuideBlock key={index} block={block} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface GuideBlockProps {
  block: any;
  index: number;
}

function GuideBlock({ block, index }: GuideBlockProps) {
  const { toast } = useToast();

  const handleCopyCode = async (code: string) => {
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

  switch (block.type) {
    case 'header':
      const level = block.data.level || 2;
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
        <HeaderTag 
          id={`section-${index}`}
          className={`font-bold text-primary ${headerClasses[level as keyof typeof headerClasses] || 'text-2xl'} mt-8 mb-4`}
          data-testid={`header-${index}`}
        >
          {block.data.text}
        </HeaderTag>
      );

    case 'paragraph':
      return (
        <p 
          className="text-foreground leading-relaxed mb-4" 
          dangerouslySetInnerHTML={{ __html: block.data.text }}
          data-testid={`paragraph-${index}`}
        />
      );

    case 'code':
      return (
        <div className="code-block relative mb-6" data-testid={`code-${index}`}>
          <div className="bg-muted rounded-lg overflow-hidden border border-border">
            <div className="flex items-center justify-between bg-secondary px-4 py-2 border-b border-border">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {block.data.language || 'code'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyCode(block.data.code)}
                className="copy-button text-xs hover:bg-primary/20"
                data-testid={`button-copy-${index}`}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm text-foreground">
                {block.data.code}
              </code>
            </pre>
          </div>
        </div>
      );

    case 'image':
      return (
        <figure className="my-8" data-testid={`image-${index}`}>
          <img 
            src={block.data.file?.url || block.data.url}
            alt={block.data.caption || ''}
            className="w-full rounded-lg border border-border"
          />
          {block.data.caption && (
            <figcaption className="text-sm text-muted-foreground mt-2 text-center italic">
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'list':
      const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag className="mb-4 pl-6 space-y-1" data-testid={`list-${index}`}>
          {block.data.items.map((item: any, itemIndex: number) => (
            <li key={itemIndex} className="text-foreground">
              {typeof item === 'string' ? item : (item?.content || item?.text || String(item))}
            </li>
          ))}
        </ListTag>
      );

    case 'callout':
      const calloutStyles = {
        note: {
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-800',
          icon: AlertCircle,
          iconColor: 'text-blue-600 dark:text-blue-400'
        },
        info: {
          bg: 'bg-cyan-50 dark:bg-cyan-950/30',
          border: 'border-cyan-200 dark:border-cyan-800',
          icon: Info,
          iconColor: 'text-cyan-600 dark:text-cyan-400'
        },
        warning: {
          bg: 'bg-yellow-50 dark:bg-yellow-950/30',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        }
      };
      
      const calloutType = block.data.type || 'note';
      const style = calloutStyles[calloutType as keyof typeof calloutStyles] || calloutStyles.note;
      const IconComponent = style.icon;
      
      return (
        <div 
          className={`rounded-lg border-l-4 p-4 mb-6 ${style.bg} ${style.border}`}
          data-testid={`callout-${index}`}
        >
          <div className="flex items-start space-x-3">
            <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
            <div 
              className="text-foreground leading-relaxed flex-1"
              dangerouslySetInnerHTML={{ __html: block.data.text }}
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-muted rounded-lg border border-border" data-testid={`unknown-${index}`}>
          <p className="text-muted-foreground text-sm">
            Unknown block type: {block.type}
          </p>
        </div>
      );
  }
}

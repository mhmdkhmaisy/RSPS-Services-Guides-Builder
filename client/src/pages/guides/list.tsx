import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import GuideCard from "@/components/GuideCard";
import TagFilter from "@/components/TagFilter";
import { Search, Plus, Grid, List } from "lucide-react";
import type { GuideWithTags, Tag } from "@shared/schema";

export default function GuidesListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: guides, isLoading: guidesLoading, isFetching } = useQuery<GuideWithTags[]>({
    queryKey: ["/api/guides", debouncedSearchQuery, selectedTag],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (selectedTag) params.append('tag', selectedTag);
      
      const url = `/api/guides${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch guides');
      }
      return await response.json() as GuideWithTags[];
    },
    placeholderData: (previousData) => previousData,
  });

  const { data: tags, isLoading: tagsLoading } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (guidesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
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
                <div className="flex space-x-2 mb-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
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
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="page-title">All Guides</h1>
          <p className="text-muted-foreground">
            {guides?.length || 0} guides available
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              data-testid="button-grid-view"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              data-testid="button-list-view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Link href="/guides/new">
            <Button data-testid="button-create-guide">
              <Plus className="w-4 h-4 mr-2" />
              Create Guide
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
          {isFetching && !guidesLoading && (
            <div className="absolute right-3 top-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <TagFilter
          tags={tags || []}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          isLoading={tagsLoading}
        />
      </div>

      {/* Guides Grid/List */}
      {guides?.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-muted-foreground mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              {debouncedSearchQuery || selectedTag ? (
                <p>No guides found matching your criteria.</p>
              ) : (
                <p>No guides created yet. Create your first guide to get started!</p>
              )}
            </div>
            {!debouncedSearchQuery && !selectedTag && (
              <Link href="/guides/new">
                <Button data-testid="button-create-first-guide">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Guide
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {guides?.map((guide) => (
            <GuideCard key={guide.id} guide={guide} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}

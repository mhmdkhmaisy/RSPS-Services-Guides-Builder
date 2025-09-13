import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TOCProps {
  blocks: any[];
}

export default function TOC({ blocks }: TOCProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const headers = useMemo(() => {
    return blocks
      .map((block, index) => {
        if (block.type === 'header') {
          return {
            id: `section-${index}`,
            text: block.data.text,
            level: block.data.level || 2,
            index,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [blocks]);

  const filteredHeaders = useMemo(() => {
    if (!searchQuery) return headers;
    return headers.filter(header => 
      header?.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [headers, searchQuery]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="w-80 bg-card border-r border-border h-screen sticky top-16 overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground" data-testid="toc-title">
            Table of Contents
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground text-sm w-4 h-4" />
            <Input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-toc-search"
            />
          </div>
        </div>

        <nav className="space-y-1">
          {filteredHeaders.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              {searchQuery ? 'No sections found' : 'No sections available'}
            </div>
          ) : (
            filteredHeaders.map((header) => {
              if (!header) return null;
              const paddingLeft = `${(header.level - 1) * 0.75}rem`;
              return (
                <button
                  key={header.id}
                  onClick={() => scrollToSection(header.id)}
                  className="w-full text-left py-2 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  style={{ paddingLeft }}
                  data-testid={`toc-link-${header.index}`}
                >
                  {header.text}
                </button>
              );
            })
          )}
        </nav>

        {blocks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Total sections:</span>
                <span>{headers.length}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Total blocks:</span>
                <span>{blocks.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

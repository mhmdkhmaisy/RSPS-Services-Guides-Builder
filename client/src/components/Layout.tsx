import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Tag, Download, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <h1 className="text-xl font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors" data-testid="app-title">
                  RSPS Guide Builder
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/guides">
                  <a className={`transition-colors ${location === '/' || location === '/guides' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-guides">
                    <BookOpen className="inline w-4 h-4 mr-1" />
                    Guides
                  </a>
                </Link>
                <Link href="/tags">
                  <a className={`transition-colors ${location === '/tags' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-tags">
                    <Tag className="inline w-4 h-4 mr-1" />
                    Tags
                  </a>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/guides/new">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" data-testid="button-new-guide">
                  <Plus className="w-4 h-4 mr-2" />
                  New Guide
                </Button>
              </Link>
              <Button variant="secondary" size="icon" data-testid="button-user">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import GuidesListPage from "@/pages/guides/list";
import GuideEditorPage from "@/pages/guides/editor";
import GuideViewerPage from "@/pages/guides/viewer";
import Layout from "@/components/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={GuidesListPage} />
        <Route path="/guides" component={GuidesListPage} />
        <Route path="/guides/new" component={GuideEditorPage} />
        <Route path="/guides/:id/edit" component={GuideEditorPage} />
        <Route path="/guides/:id" component={GuideViewerPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

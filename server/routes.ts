import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGuideSchema, insertTagSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Guide routes
  app.get("/api/guides", async (req, res) => {
    try {
      const { search, tag } = req.query;
      let guides;

      if (search && typeof search === 'string') {
        guides = await storage.searchGuides(search);
      } else if (tag && typeof tag === 'string') {
        guides = await storage.getGuidesByTag(tag);
      } else {
        guides = await storage.getGuides();
      }

      res.json(guides);
    } catch (error) {
      console.error("Error fetching guides:", error);
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  app.get("/api/guides/:id", async (req, res) => {
    try {
      const guide = await storage.getGuide(req.params.id);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.json(guide);
    } catch (error) {
      console.error("Error fetching guide:", error);
      res.status(500).json({ message: "Failed to fetch guide" });
    }
  });

  app.get("/api/guides/slug/:slug", async (req, res) => {
    try {
      const guide = await storage.getGuideBySlug(req.params.slug);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.json(guide);
    } catch (error) {
      console.error("Error fetching guide:", error);
      res.status(500).json({ message: "Failed to fetch guide" });
    }
  });

  app.post("/api/guides", async (req, res) => {
    try {
      const { tagIds, ...guideData } = req.body;
      const validatedData = insertGuideSchema.parse(guideData);
      const guide = await storage.createGuide(validatedData, tagIds);
      res.status(201).json(guide);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating guide:", error);
      res.status(500).json({ message: "Failed to create guide" });
    }
  });

  app.put("/api/guides/:id", async (req, res) => {
    try {
      const { tagIds, ...guideData } = req.body;
      const validatedData = insertGuideSchema.partial().parse(guideData);
      const guide = await storage.updateGuide(req.params.id, validatedData, tagIds);
      res.json(guide);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating guide:", error);
      res.status(500).json({ message: "Failed to update guide" });
    }
  });

  app.delete("/api/guides/:id", async (req, res) => {
    try {
      await storage.deleteGuide(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting guide:", error);
      res.status(500).json({ message: "Failed to delete guide" });
    }
  });

  app.get("/api/guides/:id/export", async (req, res) => {
    try {
      const guide = await storage.getGuide(req.params.id);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }

      const html = generateHtmlExport(guide);
      const filename = `${guide.slug || guide.id}.html`;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(html);
    } catch (error) {
      console.error("Error exporting guide:", error);
      res.status(500).json({ message: "Failed to export guide" });
    }
  });

  // Tag routes
  app.get("/api/tags", async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.get("/api/tags/:id", async (req, res) => {
    try {
      const tag = await storage.getTag(req.params.id);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      res.json(tag);
    } catch (error) {
      console.error("Error fetching tag:", error);
      res.status(500).json({ message: "Failed to fetch tag" });
    }
  });

  app.post("/api/tags", async (req, res) => {
    try {
      const validatedData = insertTagSchema.parse(req.body);
      const tag = await storage.createTag(validatedData);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating tag:", error);
      res.status(500).json({ message: "Failed to create tag" });
    }
  });

  app.put("/api/tags/:id", async (req, res) => {
    try {
      const validatedData = insertTagSchema.partial().parse(req.body);
      const tag = await storage.updateTag(req.params.id, validatedData);
      res.json(tag);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating tag:", error);
      res.status(500).json({ message: "Failed to update tag" });
    }
  });

  app.delete("/api/tags/:id", async (req, res) => {
    try {
      await storage.deleteTag(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tag:", error);
      res.status(500).json({ message: "Failed to delete tag" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateHtmlExport(guide: any): string {
  const blocks = guide.content?.blocks || [];
  
  let contentHtml = '';
  blocks.forEach((block: any, index: number) => {
    switch (block.type) {
      case 'header':
        const level = block.data.level || 2;
        contentHtml += `<h${level} id="section-${index}">${block.data.text}</h${level}>`;
        break;
      case 'paragraph':
        contentHtml += `<p>${block.data.text}</p>`;
        break;
      case 'code':
        contentHtml += `
          <div class="code-block">
            <pre><code class="language-${block.data.language || 'javascript'}">${block.data.code}</code></pre>
          </div>
        `;
        break;
      case 'image':
        contentHtml += `
          <figure>
            <img src="${block.data.file.url}" alt="${block.data.caption || ''}" />
            ${block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : ''}
          </figure>
        `;
        break;
    }
  });

  const tags = guide.tags?.map((tag: any) => `<span class="tag" style="background-color: ${tag.color}20; color: ${tag.color}; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem;">${tag.name}</span>`).join('') || '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${guide.title} - RSPS Guide</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <style>
        body {
            background-color: hsl(220 13% 5%);
            color: hsl(213 31% 81%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        h1, h2, h3, h4, h5, h6 {
            color: hsl(217 91% 68%);
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        .code-block {
            margin: 1.5rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }
        .tags {
            margin-bottom: 2rem;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        pre {
            margin: 0;
            padding: 1rem;
            background-color: hsl(217 19% 11%) !important;
        }
        code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        figure {
            margin: 2rem 0;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
        }
        figcaption {
            text-align: center;
            color: hsl(213 20% 63%);
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }
    </style>
</head>
<body>
    <header>
        <h1>${guide.title}</h1>
        ${guide.description ? `<p style="color: hsl(213 20% 63%); font-size: 1.125rem;">${guide.description}</p>` : ''}
        <div class="tags">${tags}</div>
    </header>
    <main>
        ${contentHtml}
    </main>
    <footer style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid hsl(217 19% 19%); color: hsl(213 20% 63%); font-size: 0.875rem;">
        <p>Exported from RSPS Guide Builder on ${new Date().toLocaleDateString()}</p>
    </footer>
</body>
</html>
  `;
}

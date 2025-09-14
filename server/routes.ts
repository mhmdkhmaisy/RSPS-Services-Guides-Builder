import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGuideSchema, insertTagSchema } from "@shared/schema";
import { ZodError } from "zod";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/images');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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

  // Image upload endpoint
  app.post("/api/upload/image", upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }

      // Return the file URL in the format expected by Editor.js
      const fileUrl = `/uploads/images/${req.file.filename}`;
      
      res.json({
        success: 1,
        file: {
          url: fileUrl
        }
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ 
        success: 0,
        message: "Failed to upload image" 
      });
    }
  });

  // Serve uploaded images as static files
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  const httpServer = createServer(app);
  return httpServer;
}

function generateHtmlExport(guide: any): string {
  const blocks = guide.content?.blocks || [];
  
  // Extract headers for TOC
  const headers = blocks
    .map((block: any, index: number) => {
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

  // Generate TOC HTML
  const tocHtml = headers.length > 0 ? `
    <div class="toc-container">
      <h2>Table of Contents</h2>
      <nav class="toc-nav">
        ${headers.map((header: any) => {
          const paddingLeft = (header.level - 1) * 0.75;
          return `
            <a href="#${header.id}" class="toc-link" style="padding-left: ${paddingLeft}rem;">
              ${header.text}
            </a>
          `;
        }).join('')}
      </nav>
      <div class="toc-stats">
        <div class="stat">
          <span>Total sections:</span>
          <span>${headers.length}</span>
        </div>
        <div class="stat">
          <span>Total blocks:</span>
          <span>${blocks.length}</span>
        </div>
      </div>
    </div>
  ` : '';
  
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
        const codeId = `code-${index}`;
        contentHtml += `
          <div class="code-block">
            <div class="code-header">
              <span class="code-language">${block.data.language || 'code'}</span>
              <button class="copy-btn" onclick="copyCode('${codeId}')" title="Copy code">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                </svg>
                Copy
              </button>
            </div>
            <pre><code id="${codeId}" class="language-${block.data.language || 'javascript'}">${block.data.code}</code></pre>
          </div>
        `;
        break;
      case 'list':
        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
        const items = block.data.items?.map((item: any) => 
          `<li>${typeof item === 'string' ? item : (item?.content || item?.text || String(item))}</li>`
        ).join('') || '';
        contentHtml += `<${ListTag}>${items}</${ListTag}>`;
        break;
      case 'image':
        contentHtml += `
          <figure>
            <img src="${block.data.file?.url || block.data.url}" alt="${block.data.caption || ''}" />
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
        * {
            box-sizing: border-box;
        }
        body {
            background-color: hsl(220 13% 5%);
            color: hsl(213 31% 81%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            margin: 0;
            padding: 0;
        }
        .container {
            display: flex;
            max-width: 1400px;
            margin: 0 auto;
        }
        .toc-container {
            width: 300px;
            background-color: hsl(217 19% 11%);
            border-right: 1px solid hsl(217 19% 19%);
            padding: 2rem;
            height: 100vh;
            overflow-y: auto;
            position: sticky;
            top: 0;
        }
        .toc-container h2 {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: hsl(213 31% 81%);
        }
        .toc-nav {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .toc-link {
            display: block;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            color: hsl(213 20% 63%);
            text-decoration: none;
            border-radius: 0.375rem;
            transition: all 0.2s ease;
        }
        .toc-link:hover {
            color: hsl(213 31% 81%);
            background-color: hsl(217 19% 19%);
        }
        .toc-stats {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid hsl(217 19% 19%);
        }
        .stat {
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            color: hsl(213 20% 63%);
            margin-bottom: 0.25rem;
        }
        .main-content {
            flex: 1;
            padding: 2rem;
            min-width: 0;
        }
        h1, h2, h3, h4, h5, h6 {
            color: hsl(217 91% 68%);
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 700;
            line-height: 1.2;
        }
        h1 { font-size: 2.25rem; }
        h2 { font-size: 1.875rem; }
        h3 { font-size: 1.5rem; }
        h4 { font-size: 1.25rem; }
        h5 { font-size: 1.125rem; }
        h6 { font-size: 1rem; }
        .code-block {
            margin: 1.5rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
            background-color: hsl(217 19% 11%);
            border: 1px solid hsl(217 19% 19%);
        }
        .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 1rem;
            background-color: hsl(217 19% 19%);
            border-bottom: 1px solid hsl(217 19% 19%);
        }
        .code-language {
            font-size: 0.75rem;
            color: hsl(213 20% 63%);
            font-weight: 500;
        }
        .copy-btn {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.5rem;
            background: transparent;
            color: hsl(213 31% 81%);
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.75rem;
            transition: background-color 0.2s ease;
        }
        .copy-btn:hover {
            background-color: hsl(217 19% 11%);
        }
        .copy-btn svg {
            width: 12px;
            height: 12px;
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
            overflow-x: auto;
        }
        code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
        }
        figure {
            margin: 2rem 0;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            border: 1px solid hsl(217 19% 19%);
        }
        figcaption {
            text-align: center;
            color: hsl(213 20% 63%);
            font-size: 0.875rem;
            margin-top: 0.5rem;
            font-style: italic;
        }
        ol, ul {
            margin: 1rem 0;
            padding-left: 1.5rem;
        }
        li {
            margin: 0.25rem 0;
            color: hsl(213 31% 81%);
        }
        p {
            margin: 1rem 0;
        }
        .footer {
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid hsl(217 19% 19%);
            color: hsl(213 20% 63%);
            font-size: 0.875rem;
        }
        
        /* Responsive design */
        @media (max-width: 1024px) {
            .container {
                flex-direction: column;
            }
            .toc-container {
                width: 100%;
                height: auto;
                position: relative;
                border-right: none;
                border-bottom: 1px solid hsl(217 19% 19%);
            }
        }
        
        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }
        
        /* Copy feedback */
        .copy-success {
            color: hsl(142 71% 45%) !important;
        }
    </style>
</head>
<body>
    <div class="container">
        ${tocHtml}
        <div class="main-content">
            <header>
                <h1>${guide.title}</h1>
                ${guide.description ? `<p style="color: hsl(213 20% 63%); font-size: 1.125rem; margin-bottom: 1rem;">${guide.description}</p>` : ''}
                <div class="tags">${tags}</div>
            </header>
            <main>
                ${contentHtml}
            </main>
            <div class="footer">
                <p>Exported from RSPS Guide Builder on ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    </div>
    
    <script>
        function copyCode(codeId) {
            const codeElement = document.getElementById(codeId);
            const button = event.target.closest('.copy-btn');
            
            if (codeElement) {
                navigator.clipboard.writeText(codeElement.textContent).then(() => {
                    const originalText = button.innerHTML;
                    button.innerHTML = \`
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Copied!
                    \`;
                    button.classList.add('copy-success');
                    
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.classList.remove('copy-success');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy code:', err);
                });
            }
        }
        
        // Initialize Prism.js after page load
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        });
    </script>
</body>
</html>
  `;
}

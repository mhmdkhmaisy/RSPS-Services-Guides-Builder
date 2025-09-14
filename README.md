# RSPS Guide Builder

A powerful Notion-style content management system designed specifically for creating, editing, and organizing gaming guides. Built with a modern tech stack featuring React frontend and Express backend, providing a rich block-based editor for creating structured content.

## 🎮 Overview

RSPS Guide Builder is perfect for gaming communities, particularly RuneScape Private Server (RSPS) developers and players who need to create comprehensive guides with support for multiple content types including headers, paragraphs, code blocks, lists, and images. The application features a clean, dark-themed interface with powerful search and tagging capabilities.

## ✨ Features

### Content Management
- **Block-Based Editor**: Rich text editor supporting multiple content types
- **Multiple Block Types**: Headers (H1-H6), paragraphs, code blocks, lists, and images
- **Real-time Editing**: Live preview and auto-save functionality
- **Export Functionality**: Generate standalone HTML files for guides

### Organization & Discovery
- **Smart Tagging System**: Color-coded tags with many-to-many relationships
- **Full-Text Search**: Search across guide titles and descriptions
- **Advanced Filtering**: Filter guides by tags and search queries
- **Table of Contents**: Dynamic TOC generation from header blocks

### User Experience
- **Dark Theme**: Professional dark interface with blue accent colors
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Drag & Drop**: Reorder blocks with intuitive drag and drop
- **Undo/Redo**: Full editing history with keyboard shortcuts

## 🏗️ System Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **Shadcn/UI** components built on Radix UI primitives
- **Tailwind CSS** for utility-first styling
- **Editor.js** for the block-based content editor

### Backend
- **Express.js** with TypeScript in ESM module format
- **RESTful API** design with comprehensive CRUD operations
- **PostgreSQL** database with Neon serverless driver
- **Drizzle ORM** for type-safe database operations
- **Structured error handling** and request logging middleware

### Database
- **PostgreSQL** with comprehensive schema design
- **Tables**: Users, Guides, Tags, and GuideTag relationships
- **JSON Storage** for flexible block-based editor content
- **UUID Primary Keys** for scalable identification
- **Automatic Timestamps** for created/updated tracking

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Frontend Framework | React 18 + TypeScript | Component-based UI with type safety |
| Build Tool | Vite | Fast development server and optimized builds |
| Routing | Wouter | Lightweight client-side routing |
| State Management | TanStack Query | Server state management and caching |
| UI Components | Shadcn/UI + Radix UI | Accessible, unstyled UI primitives |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Editor | Editor.js | Block-based rich text editor |
| Backend | Express.js + TypeScript | Web server and API |
| Database | PostgreSQL (Neon) | Serverless PostgreSQL database |
| ORM | Drizzle ORM | Type-safe database operations |
| Validation | Zod | Schema validation |
| Development | TSX + ESBuild | TypeScript execution and building |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (LTS version recommended)
- npm or yarn package manager
- PostgreSQL database (or Neon account for hosted solution)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rsps-guide-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/rsps_guide_builder
   NODE_ENV=development
   ```

4. **Database Setup**
   
   **Option A: Local PostgreSQL**
   ```bash
   # Create database
   createdb rsps_guide_builder
   
   # Push schema to database
   npm run db:push
   ```
   
   **Option B: Neon (Recommended)**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string to your `.env` file
   - Run: `npm run db:push`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:5000](http://localhost:5000) in your browser

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push database schema changes |

## 🗂️ Project Structure

```
rsps-guide-builder/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── editor/         # Editor-specific components
│   │   │   │   ├── blocks/     # Individual block type components
│   │   │   │   └── BlockEditor.tsx
│   │   │   └── ui/             # Shadcn/UI components
│   │   ├── pages/              # Route-based page components
│   │   │   ├── guides/         # Guide-related pages
│   │   │   └── tags/           # Tag management pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility libraries
│   │   ├── api/                # API client functions
│   │   └── types/              # TypeScript type definitions
│   ├── index.html              # HTML entry point
│   └── vite.config.ts          # Vite configuration
├── server/                     # Backend Express application
│   ├── index.ts                # Server entry point
│   ├── routes.ts               # API route definitions
│   ├── db.ts                   # Database connection
│   └── storage.ts              # File storage utilities
├── shared/                     # Shared code between client/server
│   └── schema.ts               # Database schema and types
├── package.json                # Project dependencies and scripts
├── drizzle.config.ts          # Database ORM configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## 🎨 Design System

The application uses a comprehensive design system built on:
- **Color Palette**: Dark theme with blue accent colors
- **Typography**: Inter font family with proper font weights
- **Spacing**: Consistent spacing using Tailwind's scale
- **Components**: Accessible components following modern design patterns
- **Icons**: Lucide React for consistent iconography

### Theme Variables
```css
/* Dark theme color scheme */
--background: hsl(220, 13%, 5%)
--foreground: hsl(213, 31%, 81%)
--primary: hsl(217, 91%, 68%)
--secondary: hsl(217, 19%, 19%)
--muted: hsl(217, 19%, 11%)
--border: hsl(217, 19%, 19%)
```

## 📊 Database Schema

### Guides Table
```sql
CREATE TABLE guides (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  content JSON NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tags Table
```sql
CREATE TABLE tags (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#58a6ff'
);
```

### Guide Tags (Many-to-Many)
```sql
CREATE TABLE guide_tags (
  guide_id VARCHAR NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  tag_id VARCHAR NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (guide_id, tag_id)
);
```

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)
- Additional Neon-provided variables when using hosted database

### Editor Configuration
The Editor.js instance supports:
- Header blocks (H1-H6)
- Paragraph blocks with rich text
- Code blocks with syntax highlighting
- Ordered and unordered lists
- Image uploads (requires additional configuration)

## 🚦 API Endpoints

### Guides
- `GET /api/guides` - List all guides with optional search and filtering
- `GET /api/guides/:id` - Get specific guide by ID
- `POST /api/guides` - Create new guide
- `PUT /api/guides/:id` - Update existing guide
- `DELETE /api/guides/:id` - Delete guide
- `GET /api/guides/:id/export` - Export guide as HTML

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

## 🎯 Usage Guide

### Creating a Guide
1. Navigate to the guides page
2. Click "Create New Guide"
3. Add title, description, and tags
4. Use the block editor to add content:
   - Click "Header" to add headings
   - Click "Text" to add paragraphs  
   - Click "Code" to add code blocks
   - Click "List" to add ordered/unordered lists
5. Content is automatically saved as you type

### Organizing with Tags
1. Create tags with custom colors
2. Assign multiple tags to guides
3. Filter guides by clicking on tags
4. Use the search box for full-text search

### Exporting Guides
1. Open any guide in view mode
2. Click the "Export" button
3. Download the generated HTML file
4. Share or host the standalone guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use the existing component patterns
- Maintain consistent styling with Tailwind
- Add proper error handling
- Include appropriate tests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Editor.js Documentation](https://editorjs.io/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [Neon Database](https://neon.tech/)

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify DATABASE_URL is correctly set
- Ensure PostgreSQL is running (local setup)
- Check network connectivity (hosted database)

**Build Failures**
- Clear node_modules and reinstall dependencies
- Verify Node.js version compatibility
- Check TypeScript errors with `npm run check`

**Editor Not Loading**
- Check browser console for JavaScript errors
- Ensure all dependencies are installed
- Verify Vite development server is running

For additional help, please check the issues section or create a new issue with detailed error information.
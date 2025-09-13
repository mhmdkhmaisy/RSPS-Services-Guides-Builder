# RSPS Guide Builder

## Overview

RSPS Guide Builder is a Notion-style content management system designed for creating, editing, and organizing gaming guides. The application features a full-stack architecture with a React frontend and Express backend, utilizing a rich block-based editor for creating structured content with support for headers, paragraphs, code blocks, lists, and images. The system includes comprehensive guide management with tagging, search functionality, and HTML export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for development tooling
- **Routing**: Wouter for client-side routing with pages for guide listing, editing, and viewing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Editor**: Editor.js integration for block-based content editing with support for headers, paragraphs, code blocks, lists, and images
- **Theme**: Dark theme with blue accent colors using CSS custom properties

### Backend Architecture
- **Framework**: Express.js with TypeScript in ESM module format
- **API Design**: RESTful API with endpoints for guides and tags CRUD operations
- **Development Server**: Vite integration for hot module replacement in development
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Request Logging**: Custom middleware for API request logging with timing and response data

### Data Storage
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Structured tables for guides, tags, users, and many-to-many relationships
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Data Format**: JSON storage for guide content to support flexible block-based editor data

### Content Management
- **Editor Integration**: Block-based editor supporting multiple content types (headers, paragraphs, code, lists, images)
- **Content Structure**: JSON-based content storage enabling rich text and multimedia content
- **Table of Contents**: Dynamic TOC generation from header blocks with search functionality
- **Export Functionality**: HTML export feature for generating standalone guide files

### Search and Filtering
- **Search Implementation**: Full-text search across guide titles and descriptions
- **Tag System**: Many-to-many tagging system with color-coded tags for categorization
- **Filter Capabilities**: Tag-based filtering and search query filtering with URL parameter support

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18 with React DOM for frontend rendering
- **TypeScript**: Full TypeScript support across frontend and backend
- **Vite**: Build tool and development server with hot module replacement
- **Express**: Node.js web framework for API server

### Database and ORM
- **Neon Database**: Serverless PostgreSQL database service
- **Drizzle ORM**: Type-safe ORM with PostgreSQL adapter
- **Drizzle Kit**: Database migration and schema management tool

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Headless UI primitives for accessible components
- **Shadcn/ui**: Pre-built component library based on Radix UI
- **Lucide React**: Icon library for consistent iconography

### Editor and Content
- **Editor.js**: Block-based rich text editor
- **Editor.js Plugins**: Header, paragraph, code, list, and image block types
- **Date-fns**: Date formatting and manipulation utilities

### State Management and API
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation
- **Hookform Resolvers**: Integration between React Hook Form and validation libraries
- **Zod**: Schema validation for type-safe API contracts

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server
- **PostCSS**: CSS processing with Tailwind CSS integration
- **Autoprefixer**: CSS vendor prefix automation

### Replit Integration
- **Replit Plugins**: Development environment integration with error overlay, cartographer, and dev banner
- **WebSocket Support**: Real-time development features and hot reloading
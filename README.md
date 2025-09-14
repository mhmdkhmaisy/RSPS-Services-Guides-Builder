# RSPS Services Guides Builder

A comprehensive guide builder application for RuneScape Private Server (RSPS) services, featuring a modern web interface with rich text editing capabilities.

## Features

- **Rich Text Editor**: Built with EditorJS for creating comprehensive guides
- **Tag System**: Organize guides with customizable tags and colors
- **Search & Filter**: Find guides quickly with search and tag filtering
- **Export Functionality**: Export guides to HTML format
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Database Integration**: SQLite for local development, PostgreSQL for production

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: SQLite (local development), PostgreSQL (production)
- **ORM**: Drizzle ORM
- **Editor**: EditorJS with multiple plugins
- **Build Tools**: Vite, ESBuild

## Local Development Setup

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd RSPS-Services-Guides-Builder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

The `.env` file should contain:
```env
DATABASE_URL="file:./local.db"
NODE_ENV=development
```

4. Initialize the database:
```bash
npm run db:push
```

This will create a local SQLite database (`local.db`) and set up all necessary tables.

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Database Configuration

### Local Development (SQLite)
- Uses SQLite database stored as `local.db` in the project root
- No additional setup required - database file is created automatically
- Perfect for development and testing

### Production (PostgreSQL)
For production deployment, update your environment variables:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
NODE_ENV=production
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Project Structure

```
├── client/                 # React frontend application
├── server/                 # Express backend API
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── db.ts              # Database connection
│   └── storage.ts         # Database operations
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
├── migrations/            # Database migration files
└── local.db              # SQLite database (created automatically)
```

## API Endpoints

### Guides
- `GET /api/guides` - List all guides (supports ?search= and ?tag= query params)
- `GET /api/guides/:id` - Get guide by ID
- `GET /api/guides/slug/:slug` - Get guide by slug
- `POST /api/guides` - Create new guide
- `PUT /api/guides/:id` - Update guide
- `DELETE /api/guides/:id` - Delete guide
- `GET /api/guides/:id/export` - Export guide as HTML

### Tags
- `GET /api/tags` - List all tags
- `GET /api/tags/:id` - Get tag by ID
- `POST /api/tags` - Create new tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

## Development Notes

- The application uses SQLite for local development to simplify setup
- Database schema is automatically created when running `npm run db:push`
- Hot reload is enabled for both frontend and backend during development
- The frontend is served by the Express server in development mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
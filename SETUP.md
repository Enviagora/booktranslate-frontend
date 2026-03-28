# BookTranslate Frontend - Setup Guide

## Project Overview

BookTranslate is a SaaS platform for translating PDF books. This is the complete Next.js 14+ frontend with TypeScript, Tailwind CSS, and Supabase authentication.

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for authentication
- **React** 19.x
- **ESLint** for code quality

## Prerequisites

- Node.js 18+ and npm
- Supabase account with a project
- Backend API running (see backend documentation)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with Auth provider
│   ├── page.tsx                 # Home page (redirects based on auth)
│   ├── login/
│   │   └── page.tsx             # Login page
│   └── dashboard/
│       ├── layout.tsx           # Dashboard layout (sidebar + header)
│       ├── page.tsx             # Main dashboard with upload
│       ├── history/
│       │   └── page.tsx         # Translation history
│       └── admin/
│           ├── page.tsx         # Admin overview
│           ├── users/
│           │   └── page.tsx     # User management
│           └── translations/
│               └── page.tsx     # All translations admin view
├── components/                   # Reusable components
│   ├── Header.tsx               # Top navigation
│   ├── Sidebar.tsx              # Left sidebar navigation
│   ├── UploadZone.tsx           # PDF upload component
│   ├── TranslationProgress.tsx   # Real-time progress tracker
│   ├── StatusBadge.tsx          # Status indicator component
│   ├── StatsCard.tsx            # Statistics card
│   ├── Modal.tsx                # Reusable modal dialog
│   ├── ConfirmDialog.tsx        # Confirmation dialog
│   └── LoadingSpinner.tsx       # Loading indicator
├── contexts/
│   └── AuthContext.tsx          # Authentication context provider
├── lib/
│   ├── api.ts                   # API client with auth headers
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       └── server.ts            # Server Supabase client
├── types/
│   └── index.ts                 # TypeScript interfaces
├── middleware.ts                # Next.js middleware for route protection
└── app/
    └── globals.css              # Global Tailwind styles
```

## Key Features

### User Features
- **Email/Password Authentication** via Supabase
- **PDF Upload** with drag-and-drop support
- **Translation Progress** tracking with real-time updates
- **Translation History** with sorting and filtering
- **Download Translations** as PDF or EPUB formats
- **Usage Statistics** showing tokens and costs

### Admin Features
- **User Management** (create, block, delete)
- **System Overview** with comprehensive statistics
- **Cost Tracking** per user
- **Translation Monitoring** across all users
- **User Activity** dashboard

## API Integration

The frontend communicates with the backend API at `NEXT_PUBLIC_API_URL`. All requests include:
- `Authorization: Bearer {supabase_jwt_token}` header
- Content-Type: application/json

### Key Endpoints Used

- `POST /translations` - Upload PDF
- `GET /translations` - List user translations
- `GET /translations/{id}` - Get translation details
- `GET /translations/{id}/download-pdf` - Download translated PDF
- `GET /translations/{id}/download-epub` - Download EPUB
- `GET /user/stats` - Get user statistics
- `GET /admin/stats` - Get admin statistics
- `GET /admin/users` - List all users
- `POST /admin/users` - Create user
- `PATCH /admin/users/{id}` - Update user (block/unblock)
- `DELETE /admin/users/{id}` - Delete user
- `GET /admin/translations` - Get all translations

## Authentication Flow

1. User enters credentials on `/login`
2. Supabase authenticates and returns JWT token
3. JWT stored in secure HTTP-only cookies
4. Middleware redirects unauthenticated users to login
5. All API requests include JWT in Authorization header
6. User can logout, clearing session

## Styling

The project uses Tailwind CSS with a minimalist, Apple Books inspired design:
- Light color palette (whites, light grays)
- Clean typography with Inter font
- Focus on readability and simplicity
- Subtle warm accents for interactive elements
- Responsive grid layout

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Development Tips

- **Hot Reload**: Changes automatically refresh in the browser
- **TypeScript**: Full type checking for development and build
- **Linting**: Run `npm run lint` to check code quality
- **Testing**: Add tests in `__tests__` folders

## Troubleshooting

### "Not authenticated" errors
- Check Supabase credentials in `.env.local`
- Verify backend API is running
- Check network tab in browser DevTools

### Upload failures
- Ensure PDF file is valid
- Check file size (max 100MB)
- Verify CORS settings on backend

### Admin pages not accessible
- Verify user has `admin` role in Supabase
- Check user is not blocked
- Clear browser cookies and re-login

## License

All rights reserved - BookTranslate SaaS Platform

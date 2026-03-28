# BookTranslate Frontend - Quick Start

## 5-Minute Setup

### Prerequisites
- Node.js 18+ installed
- Supabase project created
- Backend API running on http://localhost:8000

### Steps

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to http://localhost:3000

## Default Routes

| Route | Description | Auth Required |
|-------|-------------|----------------|
| `/` | Home (redirects based on auth) | No |
| `/login` | Login page | No |
| `/dashboard` | Main dashboard | Yes |
| `/dashboard/history` | Translation history | Yes |
| `/dashboard/admin` | Admin overview | Yes (admin only) |
| `/dashboard/admin/users` | User management | Yes (admin only) |
| `/dashboard/admin/translations` | All translations | Yes (admin only) |

## Key Components

### Pages
- **Login**: Email/password authentication
- **Dashboard**: Upload PDFs, view recent translations
- **History**: Full translation list with download options
- **Admin Dashboard**: System statistics and user management

### Components
- `UploadZone`: Drag-drop PDF upload
- `TranslationProgress`: Real-time progress indicator
- `StatusBadge`: Translation status display
- `Modal` / `ConfirmDialog`: Dialogs for actions
- `Sidebar` / `Header`: Navigation UI

## API Integration

All API calls automatically include JWT authentication headers. Backend endpoints:

```
POST   /translations              - Upload PDF
GET    /translations              - List user translations
GET    /translations/{id}         - Get translation details
GET    /translations/{id}/download-pdf
GET    /translations/{id}/download-epub
GET    /user/stats                - User statistics
GET    /admin/stats               - Admin statistics
GET    /admin/users               - List all users
POST   /admin/users               - Create user
PATCH  /admin/users/{id}          - Update user
DELETE /admin/users/{id}          - Delete user
GET    /admin/translations        - Get all translations
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Authentication

- Users log in with email/password
- Supabase handles session management
- JWT tokens automatically included in API requests
- Middleware protects routes (unauthenticated users redirected to /login)
- Logout clears session and redirects to login

## Styling

- Tailwind CSS for all styling
- Minimalist, Apple Books inspired design
- Responsive grid layout
- Dark gray (#111827) primary color
- Light gray backgrounds and borders
- All text in Portuguese (pt-BR)

## Troubleshooting

### Port 3000 in use?
```bash
npm run dev -- -p 3001
```

### Clear cache and reinstall
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Environment variables not loading?
- Restart dev server
- Check .env.local exists
- Verify variable names (must start with NEXT_PUBLIC_)

### Login not working?
- Check Supabase credentials
- Verify backend API is running
- Check network tab in DevTools

## Production Deployment

### Build
```bash
npm run build
```

### Environment
Set in production environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

### Deploy to Vercel
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js routes
│   ├── components/          # React components
│   ├── contexts/            # Auth context
│   ├── lib/                 # Utilities (api, supabase)
│   ├── types/               # TypeScript interfaces
│   └── middleware.ts        # Route protection
├── package.json             # Dependencies
├── tailwind.config.ts       # Tailwind configuration
├── .env.local               # Environment variables
├── SETUP.md                 # Full setup guide
└── QUICKSTART.md            # This file
```

## Next Steps

1. Ensure backend API is running
2. Configure Supabase project
3. Create test users via admin panel
4. Test PDF upload and translation
5. Review SETUP.md for detailed documentation

For full documentation, see SETUP.md

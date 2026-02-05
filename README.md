# Contact - React Native Expo App

A complete, production-ready React Native Expo mobile application for managing contacts with Supabase backend integration, offline support, and cloud sync.

## Features

- ✅ **Device Contacts Sync** - Import and sync contacts from device address book
- ✅ **Cloud Sync** - Sync contacts with Supabase (upload/download with conflict resolution)
- ✅ **Full CRUD** - Create, read, update, and delete contacts
- ✅ **Multiple Phones/Emails** - Support for multiple phone numbers and email addresses per contact
- ✅ **Categories & Designations** - Organize contacts with categories and designations
- ✅ **Merge Contacts** - Detect and merge duplicate contacts
- ✅ **Import/Export** - Import from CSV, export to CSV or vCard
- ✅ **Share Contacts** - Share via WhatsApp, SMS, Email, or vCard
- ✅ **Profile Images** - Upload and store contact profile images
- ✅ **Offline Mode** - Full offline support with SQLite, sync when online
- ✅ **Modern UI** - Beautiful, responsive UI with React Native Paper

## Tech Stack

- **React Native** with **Expo** (~51.0.0)
- **TypeScript** for type safety
- **Supabase** for backend (Auth + Database + Storage)
- **SQLite** (Expo SQLite) for offline storage
- **Expo Router** for navigation
- **React Query** for data fetching and caching
- **React Native Paper** for UI components
- **FlashList** for optimized list rendering
- **Zod** for validation
- **libphonenumber-js** for phone number normalization

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account and project
- iOS Simulator (for iOS) or Android Emulator (for Android)

## Setup Instructions

### 1. Clone and Install

```bash
# Install dependencies
npm install
# or
yarn install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the SQL schema from `supabase/schema.sql`
3. Create a storage bucket named `contact-images` (or update `EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET` in `.env`)
4. Enable Row Level Security (RLS) is already configured in the schema

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET=contact-images
```

### 4. Run the App

```bash
# Start Expo development server
npm start
# or
yarn start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
Contact/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── contact/           # Contact detail/edit screens
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and business logic
│   ├── context/           # React Context providers
│   ├── utils/             # Utility functions
│   ├── db/                # SQLite database models
│   └── types/             # TypeScript type definitions
├── supabase/
│   └── schema.sql         # Supabase database schema
└── package.json
```

## Key Features Implementation

### Sync Engine

The sync engine implements a diff-based sync algorithm:
- Detects local unsynced changes
- Uploads new/updated contacts to cloud
- Downloads cloud changes
- Resolves conflicts using last-updated-wins strategy
- Handles soft deletes

### Offline Support

- All contacts stored locally in SQLite
- Changes queued when offline
- Automatic sync when connection restored
- Visual indicator for offline status

### Contact Management

- Multiple phone numbers and emails per contact
- Profile image upload to Supabase Storage
- Categories and tags
- Company and designation
- Notes and address
- Last visit tracking

### Duplicate Detection & Merging

- Automatic duplicate detection by phone/email
- Similarity scoring algorithm
- Manual merge UI with preview
- Union of arrays (phones/emails)
- Prefers non-empty values

## Database Schema

### Supabase Tables

- `users` - User profiles
- `contacts` - Contact records
- `contact_phones` - Phone numbers
- `contact_emails` - Email addresses
- `designations` - Job titles/designations
- `shared_contacts` - Shared contact permissions
- `sync_log` - Sync operation logs

### SQLite Tables

- `contacts` - Local contact cache
- `contact_phones` - Local phone numbers
- `contact_emails` - Local email addresses
- `designations` - Local designations cache
- `sync_queue` - Pending sync operations

## Permissions

The app requires the following permissions:

- **Contacts** - Read/write device contacts
- **Storage** - Access photos for profile images
- **Network** - Sync with cloud

These are configured in `app.json`.

## Development

### Adding New Features

1. Create types in `src/types/`
2. Add database models in `src/db/`
3. Create services in `src/services/`
4. Build hooks in `src/hooks/`
5. Create UI components in `src/components/`
6. Add screens in `src/screens/` and routes in `app/`

### Code Style

- Use TypeScript for all files
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Add comments for complex logic

## Troubleshooting

### Sync Issues

- Check network connection
- Verify Supabase credentials
- Check sync logs in settings

### Database Issues

- Clear app data and reinstall
- Check SQLite database initialization

### Build Issues

- Clear Expo cache: `expo start -c`
- Reinstall node_modules
- Check Expo SDK version compatibility

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.


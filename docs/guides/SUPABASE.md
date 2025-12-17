# Supabase Migration Guide

## Overview

FairTradeWorker is migrating from localStorage to Supabase for all data persistence. This provides:

- Real-time synchronization across devices
- Better security with Row Level Security (RLS)
- Scalable database architecture
- Offline support with sync
- Better performance for large datasets

## Setup Instructions

### 1. Install Supabase

```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 3. Set Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually run the SQL files in `supabase/migrations/` in order through the Supabase dashboard.

## Migration Steps

### Step 1: Database Setup

Run all migration files in order:

1. `001_initial_schema.sql` - Core tables
2. `002_territories.sql` - Territory tables
3. `003_crm_tables.sql` - CRM tables
4. `004_automation_tables.sql` - Automation tables
5. `005_indexes_and_performance.sql` - Performance indexes
6. `006_row_level_security.sql` - RLS policies
7. `007_functions_and_triggers.sql` - Database functions
8. `008_analytics_tables.sql` - Analytics tables
9. `009_user_data_table.sql` - KV store table

### Step 2: Update Code

Replace `useLocalKV` with `useSupabaseKV`:

**Before:**

```typescript
import { useLocalKV } from '@/hooks/useLocalKV'
const [data, setData] = useLocalKV<DataType>("key", defaultValue)
```

**After:**

```typescript
import { useSupabaseKV } from '@/hooks/useSupabaseKV'
const [data, setData, loading] = useSupabaseKV<DataType>("key", defaultValue, {
  encrypt: true, // Optional encryption
  realtime: true // Optional real-time sync
})
```

### Step 3: Update App.tsx

Replace localStorage hooks with Supabase hooks:

```typescript
// Before
const [currentUser, setCurrentUser] = useLocalKV<User | null>("current-user", null)
const [jobs, setJobs] = useLocalKV<Job[]>("jobs", [])

// After
const [currentUser, setCurrentUser, userLoading] = useSupabaseKV<User | null>("current-user", null)
const [jobs, setJobs, jobsLoading] = useSupabaseKV<Job[]>("jobs", [], { realtime: true })
```

### Step 4: Handle Loading States

Add loading indicators where needed:

```typescript
if (loading) {
  return <LoadingSpinner />
}
```

### Step 5: Data Migration (Optional)

If you have existing localStorage data, create a migration script:

```typescript
// Migrate localStorage to Supabase
async function migrateLocalStorageToSupabase() {
  const keys = Object.keys(localStorage)
  for (const key of keys) {
    const value = localStorage.getItem(key)
    if (value) {
      // Use useSupabaseKV or direct Supabase call
      await supabase.from('user_data').upsert({
        user_id: currentUser.id,
        key,
        value,
        encrypted: false
      })
    }
  }
}
```

## Key Differences

### useLocalKV vs useSupabaseKV

| Feature | useLocalKV | useSupabaseKV |
|---------|-----------|---------------|
| Storage | localStorage | Supabase database |
| Sync | Single device | All devices |
| Real-time | No | Yes (optional) |
| Security | Client-side only | RLS policies |
| Offline | Limited | Full support |
| Loading state | No | Yes |
| Error handling | Basic | Comprehensive |

### API Changes

1. **Loading State**: `useSupabaseKV` returns `[value, setValue, loading]` instead of `[value, setValue]`
2. **Options**: New options for `realtime` and `table` selection
3. **Error Handling**: Better error handling with try/catch
4. **Initialization**: Async loading from database

## Benefits

1. **Real-time Sync**: Changes sync across all devices instantly
2. **Better Security**: Row Level Security ensures users only see their data
3. **Scalability**: Database can handle millions of records
4. **Offline Support**: Supabase handles offline sync automatically
5. **Performance**: Indexed queries are much faster than localStorage
6. **Backup**: Automatic backups in Supabase
7. **Analytics**: Built-in analytics and monitoring

## Troubleshooting

### Connection Issues

If Supabase connection fails, the hook will fall back gracefully. Check:

- Environment variables are set correctly
- Supabase project is active
- Network connectivity

### RLS Policy Errors

If you get permission errors, check:

- User is authenticated
- RLS policies are set up correctly
- User ID matches in queries

### Migration Errors

If migrations fail:

- Check SQL syntax
- Ensure tables don't already exist
- Run migrations in order
- Check Supabase logs

## Next Steps

1. Run all migrations
2. Update all `useLocalKV` calls to `useSupabaseKV`
3. Add loading states
4. Test real-time sync
5. Deploy to production

## Support

For issues, check:

- Supabase documentation: <https://supabase.com/docs>
- Migration files in `supabase/migrations/`
- Code examples in `src/hooks/useSupabaseKV.ts`

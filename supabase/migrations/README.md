# Supabase Migrations

This folder contains database migrations for FairTradeWorker using Supabase.

## Setup Instructions

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase (if not already done):**
   ```bash
   supabase init
   ```

3. **Link to your Supabase project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Run migrations:**
   ```bash
   supabase db push
   ```

## Migration Files

Migrations are numbered sequentially and run in order:

- `001_initial_schema.sql` - Core tables (users, jobs, bids, invoices)
- `002_territories.sql` - Territory and operator tables
- `003_crm_tables.sql` - CRM and customer management
- `004_automation_tables.sql` - Automation and follow-up sequences
- `005_indexes_and_performance.sql` - Performance indexes
- `006_row_level_security.sql` - RLS policies for security
- `007_functions_and_triggers.sql` - Database functions and triggers
- `008_analytics_tables.sql` - Analytics and reporting tables

## Migration Naming Convention

- Format: `XXX_description.sql`
- Use descriptive names
- Keep migrations focused and atomic
- Never modify existing migrations (create new ones)

## Running Migrations Locally

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Check migration status
supabase migration list
```

## Production Deployment

Migrations are automatically applied when you push to your Supabase project:

```bash
supabase db push
```

Or use the Supabase dashboard to run migrations manually.

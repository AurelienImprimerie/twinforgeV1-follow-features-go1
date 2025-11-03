# Database Health Check Guide

## Quick Diagnostic Commands

### 1. Check if Critical Tables Exist

```sql
SELECT
  'geographic_data_cache' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geographic_data_cache') as exists,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'geographic_data_cache') as rls_policies
UNION ALL
SELECT
  'country_health_data' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'country_health_data') as exists,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'country_health_data') as rls_policies;
```

**Expected Output**:
```json
[
  {"table_name": "geographic_data_cache", "exists": true, "rls_policies": 4},
  {"table_name": "country_health_data", "exists": true, "rls_policies": 4}
]
```

### 2. Check RLS Policies on a Table

```sql
SELECT
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'YOUR_TABLE_NAME'
ORDER BY policyname;
```

### 3. List All Applied Migrations

```sql
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 20;
```

### 4. Check Table Indexes

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'YOUR_TABLE_NAME'
  AND schemaname = 'public'
ORDER BY indexname;
```

## Common Error Patterns

### Error 404 - PGRST205 (Table Not Found)

**Error Message**:
```json
{
  "code": "PGRST205",
  "details": null,
  "hint": "Perhaps you meant to reference the table \"public.YOUR_TABLE\" in the schema cache"
}
```

**Diagnosis**:
1. Table doesn't exist in database
2. Migration was never applied
3. Table was dropped accidentally

**Solution**:
1. Check if table exists: `SELECT * FROM information_schema.tables WHERE table_name = 'YOUR_TABLE';`
2. Apply missing migration via `mcp__supabase__apply_migration`
3. Verify table creation: `\d YOUR_TABLE` in psql

### Error 403 - 42501 (RLS Policy Violation)

**Error Message**:
```json
{
  "code": "42501",
  "details": null,
  "message": "new row violates row-level security policy for table \"YOUR_TABLE\""
}
```

**Diagnosis**:
1. RLS is enabled but no matching policy exists
2. Policy conditions don't match current user
3. Missing INSERT/UPDATE policies for authenticated users

**Solution**:
1. Check RLS status: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'YOUR_TABLE';`
2. List policies: `SELECT * FROM pg_policies WHERE tablename = 'YOUR_TABLE';`
3. Add missing policies for authenticated users
4. Test with: `SET ROLE authenticated; -- your test query`

### Error 401 - Unauthorized

**Diagnosis**:
1. User not authenticated
2. Token expired
3. No policy for anonymous users

**Solution**:
1. Check authentication state in frontend
2. Verify JWT token validity
3. Add policy for anonymous if needed (use with caution)

## Preventive Health Checks

### On Application Startup

Add this to your application startup:

```typescript
async function checkDatabaseHealth() {
  const criticalTables = [
    'user_profile',
    'geographic_data_cache',
    'country_health_data',
    'activities',
    'training_sessions'
  ];

  for (const table of criticalTables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(0);

    if (error) {
      logger.error('DB_HEALTH', `Table ${table} check failed`, { error });
      // Send alert or fail startup
    }
  }
}
```

### Weekly Audit Script

```sql
-- Check for tables without RLS
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;

-- Check for policies using USING (true) - potential security risk
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND qual = 'true'
  AND cmd NOT IN ('SELECT')
ORDER BY tablename, policyname;

-- Check for unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY tablename, indexname;
```

## Migration Best Practices

### 1. Always Use IF EXISTS / IF NOT EXISTS

```sql
-- Good
CREATE TABLE IF NOT EXISTS my_table (...);
CREATE INDEX IF NOT EXISTS idx_name ON my_table(column);
DROP POLICY IF EXISTS "policy_name" ON my_table;

-- Bad (will fail on re-run)
CREATE TABLE my_table (...);
CREATE INDEX idx_name ON my_table(column);
DROP POLICY "policy_name" ON my_table;
```

### 2. Always Enable RLS

```sql
-- Create table
CREATE TABLE IF NOT EXISTS my_table (...);

-- Enable RLS immediately
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can read own data"
  ON my_table FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### 3. Test Migrations Locally First

```bash
# Start local Supabase
supabase start

# Apply migration
supabase db reset

# Test queries
supabase db diff

# If OK, push to remote
supabase db push
```

### 4. Document Your Migrations

Every migration should have:
- Clear description in header comments
- List of tables created/modified
- RLS policies explained
- Security considerations
- Expected behavior

## Troubleshooting Checklist

When encountering database errors:

- [ ] Check Supabase dashboard for error logs
- [ ] Verify table exists in database
- [ ] Check RLS is enabled and policies are correct
- [ ] Test query with service_role (bypasses RLS)
- [ ] Verify foreign key constraints
- [ ] Check indexes are present
- [ ] Validate user authentication status
- [ ] Review recent migrations for conflicts
- [ ] Check for transaction locks
- [ ] Verify connection pool isn't exhausted

## Emergency Procedures

### Critical Table Missing

```sql
-- 1. Check if migration exists
SELECT * FROM supabase_migrations.schema_migrations
WHERE name LIKE '%YOUR_TABLE%';

-- 2. If not applied, apply manually via Supabase Dashboard or mcp__supabase__apply_migration

-- 3. Verify table creation
SELECT * FROM information_schema.tables
WHERE table_name = 'YOUR_TABLE';

-- 4. Verify RLS and policies
SELECT * FROM pg_policies WHERE tablename = 'YOUR_TABLE';
```

### RLS Policy Emergency Bypass (DEV ONLY!)

```sql
-- DANGER: Only use in development to diagnose issues
ALTER TABLE my_table DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable immediately
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
```

### Mass Policy Check

```sql
-- List all tables with enabled RLS but no policies
SELECT
  t.tablename,
  t.rowsecurity,
  COALESCE(p.policy_count, 0) as policy_count
FROM pg_tables t
LEFT JOIN (
  SELECT tablename, COUNT(*) as policy_count
  FROM pg_policies
  GROUP BY tablename
) p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND COALESCE(p.policy_count, 0) = 0;
```

## Monitoring Setup

### Key Metrics to Track

1. **Query Performance**: Slow queries (>1s)
2. **Error Rates**: 404 (missing tables), 403 (RLS), 500 (server errors)
3. **Cache Hit Rates**: For `geographic_data_cache`
4. **Connection Pool**: Active connections
5. **RLS Policy Violations**: Failed INSERT/UPDATE due to RLS

### Recommended Alerts

- Table creation failures
- Missing RLS policies on new tables
- Excessive 403 errors (>10/min)
- Cache expiration issues
- Migration failures

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policy Documentation](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Database Debugging Guide](./debugging-database-issues.md)

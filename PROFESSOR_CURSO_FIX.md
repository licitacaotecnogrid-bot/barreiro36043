# Fix for Professor Filtering by Course

## Problem
When creating a new event ("Novo Evento") or project ("Novo Projeto"), the list of "Professor(a) Responsável" or "Professor Coordenador" was not showing professors from courses other than "Análise e Desenvolvimento de Sistemas".

## Root Cause
The `Usuario` table in the database schema was missing the `curso` field, even though:
1. The Register page allowed users to select a course when registering as a professor
2. The Register page attempted to save the curso to the database
3. The `use-professores` hook was already querying for the curso field

This caused the course filter logic in the hook to fail silently - it would try to filter by a field that didn't exist in the database, resulting in no professors being returned for courses other than the hardcoded "Análise e Desenvolvimento de Sistemas".

## Solution
The fix involved updating the database schema across all environments to include the `curso` field in the `Usuario` table:

### Files Modified

1. **database/init-postgres.sql**
   - Added `curso TEXT` column to the `Usuario` table
   - Used for PostgreSQL-compatible databases

2. **database/supabase-migration.sql**
   - Added `curso TEXT` column to the `usuario` table
   - Used for Supabase deployments with snake_case naming

3. **database/init.sql**
   - Added `curso TEXT` column to the `Usuario` table
   - Used for SQLite local development

4. **database/seed.ts**
   - Updated to insert test users with their respective courses
   - Added test professor users from other courses (Nutrição, Sistemas de Informação)
   - Helps verify the fix works for different courses

5. **database/migrations/add_curso_to_usuario.sql**
   - Migration script to add the missing column to existing databases
   - Includes both quoted and snake_case versions for compatibility

## How the Fix Works

1. When a professor registers with a course, it's now saved to the `Usuario` table's `curso` field
2. The `use-professores` hook queries the `Usuario` table with:
   ```sql
   SELECT id, nome, email, senha, curso FROM Usuario 
   WHERE cargo IN ('Professor', 'Coordenador')
   ```
3. The hook filters professors by the current user's course:
   ```typescript
   const professoresdoCurso = currentUser?.curso
     ? professores.filter((p) => p.curso === currentUser.curso)
     : professores;
   ```
4. This filtered list is used in:
   - EventoForm.tsx - for the "Professor(a) Responsável" field
   - ProjetoForm.tsx - for the "Professor Coordenador" field

## Testing the Fix

### For New Databases
The schema files will automatically create the `curso` field when initializing a new database.

### For Existing Databases
If you're using an existing Supabase database, run the migration:

```bash
# Connect to your Supabase project and run in the SQL Editor:
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS curso TEXT;
```

Or use the provided migration file:
```bash
# For PostgreSQL-compatible databases
psql -U postgres -d your_database < database/migrations/add_curso_to_usuario.sql
```

### Verification Steps
1. Register a new professor with a course other than "Análise e Desenvolvimento de Sistemas"
2. Log in as that professor
3. Go to "Novo Evento" or "Novo Projeto"
4. The professor should appear in the dropdown for their specific course
5. Professors from other courses should NOT appear in the dropdown

## Edge Cases Handled
- If a user has no curso (null), all professors are shown (fallback behavior)
- Existing professors with no curso assigned will be treated as having no course
- New professors registered through the UI will have their course properly saved

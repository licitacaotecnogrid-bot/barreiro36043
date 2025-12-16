-- Add curso column to Usuario table if it doesn't exist
ALTER TABLE "Usuario"
ADD COLUMN IF NOT EXISTS curso TEXT;

-- Add curso column to usuario table (snake_case version for Supabase)
ALTER TABLE usuario
ADD COLUMN IF NOT EXISTS curso TEXT;

-- Add curso column to ProjetoPesquisa table if it doesn't exist
ALTER TABLE "ProjetoPesquisa"
ADD COLUMN IF NOT EXISTS curso TEXT;

-- Add curso column to projeto_pesquisa table (snake_case version for Supabase)
ALTER TABLE projeto_pesquisa
ADD COLUMN IF NOT EXISTS curso TEXT;

-- Add curso column to ProjetoExtensao table if it doesn't exist
ALTER TABLE "ProjetoExtensao"
ADD COLUMN IF NOT EXISTS curso TEXT;

-- Add curso column to projeto_extensao table (snake_case version for Supabase)
ALTER TABLE projeto_extensao
ADD COLUMN IF NOT EXISTS curso TEXT;

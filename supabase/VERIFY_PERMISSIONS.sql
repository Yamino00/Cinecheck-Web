-- Verifica Permessi service_role
-- 
-- Esegui questa query per verificare se i permessi sono stati assegnati correttamente

-- 1. Verifica permessi sullo schema public
SELECT 
    nspname AS schema_name,
    r.rolname AS role_name,
    has_schema_privilege(r.rolname, nspname, 'USAGE') AS has_usage,
    has_schema_privilege(r.rolname, nspname, 'CREATE') AS has_create
FROM pg_namespace n
CROSS JOIN pg_roles r
WHERE nspname = 'public' 
  AND r.rolname IN ('service_role', 'authenticated', 'anon')
ORDER BY r.rolname;

-- 2. Verifica permessi sulla tabella contents
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
  AND table_name = 'contents'
  AND grantee = 'service_role'
ORDER BY privilege_type;

-- 3. Verifica se service_role esiste
SELECT rolname, rolsuper, rolcanlogin 
FROM pg_roles 
WHERE rolname = 'service_role';

-- Se service_role NON esiste o NON ha permessi, esegui:
-- GRANT USAGE ON SCHEMA public TO service_role;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- ========================================
-- DEBUG Y CORRECCIÓN DE POLÍTICAS RLS
-- ========================================

-- 1. Verificar que las tablas existen
SELECT table_name, row_security 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'user_profiles');

-- 2. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_roles', 'user_profiles');

-- 3. Verificar datos en las tablas
SELECT * FROM user_roles;
SELECT id, email, full_name, role_id, is_active FROM user_profiles;

-- 4. Agregar política más permisiva para debugging (TEMPORAL)
DROP POLICY IF EXISTS "Allow authenticated users to read user_profiles" ON user_profiles;
CREATE POLICY "Allow authenticated users to read user_profiles" 
ON user_profiles FOR SELECT 
USING (auth.role() = 'authenticated');

-- 5. Verificar que la función auth.uid() funciona correctamente
SELECT auth.uid() as current_user_id;

-- 6. Test query manual (reemplazar con UUID real del usuario)
-- SELECT 
--   up.*,
--   ur.name as role_name,
--   ur.description as role_description
-- FROM user_profiles up
-- JOIN user_roles ur ON up.role_id = ur.id
-- WHERE up.id = 'UUID_DEL_USUARIO_AQUI';

-- ========================================
-- NOTA: Después de debugging, restaurar políticas más restrictivas
-- ========================================
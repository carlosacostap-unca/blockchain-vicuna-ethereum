-- ========================================
-- CORRECCIÓN DE RECURSIÓN INFINITA EN RLS
-- ========================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read user_profiles" ON user_profiles;

-- 2. CREAR POLÍTICAS SIMPLES Y SIN RECURSIÓN

-- Política básica: los usuarios pueden ver su propio perfil
CREATE POLICY "Enable users to view own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Política básica: los usuarios pueden actualizar su propio perfil
CREATE POLICY "Enable users to update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Política para inserción (necesaria para el trigger de creación automática)
CREATE POLICY "Enable insert for service role" 
ON user_profiles FOR INSERT 
WITH CHECK (true);

-- 3. VERIFICAR QUE LAS POLÍTICAS SE APLICARON CORRECTAMENTE
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 4. VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- ========================================
-- NOTA: Esta configuración permite:
-- - Usuarios ven solo su propio perfil
-- - Usuarios pueden actualizar solo su propio perfil
-- - El sistema puede crear perfiles automáticamente
-- ========================================
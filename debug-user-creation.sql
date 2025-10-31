-- ========================================
-- DIAGNÓSTICO DE CREACIÓN DE USUARIOS
-- ========================================

-- 1. Verificar que las tablas existen
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_roles', 'user_profiles')
ORDER BY table_name;

-- 2. Verificar la estructura de user_roles
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar la estructura de user_profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar que los roles existen
SELECT * FROM user_roles ORDER BY id;

-- 5. Verificar usuarios existentes
SELECT 
  id,
  email,
  full_name,
  role_id,
  is_active,
  created_at
FROM user_profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 6. Verificar las políticas RLS (Row Level Security)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_roles')
ORDER BY tablename, policyname;

-- 7. Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'user_roles');

-- 8. Verificar triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('user_profiles', 'user_roles')
ORDER BY event_object_table, trigger_name;

-- 9. Verificar funciones relacionadas
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%user%' 
   OR routine_name LIKE '%profile%'
   OR routine_name LIKE '%role%'
ORDER BY routine_name;

-- 10. Verificar permisos en las tablas
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('user_profiles', 'user_roles')
ORDER BY table_name, grantee;
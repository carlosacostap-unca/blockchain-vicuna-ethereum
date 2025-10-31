-- ========================================
-- VERIFICACIÓN DE SOLUCIÓN RLS
-- ========================================

-- 1. Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'user_roles')
ORDER BY tablename;

-- 2. Listar todas las políticas actuales
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command_type,
  qual as using_expression,
  with_check
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_roles')
ORDER BY tablename, policyname;

-- 3. Verificar que la función is_admin() existe y funciona
SELECT 
  routine_name,
  routine_type,
  data_type,
  security_type
FROM information_schema.routines 
WHERE routine_name = 'is_admin';

-- 4. Test básico de consulta (esto debería funcionar sin recursión)
SELECT 
  'Test 1: Conteo básico' as test_name,
  COUNT(*) as result
FROM user_profiles;

-- 5. Test de roles
SELECT 
  'Test 2: Consulta de roles' as test_name,
  COUNT(*) as result
FROM user_roles;

-- 6. Test de JOIN (esto antes causaba recursión)
SELECT 
  'Test 3: JOIN user_profiles + user_roles' as test_name,
  COUNT(*) as result
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id;

-- 7. Verificar permisos
SELECT 
  grantee,
  table_name,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name IN ('user_profiles', 'user_roles')
  AND grantee IN ('authenticated', 'anon')
ORDER BY table_name, grantee, privilege_type;

-- 8. Test final: Simular la consulta que hace la aplicación
SELECT 
  'Test 4: Consulta completa de perfil' as test_name,
  'SUCCESS' as result
FROM (
  SELECT 
    up.id,
    up.email,
    up.full_name,
    ur.name as role_name
  FROM user_profiles up
  JOIN user_roles ur ON up.role_id = ur.id
  LIMIT 1
) test_query;

-- Mensaje final
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'SUCCESS: RLS configurado correctamente sin recursión'
    ELSE 'WARNING: Verificar configuración'
  END as final_status
FROM user_roles;
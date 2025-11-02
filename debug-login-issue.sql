-- ========================================
-- DIAGNÓSTICO DE PROBLEMAS DE LOGIN
-- ========================================

-- 1. Verificar que el usuario administrador existe en auth.users
SELECT 
    'USUARIOS EN AUTH.USERS' as check_type,
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users 
WHERE email LIKE '%admin%' OR email = 'admin@vicuna.com'
ORDER BY created_at DESC;

-- 2. Verificar perfiles de usuario
SELECT 
    'PERFILES DE USUARIO' as check_type,
    up.id,
    up.email,
    up.full_name,
    ur.name as role_name,
    up.created_at
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
WHERE up.email LIKE '%admin%' OR up.email = 'admin@vicuna.com'
ORDER BY up.created_at DESC;

-- 3. Verificar todos los roles disponibles
SELECT 
    'ROLES DISPONIBLES' as check_type,
    id,
    name,
    description,
    created_at
FROM user_roles 
ORDER BY name;

-- 4. Verificar políticas RLS activas
SELECT 
    'POLÍTICAS RLS' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type,
    qual as using_expression
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_roles')
ORDER BY tablename, policyname;

-- 5. Verificar que RLS está habilitado
SELECT 
    'ESTADO RLS' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    relowner
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'user_roles')
ORDER BY tablename;

-- 6. Verificar función is_admin si existe
SELECT 
    'FUNCIÓN IS_ADMIN' as check_type,
    routine_name,
    routine_type,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'is_admin';

-- 7. Test de consulta básica (simular lo que hace la app)
SELECT 
    'TEST CONSULTA BÁSICA' as check_type,
    COUNT(*) as total_profiles
FROM user_profiles;

-- 8. Test de JOIN (puede causar problemas de RLS)
SELECT 
    'TEST JOIN PROFILES-ROLES' as check_type,
    COUNT(*) as total_with_roles
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id;

-- 9. Verificar triggers activos
SELECT 
    'TRIGGERS ACTIVOS' as check_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
   OR trigger_name LIKE '%user%'
ORDER BY trigger_name;

-- 10. Verificar permisos de tablas
SELECT 
    'PERMISOS DE TABLAS' as check_type,
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name IN ('user_profiles', 'user_roles')
  AND grantee IN ('authenticated', 'anon', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- 11. Verificar configuración de auth
SELECT 
    'CONFIGURACIÓN AUTH' as check_type,
    name,
    setting
FROM pg_settings 
WHERE name LIKE '%auth%' OR name LIKE '%rls%'
ORDER BY name;

-- MENSAJE FINAL
SELECT 
    '=== DIAGNÓSTICO COMPLETADO ===' as status,
    'Revisar resultados arriba para identificar problemas' as next_step;
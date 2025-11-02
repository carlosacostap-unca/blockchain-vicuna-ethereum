-- ========================================
-- VERIFICACIÓN RÁPIDA DEL USUARIO ADMIN
-- ========================================

-- 1. ¿Existe el usuario admin@vicuna.com en auth.users?
SELECT 
    '1. USUARIO EN AUTH.USERS' as check_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE - CREAR EN SUPABASE AUTH'
    END as status,
    COUNT(*) as count
FROM auth.users 
WHERE email = 'admin@vicuna.com';

-- 2. ¿Existe el perfil del admin en user_profiles?
SELECT 
    '2. PERFIL EN USER_PROFILES' as check_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE - CREAR PERFIL'
    END as status,
    COUNT(*) as count
FROM user_profiles 
WHERE email = 'admin@vicuna.com';

-- 3. ¿Existe el rol administrador?
SELECT 
    '3. ROL ADMINISTRADOR' as check_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE - CREAR ROL'
    END as status,
    COUNT(*) as count
FROM user_roles 
WHERE name = 'administrador';

-- 4. ¿El admin tiene el rol correcto asignado?
SELECT 
    '4. ADMIN CON ROL CORRECTO' as check_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ CORRECTO'
        ELSE '❌ INCORRECTO - ASIGNAR ROL'
    END as status,
    COUNT(*) as count
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
WHERE up.email = 'admin@vicuna.com' 
  AND ur.name = 'administrador';

-- 5. Mostrar datos completos del admin (si existe)
SELECT 
    '5. DATOS COMPLETOS DEL ADMIN' as info,
    au.id as auth_user_id,
    au.email,
    au.email_confirmed_at,
    up.full_name,
    ur.name as role_name,
    up.created_at as profile_created
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN user_roles ur ON up.role_id = ur.id
WHERE au.email = 'admin@vicuna.com';

-- DIAGNÓSTICO FINAL
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@vicuna.com') = 0 
        THEN '🔴 PROBLEMA: Usuario no existe en Supabase Auth'
        
        WHEN (SELECT COUNT(*) FROM user_profiles WHERE email = 'admin@vicuna.com') = 0 
        THEN '🟡 PROBLEMA: Usuario existe pero no tiene perfil'
        
        WHEN (SELECT COUNT(*) FROM user_profiles up JOIN user_roles ur ON up.role_id = ur.id WHERE up.email = 'admin@vicuna.com' AND ur.name = 'administrador') = 0 
        THEN '🟡 PROBLEMA: Usuario existe pero no tiene rol de administrador'
        
        ELSE '🟢 TODO CORRECTO: Usuario admin configurado correctamente'
    END as diagnostico_final;
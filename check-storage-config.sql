-- Script para verificar la configuración actual de Supabase Storage
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar buckets existentes
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
ORDER BY created_at;

-- 2. Verificar políticas RLS existentes en storage.objects
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
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- 3. Verificar si RLS está habilitado en storage.objects
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 4. Verificar permisos del usuario actual
SELECT current_user, session_user;

-- 5. Verificar roles disponibles
SELECT rolname FROM pg_roles WHERE rolname LIKE '%authenticated%' OR rolname LIKE '%anon%' OR rolname LIKE '%service%';
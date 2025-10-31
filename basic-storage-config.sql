-- Script básico para configurar Storage (con permisos limitados)
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar buckets existentes
SELECT 'Buckets existentes:' as info;
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id IN ('productos-fotos', 'artesanos-fotos');

-- 2. Intentar hacer públicos los buckets (si no lo están)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'productos-fotos' AND public = false;

UPDATE storage.buckets 
SET public = true 
WHERE id = 'artesanos-fotos' AND public = false;

-- 3. Verificar el estado de RLS
SELECT 'Estado de RLS en storage.objects:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 4. Verificar políticas existentes
SELECT 'Políticas existentes:' as info;
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- 5. Mostrar información del usuario actual
SELECT 'Usuario actual:' as info;
SELECT current_user, session_user;
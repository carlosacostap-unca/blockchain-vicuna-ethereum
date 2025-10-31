-- Script para configurar políticas RLS de Supabase Storage
-- Ejecutar en el SQL Editor de Supabase

-- 1. Habilitar RLS en storage.objects si no está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si existen (para evitar conflictos)
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir fotos de productos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver fotos de productos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar sus fotos de productos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar sus fotos de productos" ON storage.objects;
DROP POLICY IF EXISTS "Acceso público a fotos de productos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir fotos de artesanos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver fotos de artesanos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar sus fotos de artesanos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar sus fotos de artesanos" ON storage.objects;
DROP POLICY IF EXISTS "Acceso público a fotos de artesanos" ON storage.objects;

-- 3. Crear políticas para el bucket productos-fotos

-- Permitir a usuarios autenticados subir fotos de productos
CREATE POLICY "Usuarios autenticados pueden subir fotos de productos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'productos-fotos');

-- Permitir acceso público para ver fotos de productos
CREATE POLICY "Acceso público a fotos de productos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'productos-fotos');

-- Permitir a usuarios autenticados actualizar fotos de productos
CREATE POLICY "Usuarios autenticados pueden actualizar sus fotos de productos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'productos-fotos');

-- Permitir a usuarios autenticados eliminar fotos de productos
CREATE POLICY "Usuarios autenticados pueden eliminar sus fotos de productos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'productos-fotos');

-- 4. Crear políticas para el bucket artesanos-fotos

-- Permitir a usuarios autenticados subir fotos de artesanos
CREATE POLICY "Usuarios autenticados pueden subir fotos de artesanos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artesanos-fotos');

-- Permitir acceso público para ver fotos de artesanos
CREATE POLICY "Acceso público a fotos de artesanos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'artesanos-fotos');

-- Permitir a usuarios autenticados actualizar fotos de artesanos
CREATE POLICY "Usuarios autenticados pueden actualizar sus fotos de artesanos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'artesanos-fotos');

-- Permitir a usuarios autenticados eliminar fotos de artesanos
CREATE POLICY "Usuarios autenticados pueden eliminar sus fotos de artesanos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'artesanos-fotos');

-- 5. Verificar que las políticas se crearon correctamente
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

-- 6. Verificar configuración de buckets
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id IN ('productos-fotos', 'artesanos-fotos');
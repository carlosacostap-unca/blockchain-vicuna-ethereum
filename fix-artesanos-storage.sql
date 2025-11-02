-- Script para configurar el storage de artesanos
-- Ejecutar en Supabase SQL Editor

-- 1. Crear el bucket si no existe (esto se debe hacer desde el Dashboard de Supabase)
-- Ir a Storage > Create Bucket
-- Nombre: artesanos-fotos
-- Public: true
-- Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
-- File size limit: 5MB (5242880 bytes)

-- 2. Crear políticas para el bucket artesanos-fotos

-- Política para permitir subida de archivos (INSERT)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'artesanos_upload_policy',
  'artesanos-fotos',
  'Permitir subida de fotos de artesanos a usuarios autenticados',
  '(auth.role() = ''authenticated'')',
  '(auth.role() = ''authenticated'')',
  'INSERT',
  '{authenticated}'
) ON CONFLICT (id) DO UPDATE SET
  definition = EXCLUDED.definition,
  check_definition = EXCLUDED.check_definition;

-- Política para permitir lectura de archivos (SELECT)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'artesanos_read_policy',
  'artesanos-fotos',
  'Permitir lectura pública de fotos de artesanos',
  'true',
  'true',
  'SELECT',
  '{public, authenticated}'
) ON CONFLICT (id) DO UPDATE SET
  definition = EXCLUDED.definition,
  check_definition = EXCLUDED.check_definition;

-- Política para permitir actualización de archivos (UPDATE)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'artesanos_update_policy',
  'artesanos-fotos',
  'Permitir actualización de fotos de artesanos a usuarios autenticados',
  '(auth.role() = ''authenticated'')',
  '(auth.role() = ''authenticated'')',
  'UPDATE',
  '{authenticated}'
) ON CONFLICT (id) DO UPDATE SET
  definition = EXCLUDED.definition,
  check_definition = EXCLUDED.check_definition;

-- Política para permitir eliminación de archivos (DELETE)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'artesanos_delete_policy',
  'artesanos-fotos',
  'Permitir eliminación de fotos de artesanos a usuarios autenticados',
  '(auth.role() = ''authenticated'')',
  '(auth.role() = ''authenticated'')',
  'DELETE',
  '{authenticated}'
) ON CONFLICT (id) DO UPDATE SET
  definition = EXCLUDED.definition,
  check_definition = EXCLUDED.check_definition;

-- Verificar que las políticas se crearon correctamente
SELECT 
  id,
  bucket_id,
  name,
  command,
  roles,
  definition
FROM storage.policies 
WHERE bucket_id = 'artesanos-fotos'
ORDER BY command;

-- Mensaje de confirmación
SELECT 'Políticas de storage para artesanos configuradas correctamente' as mensaje;
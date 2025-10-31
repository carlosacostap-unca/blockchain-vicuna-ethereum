-- ========================================
-- SCRIPT PARA CREAR USUARIO ARTESANO
-- ========================================

-- 1. Verificar que los roles existen
SELECT 
  id,
  name,
  description 
FROM user_roles 
ORDER BY id;

-- 2. Ver todos los usuarios actuales y sus roles
SELECT 
  up.id,
  up.email,
  up.full_name,
  ur.name as role_name,
  up.is_active,
  up.created_at
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
ORDER BY up.created_at DESC;

-- 3. DESPUÉS DE CREAR EL USUARIO EN SUPABASE AUTH,
--    REEMPLAZA 'artesano@ejemplo.com' CON EL EMAIL REAL
--    Y EJECUTA ESTE COMANDO:

UPDATE user_profiles 
SET 
  role_id = (SELECT id FROM user_roles WHERE name = 'artesano'),
  full_name = 'Juan Pérez Artesano',  -- Opcional: cambiar por el nombre real
  updated_at = NOW()
WHERE email = 'artesano@ejemplo.com';  -- CAMBIAR POR EL EMAIL REAL

-- 4. Verificar que el cambio se aplicó correctamente
SELECT 
  up.email,
  up.full_name,
  ur.name as role_name,
  up.is_active,
  up.updated_at
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
WHERE up.email = 'artesano@ejemplo.com';  -- CAMBIAR POR EL EMAIL REAL

-- 5. Opcional: Si quieres crear múltiples usuarios artesanos,
--    puedes usar este template:
/*
-- Para usuario artesano 2
UPDATE user_profiles 
SET 
  role_id = (SELECT id FROM user_roles WHERE name = 'artesano'),
  full_name = 'María González',
  updated_at = NOW()
WHERE email = 'maria.artesana@ejemplo.com';

-- Para usuario artesano 3
UPDATE user_profiles 
SET 
  role_id = (SELECT id FROM user_roles WHERE name = 'artesano'),
  full_name = 'Carlos López',
  updated_at = NOW()
WHERE email = 'carlos.artesano@ejemplo.com';
*/
-- ========================================
-- SOLUCIÓN PARA ERROR DE CREACIÓN DE USUARIO
-- ========================================

-- 1. VERIFICAR QUE LAS TABLAS EXISTEN
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'user_profiles');

-- 2. VERIFICAR QUE LOS ROLES EXISTEN
SELECT * FROM user_roles;

-- 3. DESHABILITAR TEMPORALMENTE EL TRIGGER AUTOMÁTICO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. DESPUÉS DE CREAR EL USUARIO MANUALMENTE EN SUPABASE AUTH, 
--    EJECUTAR ESTE COMANDO PARA CREAR SU PERFIL:

-- REEMPLAZA 'USER_UUID_AQUI' con el UUID real del usuario creado
-- INSERT INTO user_profiles (id, email, full_name, role_id) 
-- VALUES (
--   'USER_UUID_AQUI',
--   'admin@vicuna.com',
--   'Administrador del Sistema',
--   (SELECT id FROM user_roles WHERE name = 'administrador')
-- );

-- 5. REACTIVAR EL TRIGGER DESPUÉS DE CREAR EL USUARIO
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================

-- Verificar que el usuario fue creado correctamente
-- SELECT 
--   up.id,
--   up.email,
--   up.full_name,
--   ur.name as role_name,
--   up.is_active
-- FROM user_profiles up
-- JOIN user_roles ur ON up.role_id = ur.id
-- WHERE up.email = 'admin@vicuna.com';
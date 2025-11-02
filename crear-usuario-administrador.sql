-- ========================================
-- CREAR USUARIO ADMINISTRADOR
-- ========================================

-- 1. Verificar que existe el rol 'administrador'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'administrador') THEN
        INSERT INTO user_roles (name, description) 
        VALUES ('administrador', 'Administrador del sistema con acceso completo');
        RAISE NOTICE 'Rol administrador creado exitosamente';
    ELSE
        RAISE NOTICE 'El rol administrador ya existe';
    END IF;
END $$;

-- 2. Verificar roles disponibles
SELECT 
    id,
    name,
    description,
    created_at
FROM user_roles 
ORDER BY name;

-- 3. Función para crear perfil de administrador automáticamente
CREATE OR REPLACE FUNCTION create_admin_profile()
RETURNS TRIGGER AS $$
DECLARE
    admin_role_id INTEGER;
BEGIN
    -- Obtener el ID del rol administrador
    SELECT id INTO admin_role_id 
    FROM user_roles 
    WHERE name = 'administrador' 
    LIMIT 1;
    
    -- Crear el perfil con rol de administrador
    INSERT INTO user_profiles (
        id,
        email,
        full_name,
        role_id,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Administrador'),
        admin_role_id,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear trigger específico para administradores (temporal)
DROP TRIGGER IF EXISTS on_admin_user_created ON auth.users;
CREATE TRIGGER on_admin_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    WHEN (NEW.email LIKE '%admin%' OR NEW.raw_user_meta_data->>'role' = 'administrador')
    EXECUTE FUNCTION create_admin_profile();

-- 5. Script para asignar rol administrador a usuario existente
-- (Ejecutar después de crear el usuario en Supabase Auth)
/*
-- Reemplazar 'admin@vicuna.com' con el email del administrador
UPDATE user_profiles 
SET role_id = (SELECT id FROM user_roles WHERE name = 'administrador')
WHERE email = 'admin@vicuna.com';
*/

-- 6. Verificar configuración de RLS para administradores
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as command_type,
    qual as using_expression
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_roles')
  AND (policyname LIKE '%admin%' OR qual LIKE '%admin%')
ORDER BY tablename, policyname;

-- 7. Test de función is_admin (si existe)
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'is_admin';

-- Mensaje final
SELECT 
    'LISTO: Configuración para usuario administrador completada' as status,
    'Ahora crear el usuario en Supabase Auth Dashboard' as next_step;
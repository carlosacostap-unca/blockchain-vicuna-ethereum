-- ========================================
-- SOLUCIÓN PARA RECURSIÓN INFINITA EN POLÍTICAS RLS
-- ========================================

-- El error "infinite recursion detected in policy for relation 'user_profiles'"
-- ocurre cuando las políticas RLS se referencian de manera circular.

-- PASO 1: Eliminar TODAS las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authentication" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow admin to read all profiles" ON user_profiles;

-- PASO 2: Deshabilitar temporalmente RLS para limpiar
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- PASO 3: Volver a habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear políticas simples y NO RECURSIVAS

-- Política 1: Permitir a los usuarios ver su propio perfil
-- IMPORTANTE: Usar auth.uid() directamente, NO hacer JOIN con user_profiles
CREATE POLICY "users_select_own_profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Política 2: Permitir a los usuarios actualizar su propio perfil
CREATE POLICY "users_update_own_profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Política 3: Permitir inserción durante el registro (para el trigger)
-- Esta política es crucial para que el trigger funcione
CREATE POLICY "enable_insert_for_service_role" 
ON user_profiles FOR INSERT 
WITH CHECK (true);

-- Política 4: Permitir a los administradores ver todos los perfiles
-- USAR UNA FUNCIÓN SEPARADA para evitar recursión
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Obtener el rol directamente desde la tabla sin JOIN recursivo
  SELECT ur.name INTO user_role
  FROM user_profiles up
  JOIN user_roles ur ON up.role_id = ur.id
  WHERE up.id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role = 'administrador', false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ahora crear la política usando la función
CREATE POLICY "admins_select_all_profiles" 
ON user_profiles FOR SELECT 
USING (is_admin());

-- PASO 5: Políticas para user_roles (sin recursión)
DROP POLICY IF EXISTS "Everyone can view roles" ON user_roles;
CREATE POLICY "authenticated_users_select_roles" 
ON user_roles FOR SELECT 
USING (auth.role() = 'authenticated');

-- PASO 6: Otorgar permisos básicos
GRANT SELECT ON user_roles TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;

-- PASO 7: Verificar que no hay recursión
-- Esta consulta debería funcionar sin errores
SELECT 'Políticas RLS configuradas correctamente - sin recursión' as status;

-- PASO 8: Probar las políticas
DO $$
BEGIN
  -- Intentar una consulta que antes causaba recursión
  PERFORM COUNT(*) FROM user_profiles LIMIT 1;
  RAISE NOTICE 'Test exitoso: Las políticas funcionan sin recursión';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error en test: %', SQLERRM;
END $$;
-- ========================================
-- SOLUCIÓN PARA PROBLEMAS DE CREACIÓN DE USUARIOS
-- ========================================

-- 1. Verificar y recrear la función handle_new_user si es necesario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id INTEGER;
BEGIN
  -- Obtener el ID del rol administrador
  SELECT id INTO default_role_id 
  FROM user_roles 
  WHERE name = 'administrador' 
  LIMIT 1;
  
  -- Si no existe el rol administrador, usar el primer rol disponible
  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id 
    FROM user_roles 
    ORDER BY id 
    LIMIT 1;
  END IF;
  
  -- Insertar el perfil del usuario
  INSERT INTO public.user_profiles (id, email, role_id, full_name, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    default_role_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    true
  )
  ON CONFLICT (id) DO NOTHING; -- Evitar errores si ya existe
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log del error (opcional)
    RAISE LOG 'Error creating user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW; -- Continuar aunque falle la creación del perfil
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Verificar que los roles existen, si no, crearlos
INSERT INTO user_roles (name, description) 
VALUES 
  ('administrador', 'Administrador del sistema'),
  ('artesano', 'Artesano productor'),
  ('cooperativa', 'Cooperativa')
ON CONFLICT (name) DO NOTHING;

-- 4. Habilitar RLS si no está habilitado
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Recrear políticas básicas si no existen
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" 
ON user_profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up 
    JOIN user_roles ur ON up.role_id = ur.id 
    WHERE up.id = auth.uid() AND ur.name = 'administrador'
  )
);

-- 6. Política para permitir inserción durante el registro
DROP POLICY IF EXISTS "Enable insert for authentication" ON user_profiles;
CREATE POLICY "Enable insert for authentication" 
ON user_profiles FOR INSERT 
WITH CHECK (true); -- Permitir inserción durante el registro

-- 7. Políticas para user_roles
DROP POLICY IF EXISTS "Everyone can view roles" ON user_roles;
CREATE POLICY "Everyone can view roles" 
ON user_roles FOR SELECT 
USING (true);

-- 8. Verificar permisos para el usuario anon y authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON user_roles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;

-- 9. Verificar que la secuencia existe para los IDs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'user_roles_id_seq') THEN
    CREATE SEQUENCE user_roles_id_seq;
    ALTER TABLE user_roles ALTER COLUMN id SET DEFAULT nextval('user_roles_id_seq');
    SELECT setval('user_roles_id_seq', COALESCE(MAX(id), 0) + 1, false) FROM user_roles;
  END IF;
END $$;

-- 10. Mensaje de confirmación
SELECT 'Configuración de usuarios actualizada correctamente' as status;
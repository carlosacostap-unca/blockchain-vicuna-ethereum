-- ========================================
-- CONFIGURACIÓN DE AUTENTICACIÓN Y ROLES
-- ========================================

-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS user_roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar roles básicos
INSERT INTO user_roles (name, description) VALUES 
  ('administrador', 'Usuario administrador con acceso completo al sistema'),
  ('artesano', 'Usuario artesano con acceso a funciones específicas de artesanos'),
  ('cooperativa', 'Usuario cooperativa con acceso a funciones de gestión de cooperativas')
ON CONFLICT (name) DO NOTHING;

-- Crear tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role_id BIGINT REFERENCES user_roles(id) NOT NULL,
  artesano_id BIGINT REFERENCES artesanos(id) ON DELETE SET NULL,
  cooperativa_id BIGINT REFERENCES cooperativas(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_artesano_id ON user_profiles(artesano_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cooperativa_id ON user_profiles(cooperativa_id);

-- Crear trigger para actualizar updated_at en user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para user_roles (solo lectura para usuarios autenticados)
DROP POLICY IF EXISTS "Enable read access for authenticated users on user_roles" ON user_roles;
CREATE POLICY "Enable read access for authenticated users on user_roles" 
ON user_roles FOR SELECT 
USING (auth.role() = 'authenticated');

-- Políticas de seguridad para user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Política para administradores (pueden ver todos los perfiles)
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

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    (SELECT id FROM user_roles WHERE name = 'administrador' LIMIT 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT ur.name 
    FROM user_profiles up
    JOIN user_roles ur ON up.role_id = ur.id
    WHERE up.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario tiene un rol específico
CREATE OR REPLACE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) > 0
    FROM user_profiles up
    JOIN user_roles ur ON up.role_id = ur.id
    WHERE up.id = auth.uid() AND ur.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- CREAR USUARIO ADMINISTRADOR POR DEFECTO
-- ========================================

-- Nota: Este usuario se debe crear manualmente en Supabase Auth
-- Email: admin@vicuna.com
-- Password: Admin123!
-- Después de crear el usuario, ejecutar:
-- UPDATE user_profiles SET role_id = (SELECT id FROM user_roles WHERE name = 'administrador') 
-- WHERE email = 'admin@vicuna.com';
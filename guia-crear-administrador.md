# 🔐 Guía para Crear Usuario Administrador

## 📋 Pasos para crear un usuario administrador

### 1. Ejecutar Script de Preparación
1. Ve al **Supabase Dashboard** → **SQL Editor**
2. Ejecuta el archivo `crear-usuario-administrador.sql`
3. Verifica que no haya errores en la ejecución

### 2. Crear Usuario en Supabase Auth
1. Ve a **Authentication** → **Users** en el dashboard de Supabase
2. Haz clic en **"Add user"**
3. Completa los datos:
   - **Email**: `admin@vicuna.com` (o el email que prefieras)
   - **Password**: `Admin123!` (o una contraseña segura)
   - **Confirm password**: Repite la contraseña
   - **Auto Confirm User**: ✅ Activado
   - **Send Magic Link**: ❌ Desactivado

### 3. Asignar Rol Administrador
Después de crear el usuario, ejecuta este SQL en el **SQL Editor**:

```sql
-- Asignar rol administrador al usuario creado
UPDATE user_profiles 
SET role_id = (SELECT id FROM user_roles WHERE name = 'administrador')
WHERE email = 'admin@vicuna.com';

-- Verificar que se asignó correctamente
SELECT 
    up.email,
    up.full_name,
    ur.name as role_name,
    up.created_at
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
WHERE up.email = 'admin@vicuna.com';
```

### 4. Verificar el Usuario
1. Ve a **Authentication** → **Users**
2. Deberías ver el nuevo usuario con email `admin@vicuna.com`
3. El usuario debe tener estado **"Confirmed"**

### 5. Probar el Login
1. Ve a tu aplicación: `http://localhost:3000/login`
2. Inicia sesión con:
   - **Email**: `admin@vicuna.com`
   - **Password**: `Admin123!`
3. Deberías ser redirigido a `/admin` con acceso completo

## 🔍 Verificación de Roles

Para verificar que los roles están configurados correctamente:

```sql
-- Ver todos los roles disponibles
SELECT * FROM user_roles ORDER BY name;

-- Ver todos los usuarios y sus roles
SELECT 
    up.email,
    up.full_name,
    ur.name as role_name,
    up.created_at
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
ORDER BY up.created_at DESC;
```

## 🚨 Solución de Problemas

### Si el usuario no se crea automáticamente en user_profiles:
```sql
-- Crear manualmente el perfil de administrador
INSERT INTO user_profiles (
    id,
    email,
    full_name,
    role_id,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@vicuna.com'),
    'admin@vicuna.com',
    'Administrador del Sistema',
    (SELECT id FROM user_roles WHERE name = 'administrador'),
    NOW(),
    NOW()
);
```

### Si hay errores de RLS:
1. Ejecuta primero `fix-rls-infinite-recursion.sql`
2. Luego ejecuta `crear-usuario-administrador.sql`

## ✅ Credenciales por Defecto

- **Email**: `admin@vicuna.com`
- **Password**: `Admin123!`
- **Rol**: `administrador`
- **Acceso**: Panel completo de administración

## 🔒 Seguridad

⚠️ **IMPORTANTE**: Cambia la contraseña por defecto después del primer login por seguridad.

## 📞 Soporte

Si encuentras algún problema, revisa:
1. Los logs del SQL Editor en Supabase
2. La consola del navegador para errores de RLS
3. Los archivos de solución: `fix-rls-infinite-recursion.sql` y `solucion-error-usuario.md`
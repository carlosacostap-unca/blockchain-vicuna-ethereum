# Guía para Crear Usuario Artesano en Supabase

## Opción 1: Crear en Supabase Dashboard (Recomendado)

### Paso 1: Acceder a Supabase Dashboard
1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto "blockchain-vicuna-ethereum"

### Paso 2: Crear el Usuario en Authentication
1. En el panel izquierdo, haz clic en **"Authentication"**
2. Haz clic en **"Users"**
3. Haz clic en **"Add user"** o **"Invite"**
4. Completa los datos:
   - **Email**: `artesano@ejemplo.com` (o el email que prefieras)
   - **Password**: `Artesano123!` (o la contraseña que prefieras)
   - **Confirm password**: Repite la contraseña
5. Haz clic en **"Send invitation"** o **"Create user"**

### Paso 3: Asignar el Rol de Artesano
1. En el mismo dashboard, ve a **"Table Editor"**
2. Selecciona la tabla **"user_profiles"**
3. Busca el usuario que acabas de crear (por email)
4. Haz clic en **"Edit"** en esa fila
5. Cambia el campo **"role_id"** de `1` (administrador) a `2` (artesano)
6. Guarda los cambios

## Opción 2: Usar SQL Editor

### Paso 1: Ir al SQL Editor
1. En Supabase Dashboard, haz clic en **"SQL Editor"**
2. Crea una nueva query

### Paso 2: Ejecutar el siguiente SQL
```sql
-- Primero, verifica que los roles existen
SELECT * FROM user_roles;

-- Luego, después de crear el usuario en Authentication, 
-- actualiza su rol con este comando (reemplaza el email):
UPDATE user_profiles 
SET role_id = (SELECT id FROM user_roles WHERE name = 'artesano')
WHERE email = 'artesano@ejemplo.com';

-- Verifica que se asignó correctamente:
SELECT 
  up.email,
  up.full_name,
  ur.name as role_name
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
WHERE up.email = 'artesano@ejemplo.com';
```

## Datos de Ejemplo para el Usuario Artesano

- **Email**: `artesano@ejemplo.com`
- **Contraseña**: `Artesano123!`
- **Nombre completo**: `Juan Pérez` (opcional)
- **Rol**: `artesano`

## Verificación

Una vez creado el usuario, puedes verificar que funciona:

1. Ve a tu aplicación: http://localhost:3000
2. Haz clic en el menú hamburguesa (tres líneas verticales)
3. Selecciona **"Acceso Artesano"**
4. Ingresa las credenciales del usuario que creaste
5. Deberías ser redirigido al panel de artesanos

## Notas Importantes

- El sistema automáticamente crea un perfil cuando se registra un usuario nuevo
- Por defecto, todos los usuarios nuevos se crean con rol "administrador"
- Debes cambiar manualmente el rol a "artesano" después de la creación
- Asegúrate de usar una contraseña segura en producción
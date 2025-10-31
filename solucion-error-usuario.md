# Solución para Error "Database error creating new user"

## 🚨 Problema
Al intentar crear un usuario en Supabase Auth aparece el error: **"Failed to create user: Database error creating new user"**

## 🔍 Posibles Causas
1. **Trigger defectuoso**: El trigger que crea automáticamente el perfil del usuario puede estar fallando
2. **Políticas RLS muy restrictivas**: Las políticas de seguridad pueden estar bloqueando la inserción
3. **Roles faltantes**: La tabla `user_roles` puede estar vacía
4. **Permisos insuficientes**: El usuario `authenticated` puede no tener permisos para insertar en `user_profiles`

## 🛠️ Solución Paso a Paso

### Paso 1: Ejecutar Diagnóstico
1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta el script `debug-user-creation.sql`
3. Revisa los resultados para identificar el problema específico

### Paso 2: Aplicar Correcciones
1. En el **SQL Editor**, ejecuta el script `fix-user-creation-issues.sql`
2. Este script:
   - Corrige el trigger de creación de perfiles
   - Asegura que los roles existen
   - Ajusta las políticas RLS
   - Otorga los permisos necesarios

### Paso 3: Verificar la Corrección
```sql
-- Verificar que los roles existen
SELECT * FROM user_roles;

-- Verificar que el trigger funciona
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### Paso 4: Intentar Crear Usuario Nuevamente
1. Ve a **Authentication** → **Users**
2. Intenta crear el usuario nuevamente:
   - **Email**: `artesano@vicuna.com`
   - **Password**: `Artesano123!`
   - **Auto Confirm User**: ✅ (marcado)

## 🔄 Método Alternativo: Creación Manual

Si el problema persiste, puedes crear el usuario manualmente:

### Opción A: Crear sin trigger
```sql
-- 1. Insertar en auth.users (requiere permisos de servicio)
-- Esto normalmente se hace desde el dashboard

-- 2. Crear el perfil manualmente después
INSERT INTO user_profiles (id, email, role_id, full_name, is_active)
VALUES (
  'USER_ID_FROM_AUTH_USERS', -- Reemplazar con el ID real
  'artesano@vicuna.com',
  (SELECT id FROM user_roles WHERE name = 'artesano'),
  'Artesano de Prueba',
  true
);
```

### Opción B: Usar la API de Supabase
```javascript
// Desde la consola del navegador en tu aplicación
const { data, error } = await supabase.auth.signUp({
  email: 'artesano@vicuna.com',
  password: 'Artesano123!'
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('Usuario creado:', data);
}
```

## 🧪 Verificación Final

Después de crear el usuario, verifica que todo esté correcto:

```sql
-- Verificar que el usuario y perfil existen
SELECT 
  up.id,
  up.email,
  up.full_name,
  ur.name as role_name,
  up.is_active,
  up.created_at
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
WHERE up.email = 'artesano@vicuna.com';
```

## 📝 Notas Importantes

- **Siempre ejecuta los scripts en orden**: diagnóstico primero, luego corrección
- **Haz backup**: Antes de ejecutar scripts de corrección en producción
- **Verifica permisos**: Asegúrate de tener permisos de administrador en Supabase
- **Revisa logs**: Si el problema persiste, revisa los logs de Supabase para más detalles

## 🆘 Si Nada Funciona

1. **Contacta soporte de Supabase**: Puede ser un problema de configuración del proyecto
2. **Recrea las tablas**: Como último recurso, puedes recrear la estructura de usuarios
3. **Verifica la configuración del proyecto**: Asegúrate de que RLS esté configurado correctamente
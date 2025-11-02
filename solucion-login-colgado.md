# 🔧 Solución para Login Colgado en "Iniciando sesión..."

## 🎯 Problema Identificado
El login se queda colgado en "Iniciando sesión..." sin mostrar errores, lo que indica un problema en el flujo de autenticación o carga del perfil.

## 🔍 Diagnóstico Paso a Paso

### 1. **Verificar Usuario Administrador**
Ejecuta en **Supabase SQL Editor**:
```sql
-- Usar el archivo: verificar-admin-rapido.sql
```

### 2. **Verificar Configuración RLS**
Ejecuta en **Supabase SQL Editor**:
```sql
-- Usar el archivo: debug-login-issue.sql
```

### 3. **Revisar Logs en el Navegador**
1. Abre **DevTools** (F12)
2. Ve a la pestaña **Console**
3. Intenta hacer login
4. Busca logs que empiecen con:
   - 🚀 Starting login process
   - 📡 Calling signIn function
   - 🔍 LoginForm useEffect triggered

## 🚨 Problemas Comunes y Soluciones

### **Problema 1: Usuario no existe**
Si `verificar-admin-rapido.sql` muestra que el usuario no existe:

1. Ve a **Supabase Dashboard** → **Authentication** → **Users**
2. Haz clic en **"Add user"**
3. Completa:
   - Email: `admin@vicuna.com`
   - Password: `Admin123!`
   - Auto Confirm User: ✅
4. Ejecuta después:
```sql
-- Crear perfil manualmente
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

### **Problema 2: RLS con recursión infinita**
Si hay errores de "infinite recursion detected":

1. Ejecuta: `fix-rls-infinite-recursion.sql`
2. Verifica con: `verify-rls-fix.sql`

### **Problema 3: Perfil no se carga**
Si el usuario se autentica pero el perfil no carga:

```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Recrear políticas si es necesario
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
```

### **Problema 4: Rol administrador no existe**
```sql
-- Crear rol administrador
INSERT INTO user_roles (name, description) 
VALUES ('administrador', 'Administrador del sistema con acceso completo')
ON CONFLICT (name) DO NOTHING;
```

## 🔧 Solución Completa (Ejecutar en orden)

### **Paso 1: Limpiar RLS**
```sql
-- Ejecutar: fix-rls-infinite-recursion.sql
```

### **Paso 2: Crear/Verificar Usuario**
```sql
-- Ejecutar: verificar-admin-rapido.sql
-- Si falla, crear usuario en Supabase Auth Dashboard
```

### **Paso 3: Crear Perfil (si no existe)**
```sql
-- Ejecutar: crear-usuario-administrador.sql
```

### **Paso 4: Verificar Configuración**
```sql
-- Ejecutar: debug-login-issue.sql
```

## 🧪 Probar el Login

1. **Abrir DevTools** (F12) → Console
2. **Ir a**: `http://localhost:3000/login`
3. **Ingresar credenciales**:
   - Email: `admin@vicuna.com`
   - Password: `Admin123!`
4. **Observar logs** en la consola

### **Logs Esperados (Exitoso):**
```
🚀 Starting login process: { email: "admin@vicuna.com", timestamp: "..." }
📡 Calling signIn function...
📡 SignIn response: { hasError: false, timestamp: "..." }
✅ SignIn successful, waiting for profile to load...
🔍 LoginForm useEffect triggered: { loading: true, user: true, profile: false, ... }
User profile loaded: { userId: "...", profileData: {...}, roleData: {...} }
🔍 LoginForm useEffect triggered: { loading: true, user: true, profile: true, ... }
✅ Redirecting to admin panel: { userId: "...", profileRole: "administrador", ... }
```

### **Logs de Error (Problemas):**
- **Sin logs**: Problema de conexión a Supabase
- **Error en signIn**: Credenciales incorrectas o usuario no existe
- **Profile no carga**: Problema con RLS o políticas
- **Recursión infinita**: Ejecutar `fix-rls-infinite-recursion.sql`

## 📞 Troubleshooting Avanzado

### **Si el problema persiste:**

1. **Verificar variables de entorno**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Verificar conexión a Supabase**:
```javascript
// En la consola del navegador
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

3. **Reiniciar servidor de desarrollo**:
```bash
npm run dev
```

4. **Limpiar caché del navegador**:
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)

## ✅ Verificación Final

Una vez solucionado, deberías poder:
1. ✅ Hacer login con `admin@vicuna.com` / `Admin123!`
2. ✅ Ver logs detallados en la consola
3. ✅ Ser redirigido a `/admin` automáticamente
4. ✅ Ver el panel de administración completo

## 🔒 Seguridad Post-Solución

⚠️ **IMPORTANTE**: Después de solucionar:
1. Cambiar la contraseña por defecto
2. Remover los logs de depuración del código
3. Verificar que las políticas RLS estén correctas
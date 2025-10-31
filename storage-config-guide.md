# Guía para Configurar Políticas de Supabase Storage

## Problema Identificado
El error "must be owner of table objects" indica que no tienes permisos para modificar políticas RLS directamente desde SQL. Esto es normal en proyectos de Supabase donde no eres el propietario de la base de datos.

## Solución: Configurar desde el Dashboard

### Paso 1: Acceder a Storage en Supabase Dashboard
1. Ve a tu proyecto en https://supabase.com/dashboard
2. Navega a **Storage** en el menú lateral
3. Selecciona **Policies** en la parte superior

### Paso 2: Configurar Políticas para `productos-fotos`

#### Política 1: INSERT (Subir fotos)
- **Name**: `Usuarios autenticados pueden subir fotos de productos`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: (dejar vacío)
- **WITH CHECK expression**: `bucket_id = 'productos-fotos'`

#### Política 2: SELECT (Ver fotos)
- **Name**: `Acceso público a fotos de productos`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**: `bucket_id = 'productos-fotos'`
- **WITH CHECK expression**: (dejar vacío)

#### Política 3: UPDATE (Actualizar fotos)
- **Name**: `Usuarios autenticados pueden actualizar fotos de productos`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'productos-fotos'`
- **WITH CHECK expression**: `bucket_id = 'productos-fotos'`

#### Política 4: DELETE (Eliminar fotos)
- **Name**: `Usuarios autenticados pueden eliminar fotos de productos`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'productos-fotos'`
- **WITH CHECK expression**: (dejar vacío)

### Paso 3: Configurar Políticas para `artesanos-fotos`

Repetir el mismo proceso pero cambiando `productos-fotos` por `artesanos-fotos` en todas las expresiones.

### Paso 4: Verificar Buckets
1. Ve a **Storage** > **Buckets**
2. Verifica que ambos buckets (`productos-fotos` y `artesanos-fotos`) estén marcados como **Public**
3. Si no están públicos, haz clic en el bucket y marca la opción **Public bucket**

## Alternativa: Usar el Service Role Key

Si tienes acceso al Service Role Key (clave de servicio), puedes ejecutar el script SQL original usando esa clave en lugar de la clave anónima.

## Verificación
Después de configurar las políticas, ejecuta el script `check-storage-config.sql` para verificar que todo esté correctamente configurado.
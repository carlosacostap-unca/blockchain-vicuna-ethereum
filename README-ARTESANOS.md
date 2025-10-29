# Sistema de Gestión de Artesanos, Chakus y COLT

Una aplicación web completa desarrollada con Next.js y Supabase para la gestión integral de artesanos, chakus y certificados COLT (Certificado de Origen y Legítima Tenencia) según la Ley Nº 4855.

## Características Principales

### 🎨 Gestión de Artesanos
- **Registro completo**: nombres, apellidos, domicilio, DNI, fecha de nacimiento, contacto
- **Gestión de fotografías**: subida y almacenamiento seguro de imágenes
- **Búsqueda avanzada**: filtrado por nombre, apellido, DNI o contacto
- **Operaciones CRUD**: crear, leer, actualizar y eliminar registros

### 🏔️ Gestión de Chakus
- **Registro de chakus**: nombre y datos básicos
- **Búsqueda instantánea**: filtrado en tiempo real
- **Operaciones CRUD completas**
- **Integración con COLT**: vinculación directa con certificados

### 📋 Gestión de COLT (Certificado de Origen y Legítima Tenencia)
- **Campos completos según Ley Nº 4855**:
  - Número de certificado
  - Autorización a artesano (vinculado a registro existente)
  - Unidad (Kg) con selector
  - Cantidad numérica
  - Materia prima (Vicugna vicugna) con selector
  - Descripción detallada
  - Lugar de procedencia (En silvestría/Otro) con selector
  - Vinculación a chaku (opcional)
  - Año de emisión
  - Documentación de origen
  - Destino o motivo (Transformación/Comercialización) con selector
  - Fecha de expedición

- **Funcionalidades avanzadas**:
  - Búsqueda por múltiples campos (número, artesano, DNI, chaku, descripción)
  - Filtros por año y destino
  - Estadísticas en tiempo real
  - Validaciones completas del formulario
  - Relaciones automáticas con artesanos y chakus existentes

## Campos de Datos

### Artesanos
- **nombres**: Nombre(s) del artesano
- **apellidos**: Apellidos del artesano
- **domicilio**: Dirección de residencia
- **dni**: Documento Nacional de Identidad
- **fecha_nacimiento**: Fecha de nacimiento
- **contacto**: Información de contacto (teléfono, email, etc.)
- **fotografia_url**: URL de la fotografía almacenada en Supabase Storage

### Chakus
- **nombre**: Nombre del chaku

## 🛠️ Configuración

### 1. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve a la sección SQL Editor y ejecuta el script `supabase-setup.sql`
3. Copia las credenciales de tu proyecto

### 2. Variables de Entorno

Edita el archivo `.env.local` y reemplaza con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Ejecutar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
├── app/
│   ├── page.tsx              # Página principal
│   ├── layout.tsx            # Layout de la aplicación
│   └── globals.css           # Estilos globales
├── components/
│   ├── ArtesanoForm.tsx      # Formulario de artesanos
│   └── ArtesanosList.tsx     # Lista de artesanos
├── lib/
│   └── supabase.ts           # Configuración de Supabase
├── supabase-setup.sql        # Script de configuración de BD
└── .env.local                # Variables de entorno
```

## 🗄️ Esquema de Base de Datos

### Tabla `artesanos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGSERIAL | ID único (clave primaria) |
| nombres | VARCHAR(100) | Nombres del artesano |
| apellidos | VARCHAR(100) | Apellidos del artesano |
| domicilio | TEXT | Dirección completa |
| dni | VARCHAR(20) | DNI único |
| fecha_nacimiento | DATE | Fecha de nacimiento |
| contacto | VARCHAR(50) | Información de contacto |
| fotografia_url | TEXT | URL de la fotografía |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |

### Storage Bucket

- **Nombre**: `artesanos-fotos`
- **Público**: Sí
- **Formatos permitidos**: JPG, PNG, GIF
- **Tamaño máximo**: 5MB

## 🔧 Funcionalidades

### Gestión de Artesanos

1. **Crear**: Formulario completo con validación
2. **Leer**: Lista con búsqueda y filtros
3. **Actualizar**: Edición de datos existentes
4. **Eliminar**: Eliminación con confirmación

### Gestión de Fotografías

- Subida de imágenes al storage de Supabase
- Validación de formato y tamaño
- Previsualización de imágenes
- URLs públicas automáticas

### Características Adicionales

- **Búsqueda**: Por nombres, apellidos o DNI
- **Estadísticas**: Contadores en tiempo real
- **Cálculo de edad**: Automático basado en fecha de nacimiento
- **Interfaz responsiva**: Funciona en móviles y desktop

## 🔒 Seguridad

- Row Level Security (RLS) habilitado
- Políticas de acceso configuradas
- Validación de archivos en el frontend
- Sanitización de datos de entrada

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Otras Plataformas

La aplicación es compatible con cualquier plataforma que soporte Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📝 Notas Importantes

- Asegúrate de ejecutar el script SQL antes de usar la aplicación
- Las fotografías se almacenan en Supabase Storage
- La aplicación requiere conexión a internet para funcionar
- Los datos se sincronizan en tiempo real

## 🐛 Solución de Problemas

### Error de conexión a Supabase
- Verifica las variables de entorno
- Confirma que el proyecto de Supabase esté activo

### Error al subir fotografías
- Verifica que el bucket `artesanos-fotos` exista
- Confirma que las políticas de storage estén configuradas

### Errores de base de datos
- Ejecuta nuevamente el script `supabase-setup.sql`
- Verifica que las tablas se hayan creado correctamente

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias, por favor:
1. Revisa la documentación
2. Verifica la configuración
3. Crea un issue en el repositorio

---

**Desarrollado con ❤️ usando Next.js 15 y Supabase**
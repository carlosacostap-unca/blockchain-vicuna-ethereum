# Gestión de CTPSFS (Certificado de Transformación de Productos y Subproductos de Fauna Silvestre)

## Descripción

El módulo de CTPSFS permite gestionar los Certificados de Transformación de Productos y Subproductos de Fauna Silvestre, incluyendo sus procesos de transformación asociados. Este sistema maneja la información completa de cada certificado y sus múltiples procesos de transformación.

## Estructura de Datos

### Tabla CTPSFS

La tabla principal `ctpsfs` contiene la información básica del certificado:

- **id**: Identificador único (autoincremental)
- **numero**: Número del certificado CTPSFS (único, requerido)
- **descripcion_producto**: Descripción detallada del producto (requerido)
- **chaku_id**: Referencia al chaku asociado (opcional)
- **año**: Año del certificado (requerido)
- **documentacion_origen**: Documentación que ampara el origen (requerido)
- **created_at**: Fecha de creación
- **updated_at**: Fecha de última actualización

### Tabla Procesos de Transformación

La tabla `ctpsfs_procesos_transformacion` contiene los procesos asociados a cada CTPSFS:

- **id**: Identificador único (autoincremental)
- **ctpsfs_id**: Referencia al CTPSFS padre (requerido)
- **descripcion_producto**: Descripción del producto transformado (requerido)
- **cantidad**: Cantidad del producto (decimal, requerido)
- **unidad**: Unidad de medida (por defecto "Kg")
- **documentacion_tenencia**: Documentación que ampara la tenencia (requerido)
- **fecha_certificacion**: Fecha de certificación (requerido)
- **artesano_id**: Referencia al artesano permisionario (requerido)
- **created_at**: Fecha de creación
- **updated_at**: Fecha de última actualización

## Relaciones

- **CTPSFS → Chaku**: Relación opcional (muchos a uno)
- **CTPSFS → Procesos de Transformación**: Relación uno a muchos
- **Proceso de Transformación → Artesano**: Relación muchos a uno (permisionario)

## Funcionalidades

### 1. Listado de CTPSFS

El componente `CTPSFSList` proporciona:

- **Visualización completa**: Muestra todos los certificados con información resumida
- **Búsqueda avanzada**: Permite buscar por:
  - Número del certificado
  - Descripción del producto
  - Documentación de origen
  - Nombre del chaku asociado
  - Información de procesos de transformación
  - Datos del artesano permisionario (nombre, apellido, DNI)
- **Filtros**:
  - Por año del certificado
  - Por chaku asociado
- **Información mostrada**:
  - Datos básicos del certificado
  - Cantidad total de procesos
  - Suma total de cantidades de todos los procesos
  - Detalles de cada proceso de transformación
  - Información del permisionario de cada proceso

### 2. Formulario de CTPSFS

El componente `CTPSFSForm` permite:

- **Crear nuevos certificados**: Formulario completo para registro inicial
- **Editar certificados existentes**: Modificación de datos y procesos
- **Gestión dinámica de procesos**:
  - Agregar múltiples procesos de transformación
  - Eliminar procesos (mínimo 1 proceso requerido)
  - Validación individual de cada proceso
- **Validaciones**:
  - Campos requeridos en datos principales
  - Validación de cantidad (debe ser mayor a 0)
  - Selección obligatoria de artesano permisionario
  - Fechas válidas

### 3. Campos del Formulario

#### Datos Principales del Certificado
- **Número**: Campo de texto único y requerido
- **Descripción del Producto**: Área de texto para descripción detallada
- **Chaku**: Selector opcional de chakus existentes
- **Año**: Campo numérico con validación de rango
- **Documentación de Origen**: Área de texto requerida

#### Procesos de Transformación (Dinámicos)
- **Descripción del Producto**: Descripción específica del producto transformado
- **Cantidad**: Campo numérico decimal con validación
- **Unidad**: Campo de texto (por defecto "Kg")
- **Documentación de Tenencia**: Área de texto requerida
- **Fecha de Certificación**: Selector de fecha
- **Permisionario**: Selector de artesanos existentes

## Tipos TypeScript

```typescript
interface CTPSFS {
  id: number
  numero: string
  descripcion_producto: string
  chaku_id: number | null
  ano: number
  documentacion_origen: string
  created_at: string
  updated_at: string
}

interface CTPSFSProcesoTransformacion {
  id: number
  ctpsfs_id: number
  descripcion_producto: string
  cantidad: number
  unidad: string
  documentacion_tenencia: string
  fecha_certificacion: string
  artesano_id: number
  created_at: string
  updated_at: string
}

interface CTPSFSWithRelations extends CTPSFS {
  chaku?: Chaku
  procesos_transformacion?: CTPSFSProcesoTransformacionWithRelations[]
}

interface CTPSFSProcesoTransformacionWithRelations extends CTPSFSProcesoTransformacion {
  artesano?: Artesano
}
```

## Navegación

El sistema de CTPSFS está integrado en la navegación principal de la aplicación:

- **Pestaña CTPSFS**: Acceso directo desde el header principal
- **Vista Lista**: Visualización de todos los certificados
- **Vista Formulario**: Creación y edición de certificados
- **Navegación contextual**: Botones para alternar entre lista y formulario

## Características Técnicas

### Seguridad
- **Row Level Security (RLS)**: Implementado en ambas tablas
- **Políticas de acceso**: Configuradas para operaciones CRUD
- **Validación de datos**: En frontend y base de datos

### Performance
- **Índices optimizados**: En campos de búsqueda frecuente
- **Consultas eficientes**: Uso de joins para cargar relaciones
- **Paginación**: Preparado para grandes volúmenes de datos

### Integridad de Datos
- **Claves foráneas**: Relaciones garantizadas a nivel de base de datos
- **Restricciones únicas**: Número de certificado único
- **Triggers**: Actualización automática de timestamps
- **Eliminación en cascada**: Los procesos se eliminan al eliminar el CTPSFS

## Instalación y Configuración

1. **Base de Datos**: Ejecutar el script SQL incluido en `supabase-setup.sql`
2. **Componentes**: Los componentes están listos para usar
3. **Navegación**: Integrada automáticamente en la página principal

## Uso

1. **Acceder a CTPSFS**: Hacer clic en la pestaña "CTPSFS" en el header
2. **Ver certificados**: La vista por defecto muestra la lista completa
3. **Buscar/Filtrar**: Usar los controles de búsqueda y filtros
4. **Crear nuevo**: Hacer clic en "+ Nuevo CTPSFS"
5. **Editar existente**: Hacer clic en "Editar" en cualquier certificado
6. **Gestionar procesos**: Agregar/eliminar procesos en el formulario

## Validaciones y Restricciones

- **Número único**: No se permiten certificados con el mismo número
- **Mínimo un proceso**: Cada certificado debe tener al menos un proceso de transformación
- **Cantidad positiva**: Las cantidades deben ser mayores a cero
- **Fechas válidas**: Las fechas de certificación deben ser válidas
- **Referencias válidas**: Chakus y artesanos deben existir en el sistema

## Consideraciones Especiales

- **Eliminación**: Al eliminar un CTPSFS se eliminan automáticamente todos sus procesos
- **Edición**: Al editar se reemplazan todos los procesos existentes
- **Búsqueda**: La búsqueda incluye datos de tablas relacionadas
- **Filtros**: Los filtros se actualizan dinámicamente según los datos disponibles
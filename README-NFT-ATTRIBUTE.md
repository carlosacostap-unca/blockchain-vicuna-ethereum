# Atributo NFT para Productos

## Descripción
Se ha añadido funcionalidad para rastrear si un producto ya tiene un NFT creado. Esto incluye:

- Campo `nft_creado` (boolean): Indica si ya se ha creado un NFT para el producto
- Campo `nft_transaction_hash` (string): Hash de la transacción blockchain cuando se creó el NFT
- Campo `nft_token_id` (bigint): ID del token NFT en el contrato inteligente

## Cambios Realizados

### 1. Base de Datos
- ✅ Script SQL creado: `add-nft-column.sql`
- ✅ Añadidas columnas: `nft_creado`, `nft_transaction_hash`, `nft_token_id`
- ✅ Índices creados para mejorar rendimiento
- ✅ Restricción única para `nft_token_id`

### 2. Interfaces TypeScript
- ✅ Actualizada interfaz `Producto` en `lib/supabase.ts`
- ✅ Actualizada interfaz `ProductoCompleto` en `app/admin/generar-nft/page.tsx`

### 3. Funcionalidad de Generación de NFT
- ✅ Modificada función `mintNFT` para actualizar la base de datos
- ✅ Captura del token ID desde los eventos de la transacción
- ✅ Actualización automática del estado del producto

### 4. Interfaz de Usuario
- ✅ Indicadores visuales en el selector de productos
- ✅ Información adicional para productos con NFT existente
- ✅ Enlaces a Etherscan para verificar transacciones

### 5. Consultas de Base de Datos
- ✅ Las consultas existentes usan `*` por lo que incluyen automáticamente los nuevos campos

## Instrucciones de Instalación

### Paso 1: Aplicar Cambios de Base de Datos
Ejecuta el siguiente script SQL en tu base de datos Supabase:

```sql
-- Ejecutar el contenido del archivo add-nft-column.sql
```

O desde la interfaz de Supabase:
1. Ve a tu proyecto en Supabase
2. Navega a "SQL Editor"
3. Copia y pega el contenido de `add-nft-column.sql`
4. Ejecuta el script

### Paso 2: Verificar la Instalación
1. Ve a la página de generación de NFT: `/admin/generar-nft`
2. Verifica que los productos se muestren correctamente
3. Los productos con NFT creado deberían mostrar el ícono 🎨 y información adicional

## Funcionalidades

### Indicadores Visuales
- **🎨 NFT CREADO**: Prefijo en productos que ya tienen NFT
- **Fondo amarillo**: En el selector para productos con NFT
- **Token ID**: Se muestra el número del token si está disponible
- **Información adicional**: Panel con detalles del NFT existente

### Información de Transacción
- **Hash de transacción**: Enlace directo a Etherscan Sepolia
- **Token ID**: Número único del NFT en el contrato
- **Estado**: Indicación clara de si el producto ya tiene NFT

### Prevención de Duplicados
- Los usuarios pueden ver claramente qué productos ya tienen NFT
- Se permite crear múltiples NFT del mismo producto si es necesario
- Información completa de trazabilidad blockchain

## Estructura de Datos

### Tabla `productos` - Nuevas Columnas
```sql
nft_creado BOOLEAN DEFAULT FALSE NOT NULL
nft_transaction_hash VARCHAR(66)
nft_token_id BIGINT UNIQUE
```

### Índices Creados
- `idx_productos_nft_creado` en `nft_creado`
- `idx_productos_nft_tx_hash` en `nft_transaction_hash`
- `idx_productos_nft_token_id` en `nft_token_id`

## Notas Técnicas

- Los cambios son retrocompatibles
- Los productos existentes tendrán `nft_creado = false` por defecto
- El token ID se captura automáticamente desde los eventos de la blockchain
- Se mantiene la trazabilidad completa de cada NFT creado

## Próximos Pasos Sugeridos

1. **Filtros**: Añadir filtros para mostrar solo productos sin NFT o solo con NFT
2. **Dashboard**: Crear estadísticas de NFTs creados
3. **Historial**: Mantener un historial de todas las transacciones NFT
4. **Validaciones**: Prevenir creación de NFT para productos sin datos completos
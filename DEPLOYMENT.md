# Guía de Despliegue en Vercel

Este documento proporciona instrucciones paso a paso para desplegar el proyecto blockchain-vicuna-ethereum en Vercel.

## Prerrequisitos

1. **Cuenta de Vercel**: Crear una cuenta en [vercel.com](https://vercel.com)
2. **Repositorio en GitHub**: El código debe estar subido a GitHub (ya completado)
3. **Variables de entorno**: Configurar las variables necesarias

## Pasos para el Despliegue

### 1. Conectar el Repositorio

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión
2. Hacer clic en "New Project"
3. Importar el repositorio: `https://github.com/carlosacostap-unca/blockchain-vicuna-ethereum`
4. Vercel detectará automáticamente que es un proyecto Next.js

### 2. Configurar Variables de Entorno

En el dashboard de Vercel, ir a la sección "Environment Variables" y agregar:

#### Variables Requeridas (NEXT_PUBLIC_*)
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x41B041ab8691022d70f491a71fC62059f1BdbaFB
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
```

#### Variables de Supabase (si se usa base de datos)
```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

#### Variables Opcionales (para mejores proveedores RPC)
```
NEXT_PUBLIC_INFURA_PROJECT_ID=tu_project_id_de_infura
NEXT_PUBLIC_ALCHEMY_API_KEY=tu_api_key_de_alchemy
```

### 3. Configuración de Build

Vercel usará automáticamente:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Desplegar

1. Hacer clic en "Deploy"
2. Vercel construirá y desplegará automáticamente
3. El proceso toma aproximadamente 2-5 minutos

## Funcionalidades Desplegadas

Una vez desplegado, el proyecto incluirá:

- **Página Principal**: Sistema de gestión de artesanos y productos
- **Galería NFT**: `/galeria` - Vista pública de todos los NFTs
- **Minteo**: `/mint` - Crear nuevos NFTs
- **Mis NFTs**: `/mis-nfts` - NFTs del usuario conectado
- **Vista Individual**: `/nft/[tokenId]` - Detalles de NFT específico
- **Trazabilidad**: `/trazabilidad/[tokenId]` - Historial del producto

## Verificación Post-Despliegue

### 1. Funcionalidades a Probar

- [ ] Página principal carga correctamente
- [ ] Galería NFT muestra los NFTs existentes
- [ ] Conexión con MetaMask funciona
- [ ] Lectura de contratos inteligentes funciona
- [ ] Responsive design en móviles

### 2. Posibles Problemas y Soluciones

#### Error de Conexión RPC
- **Problema**: No se pueden cargar los NFTs
- **Solución**: Verificar que las variables `NEXT_PUBLIC_*` estén configuradas

#### Error de MetaMask
- **Problema**: No se puede conectar la wallet
- **Solución**: Asegurar que el dominio de Vercel esté en HTTPS

#### Error de Build
- **Problema**: Falla la construcción
- **Solución**: Verificar que todas las dependencias estén en `package.json`

## Actualizaciones Automáticas

Vercel está configurado para:
- **Auto-deploy**: Cada push a `master` despliega automáticamente
- **Preview deployments**: Cada PR crea un preview
- **Rollback**: Fácil reversión a versiones anteriores

## URLs del Proyecto

Después del despliegue, tendrás:
- **URL Principal**: `https://tu-proyecto.vercel.app`
- **Galería**: `https://tu-proyecto.vercel.app/galeria`
- **Minteo**: `https://tu-proyecto.vercel.app/mint`

## Monitoreo

Vercel proporciona:
- **Analytics**: Métricas de uso y rendimiento
- **Logs**: Logs de función y errores
- **Speed Insights**: Análisis de velocidad de carga

## Soporte

Para problemas específicos:
1. Revisar los logs en el dashboard de Vercel
2. Verificar las variables de entorno
3. Comprobar la conectividad con la red Sepolia
4. Consultar la documentación de Vercel: [vercel.com/docs](https://vercel.com/docs)
# Solución para Error de Generación de NFT

## 🚨 Problema Identificado

El error `execution reverted (unknown custom error)` ocurre porque:

1. **Restricción de Propietario**: La función `mintPrenda` en el contrato `PrendaNFT.sol` tiene el modificador `onlyOwner`
2. **Usuario No Autorizado**: La dirección `0x30295322d3a42Fe9c5467B406C98D2A7361c6156` no es el propietario del contrato
3. **Contrato Inmutable**: Los contratos desplegados no pueden modificarse

## 🔧 Soluciones Disponibles

### Opción 1: Desplegar Nuevo Contrato (RECOMENDADO)

#### Pasos:
1. **Compilar el contrato actualizado** (ya se removió `onlyOwner`)
2. **Desplegar nueva versión** usando el script `deploy-contract.js`
3. **Actualizar direcciones** en la aplicación

#### Ventajas:
- ✅ Permite que cualquier usuario mintee NFTs
- ✅ Mantiene toda la funcionalidad
- ✅ Solución permanente

#### Desventajas:
- ❌ Requiere nueva dirección de contrato
- ❌ NFTs existentes quedan en el contrato anterior

### Opción 2: Usar Cuenta del Propietario

#### Pasos:
1. **Identificar propietario** del contrato actual
2. **Usar esa cuenta** para mintear NFTs
3. **Implementar sistema de autorización** en backend

#### Ventajas:
- ✅ No requiere nuevo deployment
- ✅ Mantiene NFTs existentes

#### Desventajas:
- ❌ Solo una cuenta puede mintear
- ❌ Requiere gestión centralizada

## 🚀 Implementación Recomendada

### 1. Preparar Deployment

```bash
# Instalar dependencias si no están
npm install ethers

# Configurar variables en deploy-contract.js:
# - SEPOLIA_RPC_URL (Infura/Alchemy)
# - PRIVATE_KEY (cuenta con ETH en Sepolia)
```

### 2. Compilar Contrato

Necesitas compilar `contracts/PrendaNFT.sol` para obtener el bytecode. Opciones:

#### Usando Remix IDE:
1. Ir a [remix.ethereum.org](https://remix.ethereum.org)
2. Subir `PrendaNFT.sol`
3. Compilar (Ctrl+S)
4. Copiar bytecode desde la pestaña "Compilation Details"

#### Usando Hardhat (si está configurado):
```bash
npx hardhat compile
```

### 3. Ejecutar Deployment

```bash
node deploy-contract.js
```

### 4. Actualizar Aplicación

Reemplazar `CONTRACT_ADDRESS` en todos los archivos:
- `app/admin/generar-nft/page.tsx`
- `components/MintNFT.tsx`
- `components/MyNFTs.tsx`
- `components/PublicNFTView.tsx`
- `components/PublicNFTGallery.tsx`
- `components/NFTTraceability.tsx`

## 📋 Checklist de Implementación

- [ ] Compilar contrato actualizado
- [ ] Configurar variables en `deploy-contract.js`
- [ ] Verificar balance de ETH en cuenta de deployment
- [ ] Ejecutar deployment
- [ ] Actualizar `CONTRACT_ADDRESS` en aplicación
- [ ] Probar generación de NFT
- [ ] Verificar en Etherscan

## 🔍 Verificación

Después del deployment:

1. **Verificar contrato** en Sepolia Etherscan
2. **Probar minteo** desde la aplicación
3. **Confirmar transacción** exitosa
4. **Verificar NFT** en galería

## 📞 Soporte

Si encuentras problemas:

1. **Revisar logs** del deployment
2. **Verificar balance** de ETH
3. **Confirmar red** (Sepolia)
4. **Validar bytecode** del contrato

## 🎯 Resultado Esperado

Después de implementar la solución:
- ✅ Cualquier usuario puede generar NFTs
- ✅ No más errores de `execution reverted`
- ✅ Funcionalidad completa restaurada
- ✅ Sistema descentralizado funcional
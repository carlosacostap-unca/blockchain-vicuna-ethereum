# 🚀 Guía de Deployment con Remix IDE

## 📋 Pasos para Desplegar PrendaNFT.sol

### 1. Preparar Remix IDE

1. **Abrir Remix**: Ve a [remix.ethereum.org](https://remix.ethereum.org)
2. **Crear nuevo archivo**: 
   - Clic en el ícono "+" en el explorador de archivos
   - Nombrar: `PrendaNFT.sol`

### 2. Copiar el Contrato

Copia y pega el siguiente código en Remix:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PrendaNFT
 * @dev Contrato NFT sencillo para prendas artesanales
 */
contract PrendaNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    // Estructura simple para la información de la prenda
    struct PrendaInfo {
        string nombreProducto;    // Nombre del producto
        string nombreArtesano;    // Nombre del artesano
        string numeroCTPSFS;      // Número de CTPSFS
        uint256 pesoFibra;        // Peso de la fibra en gramos
    }
    
    // Mapeo de tokenId a información de la prenda
    mapping(uint256 => PrendaInfo) public prendas;
    
    // Evento cuando se mintea una prenda NFT
    event PrendaMinted(
        uint256 indexed tokenId, 
        address indexed to, 
        string nombreProducto, 
        string nombreArtesano
    );
    
    constructor() ERC721("Prenda Artesanal NFT", "PRENDA") Ownable(msg.sender) {}
    
    /**
     * @dev Mintea un NFT de prenda con información básica
     * @param to Dirección que recibirá el NFT
     * @param nombreProducto Nombre del producto
     * @param nombreArtesano Nombre del artesano
     * @param numeroCTPSFS Número de CTPSFS
     * @param pesoFibra Peso de la fibra en gramos
     */
    function mintPrenda(
        address to,
        string memory nombreProducto,
        string memory nombreArtesano,
        string memory numeroCTPSFS,
        uint256 pesoFibra
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Guardar la información de la prenda
        prendas[tokenId] = PrendaInfo({
            nombreProducto: nombreProducto,
            nombreArtesano: nombreArtesano,
            numeroCTPSFS: numeroCTPSFS,
            pesoFibra: pesoFibra
        });
        
        // Mintear el NFT
        _safeMint(to, tokenId);
        
        emit PrendaMinted(tokenId, to, nombreProducto, nombreArtesano);
        
        return tokenId;
    }
    
    /**
     * @dev Obtiene la información completa de una prenda
     * @param tokenId ID del token
     */
    function getPrendaInfo(uint256 tokenId) public view returns (PrendaInfo memory) {
        require(_ownerOf(tokenId) != address(0), "NFT no existe");
        return prendas[tokenId];
    }
    
    /**
     * @dev Obtiene el total de NFTs creados
     */
    function getTotalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
```

### 3. Compilar el Contrato

1. **Ir a la pestaña "Solidity Compiler"** (ícono de Solidity)
2. **Configurar versión**: Seleccionar `0.8.20` o superior
3. **Compilar**: Hacer clic en "Compile PrendaNFT.sol"
4. **Verificar**: Debe aparecer un checkmark verde ✅

### 4. Configurar MetaMask

1. **Conectar MetaMask**: Asegúrate de tener MetaMask instalado
2. **Red Sepolia**: Cambiar a la red Sepolia testnet
3. **Verificar ETH**: Necesitas al menos 0.01 ETH en Sepolia
   - Si no tienes, usa un faucet: [sepoliafaucet.com](https://sepoliafaucet.com)

### 5. Desplegar el Contrato

1. **Ir a "Deploy & Run Transactions"** (ícono de Ethereum)
2. **Environment**: Seleccionar "Injected Provider - MetaMask"
3. **Account**: Verificar que sea tu cuenta de MetaMask
4. **Contract**: Seleccionar "PrendaNFT"
5. **Deploy**: Hacer clic en "Deploy"
6. **Confirmar en MetaMask**: Aprobar la transacción

### 6. Verificar Deployment

Después del deployment exitoso:

1. **Copiar dirección**: Aparecerá en "Deployed Contracts"
2. **Verificar en Etherscan**: 
   - Ir a [sepolia.etherscan.io](https://sepolia.etherscan.io)
   - Buscar la dirección del contrato
3. **Probar funciones**: Expandir el contrato en Remix y probar funciones

## 📝 Información Importante

### ✅ Cambios Realizados
- ❌ **Removido**: `onlyOwner` de la función `mintPrenda`
- ✅ **Ahora**: Cualquier usuario puede mintear NFTs
- ✅ **Mantiene**: Toda la funcionalidad original

### 🔧 Después del Deployment

Una vez desplegado, necesitarás:

1. **Nueva dirección del contrato** (la que aparece en Remix)
2. **Actualizar la aplicación** con la nueva dirección
3. **Probar la generación de NFT**

### 🚨 Notas de Seguridad

- El contrato actual permite que cualquier usuario mintee NFTs
- Esto es intencional para resolver el error de acceso
- Si necesitas restricciones, se pueden agregar después

## 🎯 Resultado Esperado

Después del deployment:
- ✅ Contrato desplegado en Sepolia
- ✅ Dirección del contrato disponible
- ✅ Listo para mintear NFTs sin restricciones
- ✅ Error de `execution reverted` resuelto

## 📞 Siguiente Paso

Una vez que tengas la **nueva dirección del contrato**, avísame para actualizar la aplicación con la nueva dirección.
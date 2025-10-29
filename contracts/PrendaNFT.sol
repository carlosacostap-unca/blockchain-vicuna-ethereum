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
    ) public onlyOwner returns (uint256) {
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
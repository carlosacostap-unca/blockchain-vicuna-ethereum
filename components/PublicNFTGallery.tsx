'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Dirección del contrato desplegado
const CONTRACT_ADDRESS = "0x41B041ab8691022d70f491a71fC62059f1BdbaFB";

// ABI del contrato PrendaNFT (funciones necesarias para la galería)
const PRENDA_NFT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getPrendaInfo",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "nombreProducto", "type": "string"},
          {"internalType": "string", "name": "nombreArtesano", "type": "string"},
          {"internalType": "string", "name": "numeroCTPSFS", "type": "string"},
          {"internalType": "uint256", "name": "pesoFibra", "type": "uint256"}
        ],
        "internalType": "struct PrendaNFT.PrendaInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

interface NFTGalleryItem {
  tokenId: string;
  nombreProducto: string;
  nombreArtesano: string;
  numeroCTPSFS: string;
  pesoFibra: string;
  owner: string;
}

export default function PublicNFTGallery() {
  const [nfts, setNfts] = useState<NFTGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [loadingStatus, setLoadingStatus] = useState<string>('Iniciando conexión...');

  useEffect(() => {
    loadAllNFTs();
  }, []);

  const loadAllNFTs = async () => {
    try {
      setIsLoading(true);
      setError('');
      setLoadingStatus('Conectando a la red blockchain...');

      // Usar múltiples proveedores públicos como fallback
      let provider;
      const providers = [
        'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        'https://rpc.sepolia.org',
        'https://sepolia.gateway.tenderly.co',
        'https://ethereum-sepolia.blockpi.network/v1/rpc/public'
      ];

      let lastError;
      let providerIndex = 0;
      
      for (const providerUrl of providers) {
        try {
          providerIndex++;
          setLoadingStatus(`Probando proveedor ${providerIndex}/${providers.length}...`);
          console.log(`Intentando conectar con proveedor ${providerIndex}/${providers.length}: ${providerUrl}`);
          
          provider = new ethers.JsonRpcProvider(providerUrl, undefined, {
            staticNetwork: true,
            batchMaxCount: 1
          });
          
          // Probar la conexión con timeout de 10 segundos
          const networkPromise = provider.getNetwork();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout de conexión')), 10000)
          );
          
          await Promise.race([networkPromise, timeoutPromise]);
          console.log(`✅ Conectado exitosamente con: ${providerUrl}`);
          setLoadingStatus('Conexión establecida, obteniendo NFTs...');
          break;
        } catch (err: any) {
          console.warn(`❌ Proveedor ${providerUrl} falló:`, err.message);
          lastError = err;
          provider = null;
          
          if (providerIndex < providers.length) {
            console.log(`Intentando siguiente proveedor...`);
            setLoadingStatus(`Proveedor ${providerIndex} falló, probando siguiente...`);
          }
        }
      }

      if (!provider) {
        throw new Error(`No se pudo conectar a ningún proveedor de red después de ${providers.length} intentos. Último error: ${lastError?.message}`);
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, PRENDA_NFT_ABI, provider);

      setLoadingStatus('Obteniendo total de NFTs creados...');
      // Obtener el total de NFTs creados
      const totalSupply = await contract.getTotalSupply();
      const totalNFTs = parseInt(totalSupply.toString());

      if (totalNFTs === 0) {
        setNfts([]);
        setIsLoading(false);
        return;
      }

      setLoadingStatus(`Cargando información de ${totalNFTs} NFTs...`);
      const nftList: NFTGalleryItem[] = [];

      // Cargar información de cada NFT
      for (let tokenId = 0; tokenId < totalNFTs; tokenId++) {
        try {
          setLoadingStatus(`Cargando NFT ${tokenId + 1}/${totalNFTs}...`);
          
          const [prendaInfo, owner] = await Promise.all([
            contract.getPrendaInfo(tokenId),
            contract.ownerOf(tokenId)
          ]);

          nftList.push({
            tokenId: tokenId.toString(),
            nombreProducto: prendaInfo.nombreProducto,
            nombreArtesano: prendaInfo.nombreArtesano,
            numeroCTPSFS: prendaInfo.numeroCTPSFS,
            pesoFibra: prendaInfo.pesoFibra.toString(),
            owner: owner
          });
        } catch (err: any) {
          console.warn(`Error cargando NFT ${tokenId}:`, err.message);
          // Continuar con el siguiente NFT si hay error
        }
      }

      setNfts(nftList);
      setLoadingStatus('¡Galería cargada exitosamente!');
    } catch (err: any) {
      console.error('Error cargando galería de NFTs:', err);
      setError('Error al cargar la galería de NFTs. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleNFTClick = (tokenId: string) => {
    window.open(`/nft/${tokenId}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center text-gray-600 mt-4 font-medium">{loadingStatus}</p>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-2">
            Esto puede tomar unos momentos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-red-500 text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Error al cargar la galería</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => loadAllNFTs()}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay NFTs creados</h3>
          <p className="text-gray-600">
            Aún no se han creado NFTs de prendas artesanales. ¡Sé el primero en crear uno!
          </p>
          <a
            href="/mint"
            className="inline-block mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear NFT
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Estadísticas */}
      <div className="mb-8 text-center">
        <div className="bg-white rounded-lg shadow-md p-6 inline-block">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} Creado{nfts.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-gray-600">
            Prendas artesanales verificadas en blockchain
          </p>
        </div>
      </div>

      {/* Grid de NFTs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {nfts.map((nft) => (
          <div
            key={nft.tokenId}
            onClick={() => handleNFTClick(nft.tokenId)}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105"
          >
            {/* Header del NFT */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Token #{nft.tokenId}</h3>
                <div className="bg-white/20 rounded-full px-2 py-1">
                  <span className="text-xs font-medium">NFT</span>
                </div>
              </div>
            </div>

            {/* Contenido del NFT */}
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Producto
                  </label>
                  <p className="text-sm font-semibold text-gray-800 truncate" title={nft.nombreProducto}>
                    {nft.nombreProducto}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Artesano
                  </label>
                  <p className="text-sm font-semibold text-gray-800 truncate" title={nft.nombreArtesano}>
                    {nft.nombreArtesano}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    CTPSFS
                  </label>
                  <p className="text-sm font-mono text-gray-700">
                    {nft.numeroCTPSFS}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Peso Fibra
                  </label>
                  <p className="text-sm font-semibold text-gray-800">
                    {nft.pesoFibra}g
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Propietario
                  </label>
                  <p className="text-xs font-mono text-gray-600">
                    {formatAddress(nft.owner)}
                  </p>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium">Ver Detalles</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-12 text-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            ¿Qué son estos NFTs?
          </h3>
          <p className="text-gray-600 text-sm">
            Cada NFT representa una prenda artesanal única de Catamarca, certificada en blockchain 
            con información verificable sobre su origen, artesano y proceso de creación. 
            Haz clic en cualquier NFT para ver su información completa y trazabilidad.
          </p>
        </div>
      </div>
    </div>
  );
}
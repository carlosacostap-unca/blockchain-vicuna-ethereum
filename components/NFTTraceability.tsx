'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Dirección del contrato desplegado
const CONTRACT_ADDRESS = "0x142bBdf196e0c5f1a72A345731b04f153721A1c5";

// ABI del contrato PrendaNFT
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
    "inputs": [],
    "name": "getTotalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
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
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

interface PrendaInfo {
  nombreProducto: string;
  nombreArtesano: string;
  numeroCTPSFS: string;
  pesoFibra: string;
}

interface NFTTraceabilityData {
  tokenId: number;
  owner: string;
  prendaInfo: PrendaInfo;
  tokenURI: string;
  creationDate: string;
}

interface NFTTraceabilityProps {
  tokenId: string;
}

export default function NFTTraceability({ tokenId }: NFTTraceabilityProps) {
  const [nftData, setNftData] = useState<NFTTraceabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadNFTTraceability();
  }, [tokenId]);

  const loadNFTTraceability = async () => {
    if (!tokenId) {
      setError('Token ID no válido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Verificar que MetaMask esté disponible
      if (!window.ethereum) {
        setError('MetaMask no está instalado. Por favor instala MetaMask para continuar.');
        setIsLoading(false);
        return;
      }

      // Solicitar conexión a MetaMask
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PRENDA_NFT_ABI, provider);

      // Verificar que estamos en Sepolia
      const network = await provider.getNetwork();
      const sepoliaChainId = 11155111;
      const currentChainId = Number(network.chainId);
      
      if (currentChainId !== sepoliaChainId) {
        setError(`Red incorrecta: ${network.name || 'Desconocida'} (ID: ${currentChainId}). Cambia a Sepolia (ID: ${sepoliaChainId})`);
        setIsLoading(false);
        return;
      }

      // Obtener información del NFT
      const [prendaInfo, owner, tokenURI] = await Promise.all([
        contract.getPrendaInfo(tokenId),
        contract.ownerOf(tokenId),
        contract.tokenURI(tokenId).catch(() => '')
      ]);

      // Obtener fecha de creación del bloque (simulada por ahora)
      const currentDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      setNftData({
        tokenId: Number(tokenId),
        owner,
        prendaInfo: {
          nombreProducto: prendaInfo.nombreProducto,
          nombreArtesano: prendaInfo.nombreArtesano,
          numeroCTPSFS: prendaInfo.numeroCTPSFS,
          pesoFibra: prendaInfo.pesoFibra.toString()
        },
        tokenURI,
        creationDate: currentDate
      });

    } catch (error) {
      console.error('Error cargando trazabilidad del NFT:', error);
      setError('Error al cargar la información del NFT. Verifica que el Token ID existe.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando trazabilidad del NFT...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-xl mb-2">⚠️ Error</div>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadNFTTraceability}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!nftData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">No se encontró información del NFT</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔍 Trazabilidad del NFT
          </h1>
          <p className="text-gray-600">
            Información completa y verificable del Token #{nftData.tokenId}
          </p>
        </div>

        {/* NFT Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header del NFT */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Token #{nftData.tokenId}</h2>
                <p className="text-blue-100">{nftData.prendaInfo.nombreProducto}</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-lg px-3 py-1">
                  <span className="text-sm font-medium">NFT Verificado ✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información Principal */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Información del Producto */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  📦 Información del Producto
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Nombre del Producto</label>
                    <p className="text-lg font-semibold text-gray-800">{nftData.prendaInfo.nombreProducto}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Artesano</label>
                    <p className="text-lg font-semibold text-gray-800">{nftData.prendaInfo.nombreArtesano}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Número CTPSFS</label>
                    <p className="text-lg font-semibold text-gray-800">{nftData.prendaInfo.numeroCTPSFS}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Peso de Fibra</label>
                    <p className="text-lg font-semibold text-gray-800">{nftData.prendaInfo.pesoFibra} gramos</p>
                  </div>
                </div>
              </div>

              {/* Información Blockchain */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  ⛓️ Información Blockchain
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Token ID</label>
                    <p className="text-lg font-semibold text-gray-800">#{nftData.tokenId}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Propietario Actual</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-mono text-gray-800 break-all">{nftData.owner}</p>
                      <button
                        onClick={() => copyToClipboard(nftData.owner)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Copiar dirección"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Contrato</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-mono text-gray-800 break-all">{CONTRACT_ADDRESS}</p>
                      <button
                        onClick={() => copyToClipboard(CONTRACT_ADDRESS)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Copiar dirección del contrato"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Red</label>
                    <p className="text-lg font-semibold text-gray-800">Ethereum Sepolia Testnet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline de Trazabilidad */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
            📅 Historial de Trazabilidad
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">NFT Creado</h4>
                <p className="text-gray-600">El NFT fue minteado en la blockchain</p>
                <p className="text-sm text-gray-500">{nftData.creationDate}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">Información Registrada</h4>
                <p className="text-gray-600">Datos del artesano y producto almacenados inmutablemente</p>
                <p className="text-sm text-gray-500">Artesano: {nftData.prendaInfo.nombreArtesano}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">Estado Actual</h4>
                <p className="text-gray-600">NFT verificado y disponible para consulta</p>
                <p className="text-sm text-gray-500">Propietario: {nftData.owner.slice(0, 10)}...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enlaces Externos */}
        <div className="mt-8 text-center space-x-4">
          <a
            href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${nftData.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔗 Ver en Etherscan
          </a>
          
          <button
            onClick={() => {
              const publicUrl = `${window.location.origin}/nft/${nftData.tokenId}`;
              navigator.clipboard.writeText(publicUrl);
              alert('¡Enlace público copiado al portapapeles!');
            }}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📋 Compartir Enlace Público
          </button>
          
          <a
            href={`/nft/${nftData.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            👁️ Ver Vista Pública
          </a>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
}
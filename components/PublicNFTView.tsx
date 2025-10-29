'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Dirección del contrato desplegado
const CONTRACT_ADDRESS = "0x41B041ab8691022d70f491a71fC62059f1BdbaFB";

// ABI del contrato PrendaNFT (solo funciones de lectura)
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
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

interface PublicNFTData {
  tokenId: string;
  nombreProducto: string;
  nombreArtesano: string;
  numeroCTPSFS: string;
  pesoFibra: string;
  owner: string;
  contractAddress: string;
  network: string;
  etherscanUrl: string;
}

interface PublicNFTViewProps {
  tokenId: string;
}

export default function PublicNFTView({ tokenId }: PublicNFTViewProps) {
  const [nftData, setNftData] = useState<PublicNFTData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string>('');
  const [loadingStatus, setLoadingStatus] = useState<string>('Iniciando conexión...');

  useEffect(() => {
    loadPublicNFTData();
  }, [tokenId]);

  const loadPublicNFTData = async () => {
    if (!tokenId) {
      setError('Token ID no válido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setLoadingStatus('Conectando a la red blockchain...');

      // Usar proveedor público de Sepolia (sin necesidad de MetaMask)
      // Intentar múltiples proveedores públicos como fallback con timeout
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
          
          // Crear proveedor con timeout personalizado
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
          setLoadingStatus('Conexión establecida, obteniendo datos del NFT...');
          break;
        } catch (err: any) {
          console.warn(`❌ Proveedor ${providerUrl} falló:`, err.message);
          lastError = err;
          provider = null;
          
          // Si no es el último proveedor, continuar intentando
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

      setLoadingStatus('Verificando existencia del NFT...');
      // Verificar que el NFT existe intentando obtener su información
      const [prendaInfo, owner] = await Promise.all([
        contract.getPrendaInfo(tokenId),
        contract.ownerOf(tokenId)
      ]);

      setLoadingStatus('Procesando información del NFT...');
      // Obtener información de la red
      const network = await provider.getNetwork();
      const networkName = network.name === 'sepolia' ? 'Sepolia Testnet' : network.name;

      const nftInfo: PublicNFTData = {
        tokenId: tokenId,
        nombreProducto: prendaInfo[0] || 'No disponible',
        nombreArtesano: prendaInfo[1] || 'No disponible',
        numeroCTPSFS: prendaInfo[2] || 'No disponible',
        pesoFibra: prendaInfo[3] ? `${prendaInfo[3].toString()} gramos` : 'No disponible',
        owner: owner,
        contractAddress: CONTRACT_ADDRESS,
        network: networkName,
        etherscanUrl: `https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${tokenId}`
      };

      setNftData(nftInfo);
    } catch (err: any) {
      console.error('Error cargando información pública del NFT:', err);
      if (err.message.includes('ERC721: invalid token ID') || err.message.includes('nonexistent token')) {
        setError(`El NFT con Token ID ${tokenId} no existe.`);
      } else {
        setError('Error al cargar la información del NFT. Verifica que el Token ID sea correcto.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-red-500 text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!nftData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Información Pública del NFT
          </h1>
          <p className="text-gray-600">
            Consulta pública de información verificada en blockchain
          </p>
        </div>

        {/* NFT Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Token ID Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Token ID: {nftData.tokenId}</h2>
                <p className="text-blue-100">NFT de Prenda Artesanal</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Red:</p>
                <p className="font-semibold">{nftData.network}</p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Información del Producto
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nombre del Producto
                  </label>
                  <p className="text-lg font-semibold text-gray-800 bg-gray-50 p-3 rounded-lg">
                    {nftData.nombreProducto}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Artesano
                  </label>
                  <p className="text-lg font-semibold text-gray-800 bg-gray-50 p-3 rounded-lg">
                    {nftData.nombreArtesano}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Número CTPSFS
                  </label>
                  <p className="text-lg font-semibold text-gray-800 bg-gray-50 p-3 rounded-lg">
                    {nftData.numeroCTPSFS}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Peso de Fibra
                  </label>
                  <p className="text-lg font-semibold text-gray-800 bg-gray-50 p-3 rounded-lg">
                    {nftData.pesoFibra}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Information */}
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Información Blockchain
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Propietario Actual
                </label>
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <code className="text-sm font-mono text-gray-800 flex-1">
                    {formatAddress(nftData.owner)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(nftData.owner, 'owner')}
                    className="ml-2 p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Copiar dirección completa"
                  >
                    {copiedField === 'owner' ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Contrato
                </label>
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <code className="text-sm font-mono text-gray-800 flex-1">
                    {formatAddress(nftData.contractAddress)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(nftData.contractAddress, 'contract')}
                    className="ml-2 p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Copiar dirección completa"
                  >
                    {copiedField === 'contract' ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={nftData.etherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ver en Etherscan
              </a>
              
              <button
                onClick={() => copyToClipboard(window.location.href, 'url')}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
              >
                {copiedField === 'url' ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Compartir Enlace
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Esta información es verificada y almacenada en la blockchain de Ethereum (Sepolia).
            <br />
            Los datos mostrados son inmutables y verificables públicamente.
          </p>
        </div>
      </div>
    </div>
  );
}
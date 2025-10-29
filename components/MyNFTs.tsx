'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// ABI del contrato PrendaNFT (funciones necesarias para consultar y transferir NFTs)
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
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Funciones de transferencia heredadas de ERC721
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getApproved",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Dirección del contrato desplegado (deberás actualizarla con la dirección real)
const CONTRACT_ADDRESS = "0x41B041ab8691022d70f491a71fC62059f1BdbaFB";

interface PrendaInfo {
  nombreProducto: string;
  nombreArtesano: string;
  numeroCTPSFS: string;
  pesoFibra: string;
}

interface NFTData {
  tokenId: number;
  prendaInfo: PrendaInfo;
}

export default function MyNFTs() {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [transferring, setTransferring] = useState<string>(''); // tokenId being transferred
  const [transferAddress, setTransferAddress] = useState<string>('');
  const [showTransferModal, setShowTransferModal] = useState<string>(''); // tokenId for modal

  // Conectar MetaMask
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        setAccount(accounts[0]);
        setIsConnected(true);
        setError('');
        
        // Cargar NFTs automáticamente después de conectar
        await loadMyNFTs(accounts[0]);
      } else {
        setError('MetaMask no está instalado. Por favor, instala MetaMask.');
      }
    } catch (error) {
      console.error('Error conectando wallet:', error);
      setError('Error al conectar con MetaMask');
    }
  };

  // Cargar NFTs del usuario
  const loadMyNFTs = async (walletAddress?: string) => {
    const addressToUse = walletAddress || account;
    
    if (!addressToUse) {
      setError('Por favor, conecta tu wallet primero');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!window.ethereum) {
        setError('MetaMask no está instalado');
        return;
      }
      
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

      // Obtener el total de NFTs creados
      const totalSupply = await contract.getTotalSupply();
      const totalSupplyNumber = Number(totalSupply);
      
      console.log(`Total de NFTs creados: ${totalSupplyNumber}`);

      const userNFTs: NFTData[] = [];

      // Revisar cada NFT para ver si pertenece al usuario
      for (let tokenId = 0; tokenId < totalSupplyNumber; tokenId++) {
        try {
          const owner = await contract.ownerOf(tokenId);
          
          if (owner.toLowerCase() === addressToUse.toLowerCase()) {
            // Este NFT pertenece al usuario, obtener su información
            const prendaInfo = await contract.getPrendaInfo(tokenId);
            
            userNFTs.push({
              tokenId,
              prendaInfo: {
                nombreProducto: prendaInfo.nombreProducto,
                nombreArtesano: prendaInfo.nombreArtesano,
                numeroCTPSFS: prendaInfo.numeroCTPSFS,
                pesoFibra: prendaInfo.pesoFibra.toString()
              }
            });
          }
        } catch (error) {
          // El NFT podría no existir o haber sido quemado, continuar
          console.log(`NFT ${tokenId} no existe o error al consultar:`, error);
        }
      }

      setNfts(userNFTs);
      
      if (userNFTs.length === 0) {
        setError('No tienes NFTs de prendas artesanales en esta billetera.');
      }

    } catch (error: any) {
      console.error('Error cargando NFTs:', error);
      setError(`Error: ${error.message || 'Error desconocido al cargar NFTs'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para transferir NFT
  const transferNFT = async (tokenId: number, toAddress: string) => {
    if (!window.ethereum || !account) {
      setError('MetaMask no está conectado');
      return;
    }

    if (!toAddress || !toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Dirección de destino inválida');
      return;
    }

    if (toAddress.toLowerCase() === account.toLowerCase()) {
      setError('No puedes transferir a tu propia dirección');
      return;
    }

    try {
      setTransferring(tokenId.toString());
      setError('');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PRENDA_NFT_ABI, signer);

      // Verificar que el usuario es el propietario
      const owner = await contract.ownerOf(tokenId);
      if (owner.toLowerCase() !== account.toLowerCase()) {
        throw new Error('No eres el propietario de este NFT');
      }

      // Realizar la transferencia usando safeTransferFrom
      const tx = await contract.safeTransferFrom(account, toAddress, tokenId);
      
      console.log('Transacción de transferencia enviada:', tx.hash);
      
      // Esperar confirmación
      await tx.wait();
      
      console.log('Transferencia confirmada');
      
      // Recargar NFTs para actualizar la lista
      await loadMyNFTs();
      
      // Cerrar modal y limpiar estados
      setShowTransferModal('');
      setTransferAddress('');
      
    } catch (error: any) {
      console.error('Error transfiriendo NFT:', error);
      setError(`Error en transferencia: ${error.message || 'Error desconocido'}`);
    } finally {
      setTransferring('');
    }
  };

  // Verificar conexión al cargar el componente
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            await loadMyNFTs(accounts[0]);
          }
        } catch (error) {
          console.error('Error verificando conexión:', error);
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        🧶 Mis NFTs de Prendas Artesanales
      </h1>

      {/* Conexión de Wallet */}
      <div className="mb-8">
        {!isConnected ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              🦊 Conectar MetaMask para ver mis NFTs
            </button>
          </div>
        ) : (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">
            ✅ Conectado: {account.slice(0, 6)}...{account.slice(-4)}
            <button
              onClick={() => loadMyNFTs()}
              className="ml-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              🔄 Actualizar NFTs
            </button>
          </div>
        )}
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando tus NFTs...</p>
        </div>
      )}

      {/* Mensajes de error */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Lista de NFTs */}
      {!isLoading && nfts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              {/* Header de la tarjeta */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
                <h3 className="text-xl font-bold">NFT #{nft.tokenId}</h3>
                <p className="text-purple-100">Prenda Artesanal Auténtica</p>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    🧶 Producto:
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                    {nft.prendaInfo.nombreProducto}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    👨‍🎨 Artesano:
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                    {nft.prendaInfo.nombreArtesano}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    📋 CTPSFS:
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded border font-mono text-sm">
                    {nft.prendaInfo.numeroCTPSFS}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    ⚖️ Peso de Fibra:
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                    {nft.prendaInfo.pesoFibra} gramos
                  </p>
                </div>

                {/* Enlaces útiles */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex gap-2">
                    <a
                      href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${nft.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-medium py-2 px-3 rounded transition duration-200"
                    >
                      🔍 Ver en Etherscan
                    </a>
                    <a
                      href={`/trazabilidad/${nft.tokenId}`}
                      className="flex-1 text-center bg-green-100 hover:bg-green-200 text-green-800 text-sm font-medium py-2 px-3 rounded transition duration-200"
                    >
                      🔍 Ver Trazabilidad
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowTransferModal(nft.tokenId.toString())}
                      disabled={transferring === nft.tokenId.toString()}
                      className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm font-medium py-2 px-3 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {transferring === nft.tokenId.toString() ? '⏳ Transfiriendo...' : '📤 Transferir'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Transferencia */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              📤 Transferir NFT #{showTransferModal}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Dirección de destino:
              </label>
              <input
                type="text"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa la dirección Ethereum del destinatario
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Advertencia:</strong> Esta acción no se puede deshacer. 
                Verifica cuidadosamente la dirección de destino antes de continuar.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTransferModal('');
                  setTransferAddress('');
                  setError('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => transferNFT(parseInt(showTransferModal), transferAddress)}
                disabled={!transferAddress || transferring === showTransferModal}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {transferring === showTransferModal ? '⏳ Transfiriendo...' : '📤 Transferir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay NFTs */}
      {!isLoading && nfts.length === 0 && isConnected && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧶</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No tienes NFTs de prendas artesanales
          </h3>
          <p className="text-gray-500 mb-6">
            ¡Mintea tu primer NFT de prenda artesanal para comenzar tu colección!
          </p>
          <a
            href="/mint"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            🚀 Mintear mi primer NFT
          </a>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-3">ℹ️ Información:</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-2">
          <li>Cada NFT representa una prenda artesanal auténtica con trazabilidad completa</li>
          <li>Los datos incluyen información del producto, artesano, certificación CTPSFS y peso de fibra</li>
          <li>Puedes verificar la autenticidad de cada NFT en Etherscan</li>
          <li>Los NFTs están almacenados de forma permanente en la blockchain de Ethereum</li>
        </ul>
      </div>
    </div>
  );
}
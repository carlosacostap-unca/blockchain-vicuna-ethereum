'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

// ABI del contrato PrendaNFT (solo las funciones que necesitamos)
const PRENDA_NFT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "nombreProducto", "type": "string"},
      {"internalType": "string", "name": "nombreArtesano", "type": "string"},
      {"internalType": "string", "name": "numeroCTPSFS", "type": "string"},
      {"internalType": "uint256", "name": "pesoFibra", "type": "uint256"}
    ],
    "name": "mintPrenda",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
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

// Dirección del contrato desplegado (deberás actualizarla con la dirección real)
const CONTRACT_ADDRESS = "0x142bBdf196e0c5f1a72A345731b04f153721A1c5";

interface FormData {
  nombreProducto: string;
  nombreArtesano: string;
  numeroCTPSFS: string;
  pesoFibra: string;
  walletAddress: string;
}

export default function MintNFT() {
  const [formData, setFormData] = useState<FormData>({
    nombreProducto: '',
    nombreArtesano: '',
    numeroCTPSFS: '',
    pesoFibra: '',
    walletAddress: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Conectar MetaMask
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        setAccount(accounts[0]);
        setIsConnected(true);
        setFormData(prev => ({ ...prev, walletAddress: accounts[0] }));
        setError('');
      } else {
        setError('MetaMask no está instalado. Por favor, instala MetaMask.');
      }
    } catch (error) {
      console.error('Error conectando wallet:', error);
      setError('Error al conectar con MetaMask');
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mintear NFT
  const mintNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Por favor, conecta tu wallet primero');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      if (!window.ethereum) {
        setError('MetaMask no está instalado');
        return;
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PRENDA_NFT_ABI, signer);

      // Verificar que estamos en Sepolia
      const network = await provider.getNetwork();
      console.log('Red detectada:', network.chainId, network.name);
      
      // Sepolia puede tener chainId como número o BigInt
      const sepoliaChainId = 11155111;
      const currentChainId = Number(network.chainId);
      
      if (currentChainId !== sepoliaChainId) {
        setError(`Red incorrecta detectada: ${network.name || 'Desconocida'} (ID: ${currentChainId}). Por favor, cambia a Sepolia (ID: ${sepoliaChainId}) en MetaMask`);
        setIsLoading(false);
        return;
      }

      // Llamar a la función mintPrenda
      const tx = await contract.mintPrenda(
        formData.walletAddress,
        formData.nombreProducto,
        formData.nombreArtesano,
        formData.numeroCTPSFS,
        ethers.parseUnits(formData.pesoFibra, 0) // Convertir a uint256
      );

      setTxHash(tx.hash);
      
      // Esperar confirmación
      await tx.wait();
      
      // Limpiar formulario
      setFormData({
        nombreProducto: '',
        nombreArtesano: '',
        numeroCTPSFS: '',
        pesoFibra: '',
        walletAddress: account
      });

      alert('¡NFT minteado exitosamente!');
      
    } catch (error: any) {
      console.error('Error minteando NFT:', error);
      setError(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        🧶 Mintear NFT de Prenda Artesanal
      </h2>

      {/* Conexión de Wallet */}
      <div className="mb-6">
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            🦊 Conectar MetaMask
          </button>
        ) : (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ Conectado: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        )}
      </div>

      {/* Formulario */}
      <form onSubmit={mintNFT} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Nombre del Producto
          </label>
          <input
            type="text"
            name="nombreProducto"
            value={formData.nombreProducto}
            onChange={handleInputChange}
            required
            placeholder="Ej: Poncho Andino"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-base font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Nombre del Artesano
          </label>
          <input
            type="text"
            name="nombreArtesano"
            value={formData.nombreArtesano}
            onChange={handleInputChange}
            required
            placeholder="Ej: María Quispe"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-base font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Número CTPSFS
          </label>
          <input
            type="text"
            name="numeroCTPSFS"
            value={formData.numeroCTPSFS}
            onChange={handleInputChange}
            required
            placeholder="Ej: CTPSFS-001"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-base font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Peso de Fibra (gramos)
          </label>
          <input
            type="number"
            name="pesoFibra"
            value={formData.pesoFibra}
            onChange={handleInputChange}
            required
            min="1"
            placeholder="Ej: 500"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-base font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Dirección del Wallet
          </label>
          <input
            type="text"
            name="walletAddress"
            value={formData.walletAddress}
            onChange={handleInputChange}
            required
            placeholder="0x..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-base font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={!isConnected || isLoading}
          className={`w-full font-bold py-3 px-4 rounded-lg transition duration-200 ${
            !isConnected || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isLoading ? '⏳ Minteando...' : '🚀 Mintear NFT'}
        </button>
      </form>

      {/* Mensajes de estado */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ❌ {error}
        </div>
      )}

      {txHash && (
        <div className="mt-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          ✅ Transacción enviada: 
          <a 
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-1"
          >
            Ver en Etherscan
          </a>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">📋 Instrucciones:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
          <li>Asegúrate de tener MetaMask instalado y conectado a Sepolia</li>
          <li>Ten suficiente SepoliaETH para las tarifas de gas</li>
          <li>Actualiza la dirección del contrato en el código</li>
          <li>Completa todos los campos del formulario</li>
          <li>Haz clic en "Mintear NFT" y confirma la transacción</li>
        </ol>
      </div>
    </div>
  );
}
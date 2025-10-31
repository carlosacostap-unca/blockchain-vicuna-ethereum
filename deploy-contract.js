const { ethers } = require('ethers');
const fs = require('fs');

// Configuración de la red Sepolia
const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'; // Reemplazar con tu Project ID
const PRIVATE_KEY = 'YOUR_PRIVATE_KEY'; // Reemplazar con tu clave privada

// ABI del contrato (simplificado para deployment)
const contractABI = [
  "constructor()",
  "function mintPrenda(address to, string memory nombreProducto, string memory nombreArtesano, string memory numeroCTPSFS, uint256 pesoFibra) public returns (uint256)",
  "function getPrendaInfo(uint256 tokenId) public view returns (string memory, string memory, string memory, uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
];

// Bytecode del contrato (necesitarías compilar el contrato para obtener esto)
const contractBytecode = "0x608060405234801561001057600080fd5b50..."; // Bytecode completo aquí

async function deployContract() {
  try {
    console.log('🚀 Iniciando deployment del contrato PrendaNFT...');
    
    // Conectar al proveedor
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('📍 Dirección del deployer:', wallet.address);
    
    // Verificar balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.01')) {
      throw new Error('Balance insuficiente para el deployment. Necesitas al menos 0.01 ETH');
    }
    
    // Crear factory del contrato
    const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    
    // Desplegar el contrato
    console.log('📦 Desplegando contrato...');
    const contract = await contractFactory.deploy();
    
    // Esperar confirmación
    console.log('⏳ Esperando confirmación...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ Contrato desplegado exitosamente!');
    console.log('📍 Dirección del contrato:', contractAddress);
    console.log('🔗 Etherscan:', `https://sepolia.etherscan.io/address/${contractAddress}`);
    
    // Guardar la dirección en un archivo
    const deploymentInfo = {
      contractAddress: contractAddress,
      deploymentDate: new Date().toISOString(),
      network: 'sepolia',
      deployer: wallet.address
    };
    
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Información de deployment guardada en deployment-info.json');
    
    return contractAddress;
    
  } catch (error) {
    console.error('❌ Error durante el deployment:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  deployContract()
    .then((address) => {
      console.log('🎉 Deployment completado. Nueva dirección:', address);
      console.log('📝 Recuerda actualizar CONTRACT_ADDRESS en tu aplicación');
    })
    .catch((error) => {
      console.error('💥 Deployment falló:', error);
      process.exit(1);
    });
}

module.exports = { deployContract };
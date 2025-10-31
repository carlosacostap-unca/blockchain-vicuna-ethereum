import { ethers } from 'ethers';

// Configuración
const CONTRACT_ADDRESS = "0x142bBdf196e0c5f1a72A345731b04f153721A1c5";
const SEPOLIA_RPC_URL = 'https://rpc.sepolia.org'; // RPC público alternativo

// ABI mínimo para verificar el propietario
const contractABI = [
  "function owner() public view returns (address)"
];

async function checkContractOwner() {
  try {
    console.log('🔍 Verificando propietario del contrato...');
    console.log('📍 Dirección del contrato:', CONTRACT_ADDRESS);
    
    // Conectar al proveedor
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    
    // Crear instancia del contrato
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
    
    // Obtener el propietario
    const owner = await contract.owner();
    
    console.log('👑 Propietario actual:', owner);
    console.log('🔗 Etherscan:', `https://sepolia.etherscan.io/address/${owner}`);
    
    // Verificar si es la dirección que está intentando mintear
    const attemptingAddress = "0x30295322d3a42Fe9c5467b406C98D2A7361c6156";
    const isOwner = owner.toLowerCase() === attemptingAddress.toLowerCase();
    
    console.log('🎯 Dirección intentando mintear:', attemptingAddress);
    console.log('✅ ¿Es propietario?', isOwner ? 'SÍ' : 'NO');
    
    if (!isOwner) {
      console.log('');
      console.log('❌ PROBLEMA IDENTIFICADO:');
      console.log('   La dirección que intenta mintear NO es el propietario del contrato.');
      console.log('   Solo el propietario puede llamar a mintPrenda() debido al modificador onlyOwner.');
      console.log('');
      console.log('💡 SOLUCIONES:');
      console.log('   1. Usar la cuenta propietaria para mintear');
      console.log('   2. Desplegar nuevo contrato sin restricción onlyOwner');
      console.log('   3. Transferir propiedad del contrato (si tiene función transferOwnership)');
    } else {
      console.log('✅ La dirección es propietaria. El problema puede ser otro.');
    }
    
    return { owner, isOwner };
    
  } catch (error) {
    console.error('❌ Error verificando propietario:', error.message);
    
    if (error.message.includes('owner')) {
      console.log('💡 El contrato podría no tener función owner() pública');
      console.log('   Esto confirma que hay un problema de acceso');
    }
    
    throw error;
  }
}

// Ejecutar función principal
checkContractOwner()
  .then((result) => {
    console.log('🎉 Verificación completada');
  })
  .catch((error) => {
    console.error('💥 Verificación falló:', error.message);
  });

export { checkContractOwner };
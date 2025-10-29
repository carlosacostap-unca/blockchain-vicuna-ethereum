const { ethers } = require("hardhat");

async function main() {
  console.log("Desplegando contrato PrendaNFT...");

  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log("Desplegando con la cuenta:", deployer.address);
  console.log("Balance de la cuenta:", (await deployer.getBalance()).toString());

  // Desplegar el contrato
  const PrendaNFT = await ethers.getContractFactory("PrendaNFT");
  const prendaNFT = await PrendaNFT.deploy();

  await prendaNFT.deployed();

  console.log("PrendaNFT desplegado en:", prendaNFT.address);
  
  // Guardar la dirección del contrato para uso posterior
  const fs = require('fs');
  const contractAddress = {
    PrendaNFT: prendaNFT.address,
    network: "sepolia",
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    './contract-addresses.json',
    JSON.stringify(contractAddress, null, 2)
  );
  
  console.log("Dirección del contrato guardada en contract-addresses.json");

  // Verificar algunas funciones básicas
  console.log("Nombre del contrato:", await prendaNFT.name());
  console.log("Símbolo del contrato:", await prendaNFT.symbol());
  console.log("Total supply inicial:", await prendaNFT.getTotalSupply());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
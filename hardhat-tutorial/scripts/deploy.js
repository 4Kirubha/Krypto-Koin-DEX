const {ethers} = require("hardhat");
const {KRYPTO_KOIN_TOKEN_ADDRESS} = require ("../constants/index");

const kryptoKoinTokenAddress = KRYPTO_KOIN_TOKEN_ADDRESS;

async function main(){
  const exchangeContract = await ethers.getContractFactory("Exchange");
  const deployedExchangeContract = await exchangeContract.deploy(kryptoKoinTokenAddress);
  await deployedExchangeContract.deployed();
  console.log("EXCHANGE CONTRACT ADDRESS",deployedExchangeContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, upgrades } = require('hardhat');

async function main() {

  const  maxBatchSize_ = 3
  const  collectionSize_ = 10000
  const amountForAuction_ = 100
  const  name_ = 'IPSNFT'
  const symbol_ = 'IPS'
  const Lock = await ethers.getContractFactory("IPS");
  const lock = await Lock.deploy(maxBatchSize_, collectionSize_, amountForAuction_, name_, symbol_);

  await lock.deployed();

  console.log("Lock deployed to:", lock.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

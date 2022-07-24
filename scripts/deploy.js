// 1. Import ethers from the hardhat package
const { ethers } = require("hardhat");

async function main() {
  // 2. Get contract instance
  const Whitelist = await ethers.getContractFactory("Whitelist");

  // 3. Deploy contract
  const DApps = await Whitelist.deploy(10);

  // 4. Print for aesthetics
  console.log("Deploying, please wait...");

  // 5. Wait for deployment to finish
  await DApps.deployed();

  // 6. Another aesthetics
  console.log("Deployed successfully!");
  console.log("DApps Contract Address:", DApps.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

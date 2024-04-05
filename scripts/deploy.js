// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  console.log('preparing deployment...\n')

 //Fetch contract to deploy
  const Token = await ethers.getContractFactory("Token")
  const Exchange = await ethers.getContractFactory("Exchange")

  //Fetch accounts
  const accounts = await ethers.getSigners()
  console.log("Accounts fetched :\n"+accounts[0].address+"\n"+accounts[1].address+"\n")

  // Deploy contract

  const HTG = await Token.deploy('Haitian Gourde','HTG','1000000')
  await HTG.deployed()
  console.log("HTG deployed to : " + HTG.address)
    // let greeting =  "Token has been deployed to :  " + token.address
  // console.log(greeting)

  const mDai = await Token.deploy('mDai','mDai','1000000')
  await mDai.deployed()
  console.log("mDai deployed to : " + mDai.address)

  const mETH = await Token.deploy('mETH','mETH','1000000')
  await mETH.deployed()
  console.log("mETH deployed to : " + mETH.address)

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(" Exchange deployed to : " + exchange.address)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

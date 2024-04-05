// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const config = require("../src/config.json")
const tokens = (n)=>{
  return   ethers.utils.parseUnits(n.toString(),'ether')
}
const wait = (seconds)=>{
  const milliseconds = seconds *1000
  return new Promise(resolve=> setTimeout(resolve,milliseconds))
}

async function main() {

//Fetch accounts from wallet- these are unlocked
  const accounts = await ethers.getSigners()

//Fetch network 
const {chainId} = await ethers.provider.getNetwork() 
console.log("Using chainId "+chainId+ "\n")

//Fetch deployed tokens
  const HTG = await ethers.getContractAt('Token',config[chainId].HTG.address)
  console.log("HTG Token fetched : " + HTG.address)

  const mDai = await ethers.getContractAt('Token',config[chainId].mDai.address)
  console.log("mDai Token fetched : " + mDai.address)

  const mETH = await ethers.getContractAt('Token',config[chainId].mETH.address)
  console.log("mETH Token fetched  : " + mETH.address)
//Fetched the deployed exchange
  const exchange = await ethers.getContractAt('Exchange',config[chainId].exchange.address)
  console.log("Exchange  fetched  : " + exchange.address)
// Give tokens to account 1
  const sender = accounts[0]
  const receiver = accounts[1]
  const amount = tokens(10000)
//user1 transfers 10 000 mETH
  let transaction , result
  transaction = await mETH.connect(sender).transfer(receiver.address,amount)
  await transaction.wait()
  console.log("transfered  " +amount+ " tokens from  "  +sender.address+ " to "  +receiver.address+" \n")

//create exchange users 
  user1 = accounts[0]
  user2 = accounts[1]
 

//user1 approves 10,000 HTG
  transaction = await HTG.connect(user1).approve(exchange.address, amount)
  await transaction.wait()
  console.log("Approve " +amount +" from " +user1.address+" \n")

//user1 deposits 10,000 HTG on the exchange
  transaction = await exchange.connect(user1).depositToken(HTG.address, amount)
  await transaction.wait()
  console.log("Deposited " +amount+ " HTG from " + user1.address+" \n")

//user2 approves 10,000 mETH
  transaction = await mETH.connect(user2).approve(exchange.address, amount)
  await transaction.wait()
  console.log("Approve " +amount +" from " +user2.address+" \n")

//user2s deposits 10,000 mETH on the exchange
  transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
  await transaction.wait()
  console.log("Deposited " +amount + " mETH from " + user2.address+" \n")


//////////////////
  /////Seeding a cancelled order

//User 1 makes order to get tokens 
let Orderid 
transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(10),HTG.address,tokens(5))//THE ARGUMETS ARE (Tokenget, Tokengive)
result = await transaction.wait()
console.log("Made order from "+user1.address+"\n")

//user1 cancels order
Orderid = await result.events[0].args.id
transaction = await exchange.connect(user1).cancelOrder(Orderid)
result = await transaction.wait()
console.log("Cancelled order from "+user1.address+"\n")
//wait 1 second 
await wait(1)

/////////////////////////////////
////Seeding filling orders

//user1 makes another order
transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(10),HTG.address,tokens(10))//THE ARGUMETS ARE (Tokenget, Tokengive)
result = await transaction.wait()
console.log("Made order from "+user1.address+"\n")
//user2 fills the order
Orderid = await result.events[0].args.id 
transaction = await exchange.connect(user2).fillOrder(Orderid)
result = await transaction.wait()
console.log("Filled order by "+user2.address+"\n")

//wait 1 second 
await wait(1)

//user1 makes a second order
transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(10),HTG.address,tokens(15))//THE ARGUMETS ARE (Tokenget, Tokengive)
result = await transaction.wait()
console.log("Made order from "+user1.address+"\n")
//user2 fills the second  order
Orderid = await result.events[0].args.id 
transaction = await exchange.connect(user2).fillOrder(Orderid)
result = await transaction.wait()
console.log("Filled order by "+user2.address+"\n")

//wait 1 second 
await wait(1)

//user1 makes a final order
transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(10),HTG.address,tokens(2))//THE ARGUMETS ARE (Tokenget, Tokengive)
result = await transaction.wait()
console.log("Made order from "+user1.address+"\n")
//user2 fills the final  order
Orderid = await result.events[0].args.id 
transaction = await exchange.connect(user2).fillOrder(Orderid)
result = await transaction.wait()
console.log("Filled order by "+user2.address+"\n")

//wait 1 second 
await wait(1)

///---------------------
//seed Open Orders

//user 1 makes 10 orders 
for (let i=1;i<=10;i++){
  transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(10 * i),HTG.address,tokens(10))//THE ARGUMETS ARE (Tokenget, Tokengive)
  result = await transaction.wait()
  console.log("Made order from "+user1.address+"\n")

  //wait 1 second
  await wait(1)

}

//user2 makes 10 orders 
for (let i=1;i<=10;i++){
  transaction = await exchange.connect(user1).makeOrder(HTG.address,tokens(10),mETH.address,tokens(10 * i))//THE ARGUMETS ARE (Tokenget, Tokengive)
  result = await transaction.wait()
  console.log("Made order from "+user2.address+"\n")

  //wait 1 second
  await wait(1)

}

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})

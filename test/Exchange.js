const { expect } =require ("chai"); 
const { ethers } =require ("hardhat");

const tokens = (n)=>{
	return   ethers.utils.parseUnits(n.toString(),'ether')
}

describe('Exchange',()=> {
	//declare the variable that will contain the the delopyed version of the token first so both of te iterations will be able to read it 
	let deployer , feeAccount, accounts, Exchange
	const feePercent = 10
	
	//some javascript to set some variables upfrot if running multiple tests
	beforeEach(async()=>{

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]

		//Fetch Token from blockchain
		const Exchange= await ethers.getContractFactory('Exchange')
		exchange = await Exchange.deploy(feeAccount.address, feePercent)

	})

	describe('deployment',()=>{

		it('tracks the fee account', async()=> {
			expect(await exchange.feeAccount()).to.equal(feeAccount.address)

		})


		it('tracks the fee percent', async()=> {
			expect(await exchange.feePercent()).to.equal(feePercent)
			
		})
	})
})

	
const { expect } =require ("chai"); 
const { ethers } =require ("hardhat");

const tokens = (n)=>{
	return   ethers.utils.parseUnits(n.toString(),'ether')
}

describe('Token',()=> {
	//declare the variable that will contain the the delopyed version of the token first so both of te iterations will be able to read it 
	let token
	//some javascript to set some variables upfrot if running multiple tests
	beforeEach(async()=>{
		//Fetch Token from blockchain
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('Haitian Gourde','HTG','1000000')

	})

	it('has correct name', async()=> {
		//check that the name is correct
		expect(await token.name()).to.equal('Haitian Gourde')

	})

	it('has correct symbol', async()=> {
		 
		//check that the symbol is correct
		expect(await token.symbol()).to.equal('HTG')
	})

	it('has correct decimals', async()=> {
		 
		//check that the symbol is correct
		expect(await token.decimals()).to.equal('18')
	})

	it('has correct total supply', async()=> {
		
		 
		//check that the total supply is correct
		expect(await token.totalSupply()).to.equal( tokens('1000000'))
	})
})
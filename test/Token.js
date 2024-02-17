const { expect } =require ("chai"); 
const { ethers } =require ("hardhat");

const tokens = (n)=>{
	return   ethers.utils.parseUnits(n.toString(),'ether')
}

describe('Token',()=> {
	//declare the variable that will contain the the delopyed version of the token first so both of te iterations will be able to read it 
	let token, accounts ,deployer , receiver,exchange
	
	//some javascript to set some variables upfrot if running multiple tests
	beforeEach(async()=>{
		//Fetch Token from blockchain
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('Haitian Gourde','HTG','1000000')

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		receiver = accounts[1]
		exchange = accounts[2]


	})

	describe('deployment',()=>{
		const name 			= 'Haitian Gourde'
		const symbol		= 'HTG'
		const decimals		= '18'
		const totalSupply 	= tokens('1000000')

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

		it('attributes total supply to balance', async()=> {
		 
		//check that the symbol is correct
			expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
		})
	})

	describe('sending tokens',()=>{

		describe('success',()=>{
			let amount,  transaction, result
		beforeEach(async()=>{
			amount = tokens(100)
			transaction = await token.connect(deployer).transfer(receiver.address,amount)
			result      = await transaction.wait()

		})

		it('transfers Token balances',async ()=>{
			expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
			expect(await token.balanceOf(receiver.address)).to.equal(amount)
		})

		it('emits the Transfer event',async()=>{
			const event = await result.events[0]
			expect(await event.event).to.equal('Transfer')

			const args = await event.args
			expect(await args.from).to.equal(deployer.address)
			expect(await args.to).to.equal(receiver.address)
			expect(await args.value).to.equal(amount)

		})

		describe('failure',()=>{
			it('rejects insufficent balances',async()=>{
				let invalidAmout = tokens(1000000000)
				await expect(token.connect(deployer).transfer(receiver.address,invalidAmout)).to.be.reverted 

			})

			it('rejects invalind recipients',async()=>{
				const amount = tokens(100)
				await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted


			})
			
		})


		})
		

	})
	describe ('Approving tokens',()=>{
		let amount,  transaction, result

		beforeEach(async()=>{
			amount = tokens(100)
			transaction = await token.connect(deployer).approve(exchange.address,amount)
			result      = await transaction.wait()

		})

		describe('success',()=>{
			it('allocates and allowance for delegated token spending',async()=>{
				expect(await token.allowance(deployer.address,exchange.address)).to.equal(amount)
			})
			it('emits an approval event',async()=>{
				const event = await result.events[0]
				expect(await event.event).to.equal('Approval')

				const args = await event.args
				expect(await args.owner).to.equal(deployer.address)
				expect(await args.spender).to.equal(exchange.address)
				expect(await args.value).to.equal(amount)
			})

		})
		describe('failure',()=>{
				it('rejects invalind spenders',async()=>{
				const amount = tokens(100)
				await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted 
				})

		})
	})
})
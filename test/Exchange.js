const { expect } =require ("chai"); 
const { ethers } =require ("hardhat");

const tokens = (n)=>{
	return   ethers.utils.parseUnits(n.toString(),'ether')
}

describe('Exchange',()=> {
	//declare the variable that will contain the the delopyed version of the token first so both of te iterations will be able to read it 
	let deployer , feeAccount, accounts, exchange, user1
	const feePercent = 10
	
	//some javascript to set some variables upfrot if running multiple tests
	beforeEach(async()=>{
		const Exchange= await ethers.getContractFactory('Exchange')
		const Token= await ethers.getContractFactory('Token')
		token1= await Token.deploy('Haitian Gourde','HTG','1000000')
		token2= await Token.deploy('Mock DogeCoin','mDOGE','1000000')

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]
		user1 = accounts[2]

		let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
		await transaction.wait()
		

		//Fetch Token from blockchain
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

	describe('depositing tokens',()=>{ 
		let transaction, result

		const tokens = (n)=>{
			return   ethers.utils.parseUnits(n.toString(),'ether')
		}

		let amount = tokens(10)

		
		describe('success',()=>{
			beforeEach(async()=>{
			
			
			//Approve token
			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = await transaction.wait()

			//deposit token
			transaction = await exchange.connect(user1).depositToken(token1.address, amount)
			result = await transaction.wait()

			})

			it('track the token deposit', async()=>{
				expect(await token1.balanceOf(exchange.address)).to.equal(amount)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
			})
			it('emits a deposit event',async()=>{
			const event = await result.events[1]
			expect(await event.event).to.equal('deposit')

			const args = await event.args
			expect(await args.token).to.equal(token1.address)
			expect(await args.user).to.equal(user1.address)
			expect(await args.amount).to.equal(amount)
			expect(await args.balance).to.equal(amount)

		})


		})
		describe('failure',()=>{
			it('fails when tokens are not approved',async()=>{
				//Don't approve tokens before depositing
				expect(await token1.connect(user1).approve(exchange.address, amount)).to.be.reverted
			})

		})


	})


	describe('withdraw  tokens',()=>{ 
		let transaction, result
		let amount = tokens(10)

		
		describe('success',()=>{
				beforeEach(async()=>{
				
				
				//Approve token
					transaction = await token1.connect(user1).approve(exchange.address, amount)
					result = await transaction.wait()

				//deposit token
					transaction = await exchange.connect(user1).depositToken(token1.address, amount)
					result = await transaction.wait()
				//now withdraw tokens
					transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
					result = await transaction.wait()

				})

				it('withdraws the token funds', async()=>{
					expect(await token1.balanceOf(exchange.address)).to.equal(0)
					expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
					expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)


				})

				it('emits a withdrawal event',async()=>{
					const event = await result.events[1]
					expect(await event.event).to.equal('Withdraw')
					
					const args = await event.args
					expect(await args.token).to.equal(token1.address)
					expect(await args.user).to.equal(user1.address)
					expect(await args.amount).to.equal(amount)
					expect(await args.balance).to.equal(0)

				})

		})

		describe('failure',()=>{
				it('it fails for insufficient balance ',async()=>{
					//Attempts to withdraw without depositing
					await expect( exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
				})

		})
	})

	describe('checking user balances',()=>{ 
		let transaction, result
		let amount = tokens(1)

		beforeEach(async()=>{
			
			
			//Approve token
			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = await transaction.wait()

			//deposit token
			transaction = await exchange.connect(user1).depositToken(token1.address, amount)
			result = await transaction.wait()

			})

			it('it returns the user balance', async()=>{
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
			})

			
	})


	describe('making orders',()=>{ 
		let transaction, result
		let amount = tokens(10)		
		
		describe('success',()=>{
				beforeEach(async()=>{

					//----Deposit token before making order------//

					//Approve token
					transaction = await token1.connect(user1).approve(exchange.address, amount)
					result = await transaction.wait()

					//deposit token
					transaction = await exchange.connect(user1).depositToken(token1.address, amount)
					result = await transaction.wait()
					//Make order
					transaction = await exchange.connect(user1).makeOrder(token2.address,tokens(1),token1.address,tokens(1))
					result = await transaction.wait()
				
				})

				it('tracks the newly created orders', async()=>{
					expect(await exchange.ordersCount()).to.equal(1)	
				})

				it('emits an order event',async()=>{
					const event = await result.events[0]
					expect(await event.event).to.equal('Order')
					
					const args = await event.args
					expect(await args.id).to.equal(1)
					expect(await args.user).to.equal(user1.address)
					expect(await args.tokenGet).to.equal(token2.address)
					expect(await args.amountGet).to.equal(tokens(1))
					expect(await args.tokenGive).to.equal(token1.address)
					expect(await args.amountGive).to.equal(tokens(1))
					expect(await args.timestamp).to.at.least(1)
					



				})


		})

		describe('failure',()=>{
			it('rejects with no balance', async () =>{
				await expect( exchange.connect(user1).makeOrder(token2.address,tokens(1),token1.address,tokens(1))).to.be.reverted

			})
				

		})
	})




})

	
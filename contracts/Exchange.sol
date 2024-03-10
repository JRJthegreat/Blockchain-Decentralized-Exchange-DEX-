//SPDX-License-Identifier: Unlicense
pragma solidity^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
	address public feeAccount ;
	uint256 public feePercent ;
	mapping(address=>mapping(address=>uint256))public tokens; // mapping ofr balance
	mapping(uint256=>_Order) public orders;
	uint256 public ordersCount;
	mapping(uint256 => bool) public orderCancelled; //returns true or false
	mapping(uint256 => bool) public orderFilled;
	event deposit(
		address token, 
		address user, 
		uint256 amount, 
		uint256 balance);

	event Withdraw(
		address token, 
		address user, 
		uint256 amount, 
		uint256 balance
		);

	event Order (
		uint256 id,
		address user,
		address tokenGet, 
		uint256 amountGet, 
		address tokenGive, 
		uint256 amountGive,
		uint256 timestamp
		);

	event Cancel (
		uint256 id,
		address user,
		address tokenGet, 
		uint256 amountGet, 
		address tokenGive, 
		uint256 amountGive,
		uint256 timestamp
		);


	event Trade (
		uint256 id,
		address user,
		address tokenGet, 
		uint256 amountGet, 
		address tokenGive, 
		uint256 amountGive,
		address creator,
		uint256 timestamp
		);

	//A way to model the order
	struct _Order {
		uint256 id;//unique identifier for order
		address user;//user who made the order
		address _tokenGet; //token they want to receive
		uint256 _amountGet; //amount they receive
		address _tokenGive; //tokenn they give
		uint256 _amountGive;//amount they give
		uint256 timestamp;//when order was created

	}

	constructor(address _feeAccount, uint256 _feePercent)
	{
		feeAccount = _feeAccount;
		feePercent = _feePercent;

	}

	//deposit token
	function  depositToken (address _Token, uint256 _amount)public {
		//transfer token to exchange
		require(Token(_Token).transferFrom(msg.sender, address(this), _amount));
		//update user balance
		tokens[_Token][msg.sender] = tokens[_Token][msg.sender] + _amount ;
		//emit an event
		emit deposit(_Token, msg.sender, _amount, tokens[_Token][msg.sender]) ;

	}

	function withdrawToken(address _Token, uint256 _amount) public {
		//user has enough balance to withdraw
		require(tokens[_Token][msg.sender]>= _amount);
		//transfer token to user
		require(Token(_Token).transfer(msg.sender, _amount),'withdraw');
		//update user balance
		tokens[_Token][msg.sender] = tokens[_Token][msg.sender] - _amount ;
		//emit an event
		emit Withdraw(_Token, msg.sender, _amount, tokens[_Token][msg.sender]) ;

	}

	//check balances
	function balanceOf(address _Token, address _user)
	public
	view 
	returns (uint256)
	{
		return tokens[_Token][_user];

	}

	
	//-----------------------
	//Make and cancel orders

	function makeOrder(
		address _tokenGet, 
		uint256 _amountGet, 
		address _tokenGive, 
		uint256 _amountGive
		) public {

			//prevent orders if tokens aren't on exchange
			require (balanceOf(_tokenGive, msg.sender)>= _amountGet);

			//Create order
			ordersCount++;
			orders[ordersCount]= _Order(

				ordersCount,//id
				msg.sender,//user
				_tokenGet,//_tokenGet
				_amountGet,//_amountGet
				_tokenGive,//_tokenGive
				_amountGive,//amountGive
				block.timestamp//timestamp 1898391975
			);

			//emit order event
			emit Order(

				ordersCount,
				msg.sender,
				_tokenGet,
				_amountGet,
				_tokenGive,
				_amountGive,
				block.timestamp

				);

	}

	function cancelOrder(uint256 _id)public {
		//fectch the order
		 _Order storage _order = orders[_id];
		 //CANCEL ORDER
		 orderCancelled[_id] = true;
		 //Order must exist
		 require (_order.id == _id);
		 //order must be cancelled by owner
		  require (_order.user == msg.sender);


		 emit Cancel(

				_order.id,
				msg.sender,
				_order._tokenGet,
				_order._amountGet,
				_order._tokenGive,
				_order._amountGive,
				block.timestamp

				);

	}

	function fillOrder(uint256  _id) public {
		//1. must be valid orderid
		require (_id>0 && _id== ordersCount);
		//2.orders can't be filled 
		require (!orderFilled[_id]);
		//3. orders can't be cancelled
		require (!orderCancelled[_id],'rejects cancel orders');
		

		//fectch the order
		_Order storage _order = orders[_id];

		// Execute the trade
		_trade(
			_order.id,
		 	_order.user,
		 	_order._tokenGet,
		 	_order._amountGet,
		 	_order._tokenGive,
		 	_order._amountGive

		 	);

		orderFilled[_order.id] = true;

	}

	function _trade(

		uint256 _orderid,
		address _user,
		address _tokenGet,
		uint256 _amountGet,
		address _tokenGive,
		uint256 _amountGive
		 )internal{

		// fee is paid by the person who filled the order (msg.sender)
		//fee is deducted from the amountGet
		uint256 _feeAmount = (_amountGet * feePercent)/100 ;

		//Do trade here
		tokens[_tokenGet][msg.sender] = 
			tokens[_tokenGet][msg.sender] - 
			(_amountGet + _feeAmount) ; // the person filling the order

		tokens[_tokenGet][_user] = 
			tokens[_tokenGet][_user] +
			_amountGet ; // the user who made the order

		//charge fees
		tokens[_tokenGet][feeAccount] = 
			tokens[_tokenGet][feeAccount] + 
			_feeAmount ;

		tokens[_tokenGive][_user] = 
			tokens[_tokenGive][_user] -
		 	_amountGive ;

		tokens[_tokenGive][msg.sender] =
		 	tokens[_tokenGive][msg.sender] + 
			_amountGive ;

		emit Trade(

			_orderid,
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			_user,
			block.timestamp
			);

	}

}
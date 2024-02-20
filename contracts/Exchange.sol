//SPDX-License-Identifier: Unlicense
pragma solidity^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
	address public feeAccount ;
	uint256 public feePercent ;
	mapping(address=>mapping(address=>uint256))public tokens;
	event deposit(address token, address user, uint256 amount, uint256 balance);

	constructor(address _feeAccount, uint256 _feePercent)
	{
		feeAccount = _feeAccount;
		feePercent = _feePercent;

	}

	//deposit and withdrawal token
	function  depositToken (address _Token, uint256 _amount)public {
		//transfer token to exchange
		require(Token(_Token).transferFrom(msg.sender, address(this), _amount));
		//update user balance
		tokens[_Token][msg.sender] = tokens[_Token][msg.sender] + _amount ;
		//emit an event
		emit deposit(_Token, msg.sender, _amount, tokens[_Token][msg.sender]) ;

	}

	//check balances
	function balanceOf(address _Token, address _user)
	public
	view 
	returns (uint256)
	{
		return tokens[_Token][_user];

	}

}
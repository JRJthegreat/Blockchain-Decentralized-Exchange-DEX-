//SPDX-License-Identifier: Unlicense
pragma solidity^0.8.0;

import "hardhat/console.sol";

contract Token {

	string public name;
	string public symbol;
	uint256 public decimals = 18;
	uint256 public totalSupply;

	//track balances 
	mapping (address => uint256) public balanceOf;

	event Transfer(address indexed from, 
		address indexed to, 
		uint256 value
		);
	

	constructor (
		string memory _name,
		string memory _symbol,
		uint256 _totalSupply
		)

	{
		name        = _name;
		symbol      = _symbol;
		totalSupply = _totalSupply * (10**decimals);
		balanceOf[msg.sender]  = totalSupply;
		
	}

	function transfer(address to, uint256 value) 
		public 
		returns (bool success)

	{
		//Require that the sender has enough token to transfer
		require (balanceOf[msg.sender] >= value);
		//Require that the token is not sent to a null address
		require(to != address(0));

		//deduct tokens to the sender
		balanceOf[msg.sender] = balanceOf[msg.sender] - value;
		//credit token to the receiver
		balanceOf[to] = balanceOf[to] + value;

		//emit trasnfer event
		emit Transfer(msg.sender, to, value);

		return true;

	}
		
}
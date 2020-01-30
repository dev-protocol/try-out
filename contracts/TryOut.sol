pragma solidity >=0.5.0;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {Dev} from "./Dev.sol";

contract TryOut is Ownable {
	Dev token;

	mapping(address => bool) dropped;

	constructor(address _token) public {
		token = Dev(_token);
	}

	function deposit(address _property, uint256 _amount) external {
		if (dropped[msg.sender] == false) {
			token.transfer(msg.sender, 1000000000000000000);
			dropped[msg.sender] = true;
		}

		token.depositFrom(msg.sender, _property, _amount);
	}

	function charge(uint256 _amount) external onlyOwner {
		token.transferFrom(msg.sender, address(this), _amount);
	}

	function refund() external onlyOwner {
		token.transfer(owner(), token.balanceOf(address(this)));
	}
}

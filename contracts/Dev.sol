pragma solidity ^0.5.0;

// prettier-ignore
import {ERC20Detailed} from "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
// prettier-ignore
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
// prettier-ignore
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

contract Dev is ERC20Detailed, ERC20Mintable, ERC20Burnable {
	constructor() public ERC20Detailed("Dev", "DEV", 18) {}

	function depositFrom(address _from, address _to, uint256 _amount)
		external
		returns (bool)
	{
		transferFrom(_from, _to, _amount);
		return true;
	}
}

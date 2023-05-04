//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20{
    address public kryptoKoinTokenAddress;

    constructor(address _kryptoKoinTokenAddress) ERC20("Krypto Koin LP Token","KKLP"){
        require(_kryptoKoinTokenAddress != address(0),"Token address passed is null address");
        kryptoKoinTokenAddress = _kryptoKoinTokenAddress;
    }

    function getReserve() public view returns(uint){
        return ERC20(kryptoKoinTokenAddress).balanceOf(address(this));
    }

    function addLiquidity(uint _amount) public payable returns (uint) {
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint kryptoKoinTokenReserve = getReserve();
        ERC20 kryptoKoinToken = ERC20(kryptoKoinTokenAddress);
        if(kryptoKoinTokenReserve == 0){
            kryptoKoinToken.transferFrom(msg.sender,address(this),_amount);
            liquidity = ethBalance;
            _mint(msg.sender,liquidity);
        }else{
            uint ethReserve = ethBalance - msg.value;
            uint kryptoKoinTokenAmount = ((kryptoKoinTokenReserve * msg.value) / ethReserve); 
            require (_amount >= kryptoKoinTokenAmount,"Insufficient tokens");
            kryptoKoinToken.transferFrom(msg.sender,address(this),kryptoKoinTokenAmount);
            liquidity = (totalSupply() * msg.value)/ethReserve;
            _mint(msg.sender,liquidity);
        }
        return liquidity;
    }

    function removeLiquidity(uint _amount) public returns(uint,uint){
        require (_amount > 0,"Amount must be greater than zero");
        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();
        uint ethAmount = (ethReserve * _amount)/_totalSupply;
        uint kryptoKoinTokenAmount = (getReserve() * _amount)/_totalSupply;
        _burn(msg.sender,_amount);
        payable(msg.sender).transfer(ethAmount);
        ERC20(kryptoKoinTokenAddress).transfer(msg.sender,kryptoKoinTokenAmount);
        return (ethAmount,kryptoKoinTokenAmount);
    }

    function getAmountOfTokens(uint inputAmount,uint inputReserve,uint outputReserve) public pure returns(uint){
        require (inputReserve >0 && outputReserve >0,"INvalid reserves");
        uint inputAmountWithFees = inputAmount * 99;
        uint numerator = inputAmountWithFees * outputReserve;
        uint denominator = inputReserve * 100 + inputAmountWithFees;
        return numerator/denominator;
    }

    function ethToKryptoKoinToken(uint _minToken) public payable{
        uint tokenReserve = getReserve();
        uint tokenBought = getAmountOfTokens(msg.value,(address(this).balance - msg.value),tokenReserve);
        require (_minToken <= tokenBought,"Insufficient token amount");
        ERC20(kryptoKoinTokenAddress).transfer(msg.sender,tokenBought);
    }

    function kryptoKoinTokenToEth(uint _tokensSold,uint _minEth) public{
        uint tokenReserve = getReserve();
        uint ethBought = getAmountOfTokens(_tokensSold,tokenReserve,address(this).balance);
        require(_minEth <= ethBought,"Insufficient ETH amount");
        ERC20(kryptoKoinTokenAddress).transferFrom(msg.sender,address(this),_tokensSold);
        payable(msg.sender).transfer(ethBought);
    }


}
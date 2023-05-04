import { Contract } from "ethers";
import{
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI
}from "../constants";

export async function getAmountOfTokensReceivedFromSwap(provider,_swapAmountWei,ethBalance,reservedKK,ethSelected){
    const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS,EXCHANGE_CONTRACT_ABI,provider);
    let amountOfTokens;
    if(ethSelected){
        amountOfTokens = await exchangeContract.getAmountOfTokens(_swapAmountWei,ethBalance,reservedKK);
    }else{
        amountOfTokens = await exchangeContract.getAmountOfTokens(_swapAmountWei,reservedKK,ethBalance);
    }
    return amountOfTokens;
}

export async function swapTokens(signer,swapAmountWei,tokenTobeReceivedAfterSwap,ethSelected){
    const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS,EXCHANGE_CONTRACT_ABI,signer);
    const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS,TOKEN_CONTRACT_ABI,signer);
    let tx;
    if(ethSelected){
        tx = await exchangeContract.ethToKryptoKoinToken(tokenTobeReceivedAfterSwap,{value:swapAmountWei,});
    }else{
        tx = await tokenContract.approve(EXCHANGE_CONTRACT_ADDRESS,swapAmountWei.toString());
        await tx.wait();
        tx = await exchangeContract.kryptoKoinTokenToEth(swapAmountWei,tokenTobeReceivedAfterSwap);
    }
    await tx.wait();
}
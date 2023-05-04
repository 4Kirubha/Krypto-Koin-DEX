import { Contract,providers,utils,BigNumber} from "ethers";
import {
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI
} from "../constants";

export async function removeLiquidity(signer,removeLPTokensWei){
    const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS,EXCHANGE_CONTRACT_ABI,signer);
    const tx = await exchangeContract.removeLiquidity(removeLPTokensWei);
    await tx.wait();
}

export async function getTokensAfterRemove(provider,removeLPTokensWei,_ethBalance,kryptoKoinTokenReserve){
    try{
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS,EXCHANGE_CONTRACT_ABI,provider);
        const _totalSupply = await exchangeContract.totalSupply();
        const _removeEth = _ethBalance.mul(removeLPTokensWei).div(_totalSupply);
        const _removeKK = kryptoKoinTokenReserve.mul(removeLPTokensWei).div(_totalSupply);
        return {
            _removeEth,
            _removeKK}
    }catch (err) {
    console.error(err);
    }
}
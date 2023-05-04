import { Contract } from "ethers";
import {
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,} from "../constants";

export async function getEtherBalance(provider,address,contract = false){
    try{
        if(contract){
            const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
            return balance;
        }else{
            const balance = await provider.getBalance(address);
            return balance;
        }
    }catch (err) {
    console.error(err);
    return 0;
    }
}

export async function getKKTokenBalance(provider,address){
    try{
        const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS,TOKEN_CONTRACT_ABI,provider);
        const balanceOfKryptoKoinTokens = await tokenContract.balanceOf(address);
        return balanceOfKryptoKoinTokens;
    }catch (err){
    console.error(err);
    return 0;
    }
}

export async function getLPTokenBalance(provider,address){
    try{
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS,EXCHANGE_CONTRACT_ABI,provider);
        const balanceOfLPTokens = await exchangeContract.balanceOf(address);
        return balanceOfLPTokens;
    }catch (err){
    console.error(err);
    }
}

export async function getReserveOfKKTokens(provider) {
    try{
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS,EXCHANGE_CONTRACT_ABI,provider);
        const reserveKK = await exchangeContract.getReserve();
        return reserveKK;
    }catch (err) {
    console.error(err);
    }
}
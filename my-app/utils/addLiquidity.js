import { Contract,utils } from "ethers";
import {
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI} from "../constants";

export async function addLiquidity(signer,addKKAmountwei,addEtherAmountWei){
    try{
        const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS,TOKEN_CONTRACT_ABI,signer);
        const exchangeContract = new Contract (EXCHANGE_CONTRACT_ADDRESS,EXCHANGE_CONTRACT_ABI,signer);
        let tx = await tokenContract.approve(EXCHANGE_CONTRACT_ADDRESS,addKKAmountwei.toString());
        await tx.wait();
        tx = await exchangeContract.addLiquidity(addKKAmountwei,{value: addEtherAmountWei,});
        await tx.wait();
    }catch (err) {
    console.error(err);
    }
}

export async function calculateCD(_addEther = "0",etherBalanceContract,kkTokenReserve){
    const _addEtherAmountWei = utils.parseEther(_addEther);
    const KrptoKoinTokenAmount = _addEtherAmountWei.mul(kkTokenReserve).div(etherBalanceContract);
    return KrptoKoinTokenAmount;
}
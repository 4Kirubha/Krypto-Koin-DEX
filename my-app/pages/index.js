import { BigNumber,providers,utils } from "ethers";
import Head from "next/head";
import React,{useEffect,useRef,useState} from "react";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import {
    addLiquidity,
    calculateCD,
} from "../utils/addLiquidity";
import {
    getEtherBalance,
    getLPTokenBalance,
    getKKTokenBalance,
    getReserveOfKKTokens,
} from "../utils/getAmounts";
import {
    removeLiquidity,
    getTokensAfterRemove,
} from "../utils/removeLiquidity";
import {
    swapTokens,
    getAmountOfTokensReceivedFromSwap,
} from "../utils/swap";

export default function Home(){
    const [walletConnected,setWalletConnected] = useState(false);
    const [loading,setLoading] = useState(false);
    const [liquidityTab,setLiquidityTab] = useState(true);
    const zero = BigNumber.from(0);
    const [reservedKK,setReservedKK] = useState(zero);
    const [ethBalance,setEthBalance] = useState(zero);
    const [etherBalanceInContract,setEtherBalanceInContract] = useState(zero);
    const [kkBalance,setKKBalance] = useState(zero);
    const [lpBalance,setLPBalance] = useState(zero);
    const [removeEth,setRemoveEth] = useState(zero);
    const [addEth,setAddEth] = useState(zero);
    const [addKKTokens,setAddKKTokens] = useState(zero);
    const [removeKK,setRemoveKK] = useState(zero);
    const [removeLPTokens,setRemoveLPTokens] = useState("0");
    const [swapAmount,setSwapAmount] = useState("");
    const [tokenTobeReceivedAfterSwap,setTokenTobeReceivedAfterSwap] = useState(zero);
    const [ethSelected,setEthSelected] = useState(true);
    const web3ModalRef = useRef();

    async function getProviderOrSigner(needSigner = false){
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);
        const{chainId} = await web3Provider.getNetwork();
        if(chainId!= 11155111){
            window.alert("Change the network to Sepolia");
            throw new Error ("Change the network to Sepolia")
        }
        if(needSigner){
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    }

    async function connectWallet(){
        try{
            await getProviderOrSigner();
            setWalletConnected(true);
        }catch(err){
            console.error(err);
        }
    }

    async function getAmounts(){
        try{
            const provider = await getProviderOrSigner();
            const signer = await getProviderOrSigner(true);
            const address = await signer.getAddress();

            const _ethBalance = await getEtherBalance(provider,address);
            const _etherBalanceInContract = await getEtherBalance(provider,null,true);
            const _KKTokenBalance = await getKKTokenBalance(provider,address);
            const _lpBalance = await getLPTokenBalance(provider,address);
            const _reservedKK = await getReserveOfKKTokens(provider);
            setEthBalance(_ethBalance);
            setEtherBalanceInContract(_etherBalanceInContract);
            setReservedKK(_reservedKK);
            setLPBalance(_lpBalance);
            setKKBalance(_KKTokenBalance);
        }catch(err){
            console.error(err);
        }
    }

    async function _swapTokens(){
        try{
            const swapAmountWei = utils.parseEther(swapAmount.toString());
            if(!swapAmountWei.eq(zero)){
                const signer = await getProviderOrSigner(true);
                setLoading(true);
                await swapTokens(signer,swapAmountWei,tokenTobeReceivedAfterSwap,ethSelected);
                setLoading(false);
                await getAmounts();
                setSwapAmount("");
            }
        }catch(err){
            console.error(err);
            setLoading(false);
            setSwapAmount("");
        }
    }

    async function _getAmountOfTokensReceivedFromSwap(_swapAmount){
        try{
            const _swapAmountWei = utils.parseEther(_swapAmount.toString());
            if(!_swapAmountWei.eq(zero)){
                const provider = await getProviderOrSigner();
                const _ethBalance = await getEtherBalance(provider,null,true);
                const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
                    provider,
                    _swapAmountWei,
                    _ethBalance,
                    reservedKK,
                    ethSelected
                )
                setTokenTobeReceivedAfterSwap(amountOfTokens);
            }else{
                setTokenTobeReceivedAfterSwap(zero);
            }
        }catch(err){
            console.error(err);
        }
    }

    async function _addLiquidity(){
        try{
            const addEtherWei = utils.parseEther(addEth.toString());
            if(!addKKTokens.eq(zero) && !addEtherWei.eq(zero)){
                const signer = await getProviderOrSigner(true);
                setLoading(true);
                await addLiquidity(signer,addKKTokens,addEtherWei);
                setLoading(false);
                setAddKKTokens(zero);
                await getAmounts();
            }else{
                setAddKKTokens(zero);
            }
        }catch(err){
            console.error(err);
            setLoading(false);
            setAddKKTokens(zero);
        }
    }

    async function _removeLiquidity(){
        try{
            const signer = await getProviderOrSigner(true);
            const removeLPTokensWei = utils.parseEther(removeLPTokens.toString());
            setLoading(true);
            await removeLiquidity(signer,removeLPTokensWei);
            setLoading(false);
            await getAmounts();
            setRemoveKK(zero);
            setRemoveEth(zero);
        }catch(err){
            console.error(err);
            setLoading(false);
            setRemoveEth(zero);
            setRemoveKK(zero);
        }
    }

    async function _getTokensAfterRemove(_removeLPtokens){
        try{
            const provider = await getProviderOrSigner();
            const removeLPTokensWei = utils.parseEther(_removeLPtokens.toString());
            const _ethBalance = await getEtherBalance(provider,null,true);
            const kryptoKoinTokenReserve = await getReserveOfKKTokens(provider);
            const { _removeEther, _removeKK } = await getTokensAfterRemove(
                provider,
                removeLPTokensWei,
                _ethBalance,
                kryptoKoinTokenReserve
            );
            setRemoveEth(BigNumber.from(_removeEther));
            setRemoveKK(BigNumber.from(_removeKK));
        }catch(err){
            console.error(err);
        }
    }

    useEffect(() => {
        if(!walletConnected){
            web3ModalRef.current = new Web3Modal({
                network:"sepolia",
                providerOptions:{},
                disableInjectedProvider: false,
            });
            connectWallet();
            getAmounts(); 
        }
    },[walletConnected])

    function renderButton(){
        if(!walletConnected){
            return(<button className={styles.button} onClick={connectWallet}>Connect your wallet</button>)
        }
        if(loading){
            return(<button className={styles.button}>Loading...</button>)
        }
        if(liquidityTab){
            return(
                <div>
                    <div className={styles.description}>
                        You have:
                        <br/>
                        {utils.formatEther(kkBalance)} Krpto Koin Tokens
                        <br/>
                        {utils.formatEther(ethBalance)} Ether
                        <br/>
                        {utils.formatEther(lpBalance)} Krypto Koin LP Tokens
                    </div>
                    <div>
                        {utils.parseEther(reservedKK.toString()).eq(zero) ? (
                            <div>
                                <input 
                                    className={styles.input}
                                    type="number"
                                    placeholder="Amount of Ether"
                                    onChange={(e) => setAddEth(e.target.value||"0")}>
                                </input>
                                <input 
                                    className={styles.input}
                                    type="number"
                                    placeholder="Amount of Krypto Koin Tokens"
                                    onChange={(e) => setAddKKTokens(BigNumber.from(utils.parseEther(e.target.value||"0")))}>
                                </input>
                                <button className={styles.button1} onClick={_addLiquidity}>Add</button>
                            </div>
                        ):(
                            <div>
                                <input 
                                    className={styles.input}
                                    type="number"
                                    placeholder="Amount of Ether"
                                    onChange={async (e) => {setAddEth(e.target.value||"0");
                                    const _addKKTokens = await calculateCD(
                                        e.target.value || "0",
                                        etherBalanceInContract,
                                        reservedKK);
                                    setAddKKTokens(_addKKTokens);
                                    }}>
                                </input>
                                <div className={styles.inputDiv}>
                                    {`You will need ${utils.formatEther(addKKTokens)} Krypto Koin Tokens`}
                                </div>
                                <button className={styles.button1} onClick={_addLiquidity}>Add</button>
                            </div>
                        )}
                        <div>
                            <input 
                                className={styles.input}
                                type="number"
                                placeholder="Amount of LP Tokens"
                                onChange={async (e) => {setRemoveLPTokens(e.target.value||"0");
                                    await _getTokensAfterRemove(BigNumber.from(e.target.value || "0"))}}>
                            </input>
                            <div className={styles.inputDiv}>
                                {`You will get ${utils.formatEther(removeEth)} Ether and ${utils.formatEther(removeKK)} Krypto Koin Tokens`}
                            </div>
                            <button className={styles.button1} onClick={_removeLiquidity}>Remove</button>
                        </div>
                    </div>
                </div>
            )
        }else{
            return(
            <div>
                <input
                    className={styles.input}
                    type="number"
                    onChange={async (e) =>{setSwapAmount(e.target.value || "0")
                        await _getAmountOfTokensReceivedFromSwap(e.target.value)}}
                    value={swapAmount}>  
                </input>
                <select
                    className={styles.select}
                    name="dropdown"
                    id="dropdown"
                    onChange={async() => {
                        setEthSelected(!ethSelected)
                        await _getAmountOfTokensReceivedFromSwap(0);
                        setSwapAmount("0");
                    }}>
                    <option value="eth">Ethereum</option>
                    <option value="kryptoKOinToken">Krypto Koin Token</option>
                </select>
                <br/>
                <div className={styles.inputDiv}>
                    {ethSelected ? `You will get ${utils.formatEther(tokenTobeReceivedAfterSwap)} Krypto Koin Tokens`
                        : `You will get ${utils.formatEther(tokenTobeReceivedAfterSwap)} Ether`}
                </div>
                <button className={styles.button1} onClick={_swapTokens}>Swap</button>
            </div>
        )  
        }
    }
    return (
        <div>
          <Head>
            <title>Krypto Koins</title>
            <meta name="description" content="Whitelist-Dapp" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className={styles.main}>
            <div>
              <h1 className={styles.title}>Welcome to Krypto Koins Exchange!</h1>
              <div className={styles.description}>
                Exchange Ethereum &#60;&#62; Krypto Koin Tokens
              </div>
              <div>
                <button
                  className={styles.button}
                  onClick={() => {
                    setLiquidityTab(true);
                  }}
                >
                  Liquidity
                </button>
                <button
                  className={styles.button}
                  onClick={() => {
                    setLiquidityTab(false);
                  }}
                >
                  Swap
                </button>
              </div>
              {renderButton()}
            </div>
            <div>
              <img className={styles.image} src="./cryptodev.svg" />
            </div>
          </div>
    
          <footer className={styles.footer}>
            Made with &#10084; by Krypto Koins
          </footer>
        </div>
      );
}



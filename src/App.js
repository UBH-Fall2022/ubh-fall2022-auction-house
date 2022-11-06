import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Modal from './components/Modal'
import openseaLogo from './assets/opensea-logo.png'
import myEpicNft from './utils/MyEpicNFT.json'
import './App.css';

const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-exc8c2isgt';

const CONTRACT_ADDRESS = "0xC927f6b7DAc4B660349D596d219f6eA7B7C01B57";

const App = () => {
  let totalMinted
  const [currentAccount, setCurrentAccount] = useState("")
  const [miningAnimation, setMiningAnimation] = useState(false)
  const [mintTotal, setMintTotal] = useState(totalMinted)

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!")
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
      console.log(window.ethereum.networkVersion, 'window.ethereum.networkVersion');
    }
    
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])

      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        })
        console.log("Setup event listener!")
      } else {
        console.log("Ethereum object doesn't exist")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
      try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner()
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

          let nftTxn = await connectedContract.makeAnEpicNFT()

          setMiningAnimation(true);
          await nftTxn.wait()
          console.log(nftTxn)
          console.log(`Mined, tee transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
          setMiningAnimation(false)
        } else {
          console.log("Ethereum object doesn't exist")
        }
      } catch (error) {
        console.log(error)
      }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    getTotalNFTsMintedSoFar()
  }, [])

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button mint-button">
      Mint NFT
    </button>
  )

  const renderNetworkPrompt = () => (
    alert("MINTER TOOL")
  )

  const getTotalNFTsMintedSoFar = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
    
    let count = await connectedContract.getTotalNFTsMintedSoFar()
    setMintTotal(count._hex.substring(3))
    console.log(count._hex.substring(3))
  }

  return (
    <div className="App">
      {
        miningAnimation ? (
          <Modal />
        ) : null
      }
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">BLOCKCHIAN MINTER</p>
          <a
            className="opensea-button"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <img src={openseaLogo} alt="opensea-logo" className="opensea-logo"/>VERIFY YOUR NFT</a>
          <p className="sub-text">
            ONE NFT MEANS ONE BLOCKCHIAN
          </p>
          <p className="sub-text">
            {mintTotal}SECURE YOUT NFT
            </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>
      </div>
    </div>);
}

export default App;

import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  // walletConnected: checks the user's wallet status
  const [walletConnected, setWalletConneted] = useState(false);

  // joinedWhitelist: checks whether user's addresss has been whitelisted or not
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  // loading: used to wait when transaction is being mined
  const [loading, setLoading] = useState(false);

  // numberOfWhitelisted: tracks total number of whitelisted addresses
  const [numberOfWhitelisted, setNumberOfWhitlisted] = useState(false);

  // reference WEB3Modal to be used for wallet connection
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    // connect wallet
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // notify user of Rinkeby network if not connected
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert(
        "You are on the wrong network, kindly change to Rinkeby network to continue."
      );
      throw new Error("Kindly change your network to Rinkeby.");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const addAddressToWhitelist = async () => {
    try {
      // signer is required
      const signer = await getProviderOrSigner(true);

      // make a new contract instance with signer
      const Whitelist = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);

      // call the addAddressToWhitelist() from the contract
      const tx = await Whitelist.addAddressToWhitelist();
      setLoading(true);

      // waiting for the addAddressToWhitelist() transaction to be mined
      await tx.wait();
      setLoading(false);

      // record the updated number of whitelisted addresses
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (error) {
      console.error(error);
    }
  };

  // getNumberOfWhitelisted: gets the number of all whitelisted addresses
  const getNumberOfWhitelisted = async () => {
    try {
      // get provider from web3Modal
      const provider = await getProviderOrSigner();

      const Whitelist = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider);

      // call numAddressesWhitelisted state variable from the contract
      const _numberOfWhitelisted = await Whitelist.numAddressesWhitelisted();
      setNumberOfWhitlisted(_numberOfWhitelisted);
    } catch (error) {
      console.error(error);
    }
  };

  //checkAddress: checks if user address is in the whitelist
  const checkAddress = async () => {
    try {
      // get signer
      const signer = await getProviderOrSigner(true);
      const Whitelist = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);

      // get signer's (user's) address
      const address = await signer.getAddress();

      // call the mapping name from the contract
      const _joinedWhitelist = await Whitelist.whitelistedAddresses(address);

      setJoinedWhitelist(_joinedWhitelist);
    } catch (error) {
      console.error(error);
    }
  };

  // connectWallet: connects given wallet (MetaMask in this case)
  const connectWallet = async () => {
    try {
      // get provider from web3Moday and prompt for first-time users
      await getProviderOrSigner();
      setWalletConneted(true);

      checkAddress();
      getNumberOfWhitelisted();
    } catch (error) {
      console.error(error);
    }
  };

  // renderButton: shows users the Join Wishlist button based on the state of the DApp
  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            You have succesfully joined the whitelist already! Thanks for using
            my DApp.
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Confirming...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join The Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist DApp</title>
        <meta name="description" content="Whitelist DApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Crypto Devs is an NFT collection for developers in the crypto space.
            It is my first fullstack dapp using Solidity, React and Next.js. I
            hope you like it!
          </div>
          <div className={styles.note}>
            If you came here from my GitHub page, I believed you would have read
            the README.md file already.
            <br/>
            You can skip this section. If not, go here to read it in order to understand how the DApp works: 
            <br/>
            <a href="https://github.com/claudiusayadi/whitelist-dapp/blob/5392aca4fbf568b1e928861176401284ca1da0b3/README.md">https://github.com/claudiusayadi/whitelist-dapp/blob/5392aca4fbf568b1e928861176401284ca1da0b3/</a>
          </div>
          <div className={styles.description}>
            Number of Addresses Whitelisted: {numberOfWhitelisted}
            <br/>
            Maximum Limit: 10 Addresses
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>
      <footer className={styles.footer}>
        Made with ❤️️ by Claudius A.
      </footer>
    </div>
  );
}

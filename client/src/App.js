import React, { useEffect, useCallback, useState } from "react";
import { Row, Col } from "react-bootstrap";

import tokenAbi from "./contracts/RewardToken.json";
import marketAbi from "./contracts/Marketplace.json";

import Header from "./Header";
import Products from "./Products";
import Dashboard from "./Dashboard";

import _ from "lodash";

const Web3 = window.Web3;

function App() {
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(null);
  const [market, setMarket] = useState(null);
  const [products, setProducts] = useState(null);
  const [balance, setBalance] = useState(null);
  const [sales, setSales] = useState(null);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    if (market) {
      const events = await market.getPastEvents("LogProductAdded", {
        fromBlock: 0
      });

      const fetched = events.map(e => e.returnValues.productId);

      let arrayProducts = [];

      for (let i = 0; i < fetched.length; i++) {
        const product = await market.methods.products(fetched[i]).call();
        arrayProducts.push(product);
      }

      setProducts(arrayProducts);
    }
  };

  const getSales = async () => {
    if (market) {
      const events = await market.getPastEvents("LogProductSold", {
        filter: { buyer: account },
        fromBlock: 0
      });

      const fetched = events.map(e => e.returnValues.productId);

      let arrayProducts = [];

      for (let i = 0; i < fetched.length; i++) {
        const amount = await market.methods
          .salesByUser(account, fetched[i])
          .call();

        arrayProducts.push({ productId: fetched[i], amount });
      }

      arrayProducts = _.uniqBy(arrayProducts, p => parseFloat(p.productId));
      arrayProducts = arrayProducts.sort(function(a, b) {
        return a.productId - b.productId;
      });

      setSales(arrayProducts);
    }
  };

  const getTokensEarned = async () => {
    if (token) {
      const tokenBalance = await token.methods.balanceOf(account).call();

      setBalance(window.web3.utils.fromWei(tokenBalance));
    }
  };

  const refreshAll = () => {
    fetchProducts();
    getSales();
    getTokensEarned();
  };

  const connectWeb3 = useCallback(async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      console.log("Using Ethereum enabled browser");
      window.web3 = new Web3(window.ethereum);
      window.web3.eth.transactionConfirmationBlocks = 1; //Hard code number of blocks needed
      let currentNetwork = window.web3.givenProvider.chainId;

      if (currentNetwork === "0x4") currentNetwork = 4;
      else if (currentNetwork === "0x3e7") currentNetwork = 999;
      else return setError(true);

      setError(null);

      const tokenAddress = tokenAbi.networks[currentNetwork].address;
      const tokenContract = new window.web3.eth.Contract(
        tokenAbi.abi,
        tokenAddress
      );
      setToken(tokenContract);

      const marketAddress = marketAbi.networks[currentNetwork].address;
      const marketContract = new window.web3.eth.Contract(
        marketAbi.abi,
        marketAddress
      );
      setMarket(marketContract);

      try {
        await window.ethereum.enable();

        //If accounts change
        window.ethereum.on("accountsChanged", accounts => {
          if (accounts.length > 0) setAccount(accounts[0]);
          else setAccount(null);
        });

        setAccount(window.ethereum.selectedAddress);
      } catch (error) {
        console.error("You must approve this dApp to interact with it");
      }
    }

    // Non-dapp browsers...
    else {
      alert("Please Install Metamask");
    }
  }, []);

  useEffect(() => {
    connectWeb3();
    refreshAll();
    // eslint-disable-next-line
  }, [account, connectWeb3]);

  if (error) return <h1>Please switch to Rinkeby or Ganache</h1>;

  return (
    <>
      <Header account={account} />
      <Row>
        <Col md={7}>
          <Products
            account={account}
            products={products}
            market={market}
            refresh={refreshAll}
          />
        </Col>
        <Col md={5}>
          <Dashboard sales={sales} balance={balance} />
        </Col>
      </Row>
    </>
  );
}

export default App;

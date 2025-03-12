import { motion } from "framer-motion";
import { ChevronDown, X, HeartPulse, ArrowLeftRight } from "lucide-react";
import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { ethers } from "ethers"; // فقط یه بار import شده

// استایل Global برای حذف margin و padding پیش‌فرض
const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  #root {
    width: 100%;
    height: 100%;
  }

  *, *:before, *:after {
    box-sizing: border-box;
  }
`;

// تعریف آدرس با checksum درست
const PARASWAP_PROXY = ethers.getAddress("0x216b4b4ba9f3e719726886d34a1774842785337c");

// ERC-20 ABI
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

// آدرس توکن‌ها در Arbitrum
const tokenAddresses = {
  ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
  ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
  UNI: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
  LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
  WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  GMX: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
};

// تعداد اعشار هر توکن
const tokenDecimals = {
  ETH: 18,
  USDC: 6,
  DAI: 18,
  WBTC: 8,
  ARB: 18,
  UNI: 18,
  LINK: 18,
  WETH: 18,
  GMX: 18,
};

const tokens = Object.keys(tokenAddresses);
const apiUrl = "https://apiv5.paraswap.io";

// استایل‌ها
const AppContainer = styled.div`
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom right, #111827, #312e81, #111827);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HeartIcon = styled(motion.div)`
  color: #10b981;
`;

const ConnectButton = styled(motion.button)`
  background: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 28rem;
  position: relative;
  backdrop-filter: blur(10px);
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Subtitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  text-align: center;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #4b5563;
  background: #1f2937;
  color: white;
  font-size: 1rem;
`;

const TokenButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
`;

const SwapTokensContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const SwapTokensButton = styled(motion.button)`
  background: #10b981;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
`;

const RateInfo = styled.div`
  text-align: center;
  color: white;
  font-size: 0.875rem;
`;

const SwapButton = styled(motion.button)`
  background: #10b981;
  color: white;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
`;

const CardHeartIcon = styled(motion.div)`
  position: absolute;
  bottom: -1rem;
  right: -1rem;
  color: #10b981;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled(motion.div)`
  background: #1f2937;
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 20rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
`;

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
`;

const TokenOption = styled(motion.div)`
  background: #374151;
  color: white;
  padding: 0.5rem;
  border-radius: 0.375rem;
  text-align: center;
  cursor: pointer;
`;

const Notification = styled(motion.div)`
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
`;

const Footer = styled.footer`
  padding: 1rem;
  text-align: center;
`;

const FooterText = styled.p`
  color: white;
  font-size: 0.875rem;
`;

const FooterLink = styled.a`
  color: #10b981;
  text-decoration: none;
`;

function Particle() {
  return <div />;
}

function ParticleBottom() {
  return <div />;
}

async function switchToArbitrum(ethereum) {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xa4b1" }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xa4b1",
            chainName: "Arbitrum One",
            rpcUrls: ["https://arb1.arbitrum.io/rpc"],
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            blockExplorerUrls: ["https://arbiscan.io/"],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

function Swap() {
  let abortController = new AbortController();

  const [tokenFrom, setTokenFrom] = useState("ETH");
  const [tokenTo, setTokenTo] = useState("USDC");
  const [amountFrom, setAmountFrom] = useState("2");
  const [amountTo, setAmountTo] = useState("");
  const [bestDex, setBestDex] = useState("Fetching...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectingFrom, setIsSelectingFrom] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [priceRoute, setPriceRoute] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [customTokens, setCustomTokens] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    if (amountFrom && tokenFrom && tokenTo && tokenFrom !== tokenTo) {
      fetchBestRate();
    }
  }, [amountFrom, tokenFrom, tokenTo]);

  const fetchBestRate = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/prices?srcToken=${tokenAddresses[tokenFrom]}&destToken=${
          tokenAddresses[tokenTo]
        }&amount=${ethers
          .parseUnits(amountFrom, tokenDecimals[tokenFrom])
          .toString()}&srcDecimals=${tokenDecimals[tokenFrom]}&destDecimals=${
          tokenDecimals[tokenTo]
        }&side=SELL&network=42161`
      );

      if (!response.ok) {
        const errorText = await response.text();
        const parsedError = JSON.parse(errorText);

        if (parsedError.error === "ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT") {
          alert(`⚠️ Price impact too high! Reduce the amount.`);
          setAmountTo("0.000000");
          setBestDex("Price Impact Too High");
          return;
        }

        throw new Error(
          `API responded with status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      if (data.priceRoute) {
        setPriceRoute(data.priceRoute); // ذخیره priceRoute برای استفاده در تراکنش
        setAmountTo(
          ethers.formatUnits(data.priceRoute.destAmount, tokenDecimals[tokenTo])
        );
        setBestDex(
          data.priceRoute.bestRoute[0]?.swaps[0]?.swapExchanges[0]?.exchange ||
            "ParaSwap"
        );
      } else {
        setAmountTo("0.000000");
        setBestDex("No route found");
      }
    } catch (error) {
      console.error("Error fetching rate:", error);
      alert(`Error fetching rate: ${error.message}`);
      setAmountTo("Error");
      setBestDex("Error");
    }
  };

  const checkAndApproveToken = async () => {
    const srcTokenAddress = tokenAddresses[tokenFrom];
    if (
      !srcTokenAddress ||
      srcTokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    )
      return true;

    const tokenContract = new ethers.Contract(
      srcTokenAddress,
      ERC20_ABI,
      signer
    );
    const amount = ethers.parseUnits(amountFrom, tokenDecimals[tokenFrom]);
    const allowance = await tokenContract.allowance(address, PARASWAP_PROXY);

    if (allowance.lt(amount)) {
      try {
        const tx = await tokenContract.approve(PARASWAP_PROXY, amount);
        await tx.wait();
        return true;
      } catch (error) {
        console.error("Approval failed:", error);
        setErrorMessage(`Token approval failed: ${error.message}`);
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 5000);
        throw error;
      }
    }
    return true;
  };

  const buildTransaction = async () => {
    if (!priceRoute || !isConnected) {
      throw new Error(
        "Cannot build transaction: priceRoute or wallet connection missing"
      );
    }

    try {
      const srcToken = tokenAddresses[tokenFrom];
      const destToken = tokenAddresses[tokenTo];

      const txData = {
        srcToken,
        destToken,
        srcAmount: ethers
          .parseUnits(amountFrom, tokenDecimals[tokenFrom])
          .toString(),
        destAmount: priceRoute.destAmount.toString(),
        priceRoute,
        userAddress: address,
      };

      const response = await fetch(`${apiUrl}/transactions/42161`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          `Transaction build failed with status ${response.status}: ${
            responseData.error || "Unknown error"
          }`
        );
      }

      return responseData;
    } catch (error) {
      console.error("Error building transaction:", error);
      setErrorMessage(`Transaction failed: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 5000);
      throw error;
    }
  };

  const handleSwap = async () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first!");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 5000);
      return;
    }

    setIsSwapping(true);
    try {
      await checkAndApproveToken();
      const txParams = await buildTransaction();

      if (!txParams || txParams.error) {
        throw new Error(
          `Transaction build failed: ${txParams?.error || "Unknown error"}`
        );
      }

      const txValue = txParams.value
        ? ethers.getBigInt(txParams.value.toString())
        : 0n;
      const tx = await signer.sendTransaction({
        to: txParams.to,
        data: txParams.data,
        value: txValue,
        gasLimit: ethers.toBeHex(300000),
      });

      await tx.wait();
      alert(`Swap successful! Tx Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Swap error:", error);
      setErrorMessage(`Swap failed: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 5000);
    } finally {
      setIsSwapping(false);
    }
  };

  const openModal = (isFrom) => {
    setIsSelectingFrom(isFrom);
    setIsModalOpen(true);
  };

  const selectToken = (token) => {
    if (isSelectingFrom) {
      setTokenFrom(token);
    } else {
      setTokenTo(token);
    }
    setIsModalOpen(false);
  };

  const handleConnect = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();

        if (network.chainId !== 42161n) {
          await switchToArbitrum(window.ethereum);
        }

        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAddress(userAddress);
        setIsConnected(true);
      } else {
        setErrorMessage("MetaMask is not installed!");
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 5000);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setErrorMessage(`Failed to connect wallet: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 5000);
    }
  };

  const disconnectWallet = () => {
    setAddress("");
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
  };

  const searchToken = async () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first!");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 5000);
      return;
    }

    if (ethers.isAddress(customTokenAddress)) {
      try {
        const network = await provider.getNetwork();
        if (network.chainId !== 42161n) {
          setErrorMessage(
            "Connected to wrong network. Please switch to Arbitrum (chain ID 42161)."
          );
          setIsNotificationVisible(true);
          setTimeout(() => setIsNotificationVisible(false), 5000);
          await switchToArbitrum(provider);
          return;
        }

        const contract = new ethers.Contract(
          customTokenAddress,
          ERC20_ABI,
          provider
        );
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        const newCustomToken = {
          symbol,
          address: customTokenAddress,
          decimals,
        };
        setCustomTokens((prev) =>
          [...prev, newCustomToken].filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.address === item.address)
          )
        );
        setTokenFrom(symbol);
      } catch (error) {
        console.error("Error fetching token:", error);
        setErrorMessage(`Failed to fetch token: ${error.message}`);
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 5000);
      }
    } else {
      setErrorMessage("Invalid contract address");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 5000);
    }
  };

  const swapTokens = () => {
    setTokenFrom(tokenTo);
    setTokenTo(tokenFrom);
    setAmountFrom("");
    setAmountTo("");
    setBestDex("Fetching...");
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <Particle />
          <ParticleBottom />
        </div>

        <Header>
          <HeaderTitle>
            <HeartIcon
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <HeartPulse size={20} />
            </HeartIcon>
            <h1
              style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}
            >
              TradePulse Swap
            </h1>
          </HeaderTitle>
          <ConnectButton
            onClick={isConnected ? disconnectWallet : handleConnect}
            whileHover={{ scale: 1.05 }}
          >
            {isConnected
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "Connect Wallet"}
          </ConnectButton>
        </Header>

        <MainContent>
          <Card>
            <CardContent>
              <Subtitle>Swap Tokens Seamlessly</Subtitle>
              <div>
                <InputContainer>
                  <Input
                    type="number"
                    placeholder="Amount to sell"
                    value={amountFrom}
                    onChange={(e) => setAmountFrom(e.target.value)}
                  />
                  <TokenButton onClick={() => openModal(true)}>
                    <span>{tokenFrom}</span>
                    <ChevronDown size={16} />
                  </TokenButton>
                </InputContainer>

                <SwapTokensContainer>
                  <SwapTokensButton
                    onClick={swapTokens}
                    whileHover={{ scale: 1.05 }}
                  >
                    <ArrowLeftRight size={24} />
                  </SwapTokensButton>
                </SwapTokensContainer>

                <InputContainer>
                  <Input
                    type="number"
                    placeholder="Amount to buy"
                    value={amountTo}
                    readOnly
                  />
                  <TokenButton onClick={() => openModal(false)}>
                    <span>{tokenTo}</span>
                    <ChevronDown size={16} />
                  </TokenButton>
                </InputContainer>

                {isConnected && (
                  <InputContainer>
                    <Input
                      type="text"
                      value={customTokenAddress}
                      onChange={(e) => setCustomTokenAddress(e.target.value)}
                      placeholder="Search token by contract address"
                    />
                    <button onClick={searchToken}>Search</button>
                  </InputContainer>
                )}

                <RateInfo>
                  Best Rate from:{" "}
                  <span style={{ fontWeight: "600" }}>{bestDex}</span>
                </RateInfo>

                <SwapButton
                  onClick={handleSwap}
                  disabled={isSwapping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSwapping
                    ? "Swapping..."
                    : `Swap ${tokenFrom} to ${tokenTo}`}
                </SwapButton>
              </div>
            </CardContent>
            <CardHeartIcon
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <HeartPulse size={20} />
            </CardHeartIcon>
          </Card>
        </MainContent>

        {isModalOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContent
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <ModalHeader>
                <ModalTitle>Select Token</ModalTitle>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ color: "white" }}
                >
                  <X size={24} />
                </button>
              </ModalHeader>
              <TokenGrid>
                {tokens.map((token) => (
                  <TokenOption
                    key={token}
                    onClick={() => selectToken(token)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {token}
                  </TokenOption>
                ))}
                {customTokens.map((token) => (
                  <TokenOption
                    key={token.address}
                    onClick={() => selectToken(token.symbol)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {token.symbol}
                  </TokenOption>
                ))}
              </TokenGrid>
            </ModalContent>
          </ModalOverlay>
        )}

        {isNotificationVisible && (
          <Notification
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            {errorMessage}
            <CloseButton onClick={() => setIsNotificationVisible(false)}>
              <X size={18} />
            </CloseButton>
          </Notification>
        )}

        <Footer>
          <FooterText>
            Powered by TradePulse | Built on Arbitrum |{" "}
            <FooterLink href="#">Learn More</FooterLink>
          </FooterText>
        </Footer>
      </AppContainer>
    </>
  );
}

export default Swap;

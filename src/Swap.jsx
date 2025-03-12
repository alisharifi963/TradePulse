import { motion } from "framer-motion";
import { ChevronDown, X, HeartPulse, ArrowLeftRight, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { ethers } from "ethers";

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
const PARASWAP_PROXY = ethers.getAddress("0x216b4b4ba9f3e719726886d34a177484278bfcae");

// ERC-20 ABI
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
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
  USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
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
  USDT: 6,
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

const Particle = styled.div`
  position: absolute;
  width: 24rem;
  height: 24rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  filter: blur(6rem);
  top: 2.5rem;
  left: 2.5rem;
  animation: pulse 8s infinite;
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const ParticleBottom = styled(Particle)`
  background: rgba(147, 51, 234, 0.1);
  top: auto;
  bottom: 2.5rem;
  left: auto;
  right: 2.5rem;
`;

const Header = styled.header`
  width: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(31, 41, 55, 0.5);
  backdrop-filter: blur(10px);
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeartIcon = styled(motion.div)`
  color: #3b82f6;
`;

const ConnectButton = styled(motion.button)`
  background: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  margin-left: 1rem;
  margin-right: 1.5rem;
  &:hover { background: #059669; }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 28rem;
  padding: 1.5rem;
  color: white;
  position: relative;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const Subtitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.5rem;
  color: white;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background: rgba(55, 65, 81, 0.5);
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(75, 85, 99, 0.5);
  margin-bottom: 0.5rem;
`;

const UsdEquivalent = styled.p`
  text-align: right;
  font-size: 0.875rem;
  color: #3b82f6;
  margin: 0 1rem 1rem 0;
`;

const Input = styled.input`
  background: transparent;
  color: white;
  width: 66.67%;
  outline: none;
  border: none;
  font-size: 1.125rem;
`;

const TokenButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
`;

const TokenButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background 0.3s;
  &:hover { background: #4338ca; }
`;

const BalanceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #a1a1aa;
  font-size: 0.875rem;
  cursor: pointer;
  &:hover { color: #3b82f6; }
`;

const SwapTokensContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0;
`;

const SwapTokensButton = styled(motion.button)`
  background: #10b981;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover { background: #059669; }
`;

const RateInfo = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #3b82f6;
  margin-bottom: 1rem;
`;

const SwapButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  background: linear-gradient(to right, #10b981, #14b8a6);
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background 0.3s;
  &:hover { background: linear-gradient(to right, #059669, #0d9488); }
  &:disabled { background: #6b7280; cursor: not-allowed; }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
`;

const ModalContent = styled(motion.div)`
  background: rgba(31, 41, 55, 0.9);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 1rem;
  width: 20rem;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
`;

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
`;

const TokenOption = styled(motion.button)`
  padding: 0.75rem;
  background: #4f46e5;
  color: white;
  border-radius: 0.5rem;
  transition: background 0.3s;
  font-weight: 500;
  &:hover { background: #4338ca; }
`;

const Footer = styled.footer`
  width: 100%;
  padding: 1rem 1.5rem;
  background: rgba(31, 41, 55, 0.5);
  backdrop-filter: blur(10px);
  text-align: center;
`;

const FooterText = styled.p`
  font-size: 0.875rem;
  color: #9ca3af;
`;

const FooterLink = styled.a`
  color: #3b82f6;
  &:hover { text-decoration: underline; }
`;

const Notification = styled(motion.div)`
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { top: -5rem; }
    to { top: 1rem; }
  }
`;

const CloseButton = styled.button`
  background: none;
  color: white;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  margin-left: 1rem;
`;

const switchToArbitrum = async (provider) => {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xa4b1" }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xa4b1",
            chainName: "Arbitrum One",
            rpcUrls: ["https://arb1.arbitrum.io/rpc"],
            nativeCurrency: { symbol: "ETH", decimals: 18 },
            blockExplorerUrls: ["https://arbiscan.io"],
          },
        ],
      });
    } else {
      throw error;
    }
  }
};

// تابع برای ایجاد تأخیر
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function Swap() {
  let abortController = new AbortController();

  const [tokenFrom, setTokenFrom] = useState("ETH"); // تغییر از LINK به ETH
  const [tokenTo, setTokenTo] = useState("USDC"); // تغییر از ETH به USDC
  const [amountFrom, setAmountFrom] = useState("0.01");
  const [amountTo, setAmountTo] = useState("");
  const [bestDex, setBestDex] = useState("Fetching...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectingFrom, setIsSelectingFrom] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [priceRoute, setPriceRoute] = useState(null);
  const [isPriceRouteReady, setIsPriceRouteReady] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [customTokens, setCustomTokens] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [usdEquivalent, setUsdEquivalent] = useState("");
  const [tokenFromBalance, setTokenFromBalance] = useState("0");
  const [tokenToBalance, setTokenToBalance] = useState("0");

  // تابع برای گرفتن موجودی توکن‌ها
  const fetchTokenBalance = async (tokenSymbol, userAddress) => {
    if (!userAddress || !provider) return "0";
    try {
      const tokenAddress = tokenAddresses[tokenSymbol];
      let balance;
      if (tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        // برای ETH
        balance = await provider.getBalance(userAddress);
      } else {
        // برای توکن‌های ERC-20
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        balance = await tokenContract.balanceOf(userAddress);
      }
      return ethers.formatUnits(balance, tokenDecimals[tokenSymbol]);
    } catch (error) {
      console.error(`Error fetching balance for ${tokenSymbol}:`, error);
      return "0";
    }
  };

  // به‌روزرسانی موجودی‌ها موقع اتصال والت یا تغییر توکن
  useEffect(() => {
    const updateBalances = async () => {
      if (isConnected && address && provider) {
        const fromBalance = await fetchTokenBalance(tokenFrom, address);
        const toBalance = await fetchTokenBalance(tokenTo, address);
        setTokenFromBalance(fromBalance);
        setTokenToBalance(toBalance);
      }
    };
    updateBalances();
  }, [isConnected, address, provider, tokenFrom, tokenTo]);

  useEffect(() => {
    if (amountFrom && Number(amountFrom) > 0 && tokenFrom && tokenTo && tokenFrom !== tokenTo) {
      fetchBestRate();
    } else if (amountFrom && Number(amountFrom) <= 0) {
      setAmountTo("");
      setBestDex("Enter a valid amount greater than 0");
      setPriceRoute(null);
      setIsPriceRouteReady(false);
      setUsdEquivalent("");
    }
  }, [amountFrom, tokenFrom, tokenTo]);

  const fetchBestRate = async () => {
    try {
      setIsPriceRouteReady(false);
      const amount = ethers.parseUnits(amountFrom || "0", tokenDecimals[tokenFrom]).toString();
      if (Number(amountFrom) <= 0) {
        setAmountTo("");
        setBestDex("Enter a valid amount greater than 0");
        setPriceRoute(null);
        setUsdEquivalent("");
        return;
      }

      const response = await fetch(
        `${apiUrl}/prices?srcToken=${tokenAddresses[tokenFrom]}&destToken=${
          tokenAddresses[tokenTo]
        }&amount=${amount}&srcDecimals=${tokenDecimals[tokenFrom]}&destDecimals=${
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
          setPriceRoute(null);
          setUsdEquivalent("");
          return;
        }

        throw new Error(`API responded with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.priceRoute) {
        setPriceRoute(data.priceRoute);
        setAmountTo(ethers.formatUnits(data.priceRoute.destAmount, tokenDecimals[tokenTo]));
        setBestDex(
          data.priceRoute.bestRoute[0]?.swaps[0]?.swapExchanges[0]?.exchange || "ParaSwap"
        );
        setIsPriceRouteReady(true);

        // محاسبه معادل دلاری
        const srcAmountInWei = ethers.parseUnits(amountFrom, tokenDecimals[tokenFrom]);
        const usdPrice = data.priceRoute.srcUSD;
        if (usdPrice) {
          const usdValue = (Number(ethers.formatUnits(srcAmountInWei, tokenDecimals[tokenFrom])) * usdPrice).toFixed(2);
          setUsdEquivalent(`≈ $${usdValue} USD`);
        } else {
          setUsdEquivalent("Price not available");
        }
      } else {
        setAmountTo("0.000000");
        setBestDex("No route found");
        setPriceRoute(null);
        setUsdEquivalent("");
      }
    } catch (error) {
      console.error("Error fetching rate:", error);
      setAmountTo("");
      setBestDex("Error fetching rate");
      setPriceRoute(null);
      setUsdEquivalent("");
      alert(`Error fetching rate: ${error.message}`);
    }
  };

  const checkAndApproveToken = async () => {
    const srcTokenAddress = tokenAddresses[tokenFrom];
    if (!srcTokenAddress || srcTokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      console.log("No approval needed for native token (ETH).");
      return true;
    }

    try {
      const tokenContract = new ethers.Contract(srcTokenAddress, ERC20_ABI, signer);
      const amountBN = ethers.parseUnits(amountFrom, tokenDecimals[tokenFrom]);

      const network = await provider.getNetwork();
      if (network.chainId !== 42161n) {
        console.log("Switching to Arbitrum network...");
        await switchToArbitrum(window.ethereum);
      }

      // چک کردن مقدار فعلی allowance
      let allowance = await tokenContract.allowance(address, PARASWAP_PROXY);
      let allowanceBN = ethers.toBigInt(allowance.toString());

      console.log("Initial Allowance:", allowanceBN.toString(), "Amount needed:", amountBN.toString());

      if (allowanceBN < amountBN) {
        console.log("Insufficient allowance, approving max amount...");
        const tx = await tokenContract.approve(PARASWAP_PROXY, ethers.MaxUint256);
        console.log("Approval transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Approval confirmed on-chain:", receipt.transactionHash);

        // تأخیر 10 ثانیه‌ای برای اطمینان از به‌روزرسانی بلاک‌چین
        console.log("Waiting for blockchain to update allowance...");
        await delay(10000);

        // چک کردن دوباره allowance بعد از تأخیر
        allowance = await tokenContract.allowance(address, PARASWAP_PROXY);
        allowanceBN = ethers.toBigInt(allowance.toString());
        console.log("Updated Allowance after approval:", allowanceBN.toString());

        if (allowanceBN < amountBN) {
          throw new Error("Allowance still insufficient after approval!");
        }
      } else {
        console.log("Sufficient allowance, no approval needed.");
      }
      return true;
    } catch (error) {
      console.error("Approval failed:", error);
      setErrorMessage(`Token approval failed: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 5000);
      throw error;
    }
  };

  const buildTransaction = async () => {
    if (!priceRoute || !isConnected) {
      throw new Error("Cannot build transaction: priceRoute or wallet connection missing");
    }

    try {
      const srcToken = tokenAddresses[tokenFrom];
      const destToken = tokenAddresses[tokenTo];

      const srcAmount = ethers.parseUnits(amountFrom, tokenDecimals[tokenFrom]).toString();
      const txData = {
        srcToken,
        destToken,
        srcAmount,
        destAmount: priceRoute.destAmount.toString(),
        priceRoute,
        userAddress: address,
      };

      console.log("Building transaction with data:", txData);

      const response = await fetch(`${apiUrl}/transactions/42161`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Transaction build failed:", responseData);
        throw new Error(
          `Transaction build failed with status ${response.status}: ${
            responseData.error || "Unknown error"
          }`
        );
      }

      if (!responseData.to || !responseData.data) {
        console.error("Invalid transaction data:", responseData);
        throw new Error("Invalid transaction data from API");
      }

      console.log("Transaction data received:", responseData);
      return responseData;
    } catch (error) {
      console.error("Error building transaction:", error);
      setErrorMessage(`Transaction build failed: ${error.message}`);
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

    if (!amountFrom || Number(amountFrom) <= 0) {
      setErrorMessage("Please enter a valid amount to swap!");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 5000);
      return;
    }

    if (!isPriceRouteReady) {
      setErrorMessage("Price route not ready. Please wait or try again.");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 5000);
      return;
    }

    setIsSwapping(true);
    try {
      const network = await provider.getNetwork();
      if (network.chainId !== 42161n) {
        console.log("Switching to Arbitrum network...");
        await switchToArbitrum(window.ethereum);
      }

      console.log("Starting token approval...");
      const approvalSuccess = await checkAndApproveToken();
      if (!approvalSuccess) {
        throw new Error("Token approval did not complete successfully.");
      }
      console.log("Token approval completed successfully.");

      console.log("Refreshing price route before building transaction...");
      await fetchBestRate();
      if (!isPriceRouteReady) {
        throw new Error("Failed to refresh price route. Please try again.");
      }

      console.log("Building swap transaction...");
      const txParams = await buildTransaction();
      console.log("Transaction parameters:", txParams);

      if (!txParams || !txParams.to || !txParams.data) {
        throw new Error("Invalid transaction parameters");
      }

      const txValue = txParams.value
        ? ethers.getBigInt(txParams.value.toString())
        : 0n;
      const gasLimit = txParams.gas ? ethers.getBigInt(txParams.gas) : 500000n;

      console.log("Sending swap transaction...");
      const tx = await signer.sendTransaction({
        to: txParams.to,
        data: txParams.data,
        value: txValue,
        gasLimit,
      });

      console.log("Swap transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Swap transaction confirmed on-chain:", receipt.transactionHash);

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
    setTokenFromBalance("0");
    setTokenToBalance("0");
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
    setUsdEquivalent("");
  };

  // تنظیم مقدار amountFrom به کل موجودی
  const setMaxAmountFrom = () => {
    if (tokenFromBalance && Number(tokenFromBalance) > 0) {
      setAmountFrom(tokenFromBalance);
    }
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
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}>
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
                    onChange={(e) => setAmountFrom(e.target.value || "")}
                    min="0.01"
                  />
                  <TokenButtonContainer>
                    <TokenButton onClick={() => openModal(true)}>
                      <span>{tokenFrom}</span>
                      <ChevronDown size={16} />
                    </TokenButton>
                    {isConnected && (
                      <BalanceContainer onClick={setMaxAmountFrom}>
                        <Wallet size={14} />
                        <span>{parseFloat(tokenFromBalance).toFixed(4)}</span>
                      </BalanceContainer>
                    )}
                  </TokenButtonContainer>
                </InputContainer>
                <UsdEquivalent>{usdEquivalent}</UsdEquivalent>

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
                  <TokenButtonContainer>
                    <TokenButton onClick={() => openModal(false)}>
                      <span>{tokenTo}</span>
                      <ChevronDown size={16} />
                    </TokenButton>
                    {isConnected && (
                      <BalanceContainer>
                        <Wallet size={14} />
                        <span>{parseFloat(tokenToBalance).toFixed(4)}</span>
                      </BalanceContainer>
                    )}
                  </TokenButtonContainer>
                </InputContainer>
                <UsdEquivalent>{/* معادل دلاری برای tokenTo می‌تونی بعداً اضافه کنی */}</UsdEquivalent>

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
                  Best Rate from: <span style={{ fontWeight: "600" }}>{bestDex}</span>
                </RateInfo>

                <SwapButton
                  onClick={handleSwap}
                  disabled={isSwapping || !amountFrom || Number(amountFrom) <= 0 || !isPriceRouteReady}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSwapping
                    ? "Swapping..."
                    : `Swap ${tokenFrom} to ${tokenTo}`}
                </SwapButton>
              </div>
            </CardContent>
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

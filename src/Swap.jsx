import { motion } from "framer-motion";
import { ChevronDown, X, HeartPulse, ArrowLeftRight, Wallet, CheckCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { ethers } from "ethers";

// استایل سراسری
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
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
`;

// اطلاعات شبکه‌ها
const networks = {
  arbitrum: {
    chainId: "0xa4b1",
    name: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
    networkId: 42161,
  },
  base: {
    chainId: "0x2105",
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
    networkId: 8453,
  },
  ethereum: {
    chainId: "0x1",
    name: "Ethereum Mainnet",
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    explorerUrl: "https://etherscan.io",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
    networkId: 1,
  },
  bnb: {
    chainId: "0x38",
    name: "Binance Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    explorerUrl: "https://bscscan.com",
    nativeCurrency: { symbol: "BNB", decimals: 18 },
    networkId: 56,
  },
};

// آدرس‌های توکن‌ها
const tokenAddresses = {
  arbitrum: {
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    UNI: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    GMX: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  },
  base: {
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    WETH: "0x4200000000000000000000000000000000000006",
    DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  },
  ethereum: {
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  bnb: {
    BNB: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    BTCB: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  },
};

// اعشار توکن‌ها
const tokenDecimals = {
  arbitrum: {
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
  },
  base: {
    ETH: 18,
    USDC: 6,
    WETH: 18,
    DAI: 18,
  },
  ethereum: {
    ETH: 18,
    USDC: 6,
    DAI: 18,
    WBTC: 8,
    UNI: 18,
    LINK: 18,
    WETH: 18,
    USDT: 6,
  },
  bnb: {
    BNB: 18,
    USDT: 18,
    BUSD: 18,
    CAKE: 18,
    WBNB: 18,
    ETH: 18,
    BTCB: 18,
  },
};

// آدرس پراکسی ParaSwap
const PARASWAP_PROXY = ethers.getAddress("0x216b4b4ba9f3e719726886d34a177484278bfcae");

// ABI توکن ERC20
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

// URL پایه ParaSwap
const API_VERSION = "6.2";
const apiUrl = "https://api.paraswap.io";

// تابع برای گرفتن لیست توکن‌های پشتیبانی‌شده
const getSupportedTokens = async (networkId) => {
  try {
    const response = await fetch(`${apiUrl}/tokens/${networkId}`);
    if (!response.ok) throw new Error(`Failed to fetch tokens: ${response.status}`);
    const data = await response.json();
    return data.tokens;
  } catch (error) {
    console.error("Error fetching supported tokens:", error);
    return [];
  }
};

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
  position: relative;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BetaTag = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
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
  &:hover { background: #059669; }
`;

const NetworkSelector = styled.div`
  position: relative;
  display: inline-block;
`;

const NetworkButton = styled.button`
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  padding: 0.3rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
`;

const NetworkDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(31, 41, 55, 0.9);
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-top: 0.25rem;
  z-index: 10;
`;

const NetworkOption = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  &:hover { background: rgba(59, 130, 246, 0.2); }
`;

const WalletContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1.5rem;
`;

const TrustSticker = styled.div`
  position: absolute;
  top: 5rem;
  left: 2rem;
  background: #f0e4d7;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  transform: rotate(-7deg);
  z-index: 10;
  clip-path: polygon(
    0% 0%, 5% 2%, 10% 0%, 15% 3%, 20% 1%, 25% 4%, 30% 2%, 35% 0%, 40% 3%, 45% 1%,
    50% 4%, 55% 2%, 60% 0%, 65% 3%, 70% 1%, 75% 4%, 80% 2%, 85% 0%, 90% 3%, 95% 1%,
    100% 0%, 100% 100%, 95% 98%, 90% 100%, 85% 97%, 80% 99%, 75% 96%, 70% 98%,
    65% 100%, 60% 97%, 55% 99%, 50% 96%, 45% 98%, 40% 100%, 35% 97%, 30% 99%,
    25% 96%, 20% 98%, 15% 100%, 10% 97%, 5% 99%, 0% 100%
  );
`;

const TrustText = styled.p`
  font-family: 'Caveat', cursive;
  font-size: 1.25rem;
  color: #374151;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
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
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(75, 85, 99, 0.5);
  margin-bottom: 0.5rem;
  height: 4rem;
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
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
`;

const TokenButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid #6366f1;
  width: 5rem;
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

const MaxButton = styled.button`
  background: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  width: fit-content;
  &:hover { background: #059669; }
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

const AnimationOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const SwapAnimation = ({ isSwapping, hasError }) => {
  const heartVariants = {
    initial: { scale: 1 },
    animate: hasError ? { scale: 1 } : { scale: [1, 1.2, 1], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } },
  };

  return isSwapping ? (
    <AnimationOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <motion.div
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(to right, #10b981, #3b82f6)",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          variants={heartVariants}
          initial="initial"
          animate="animate"
        >
          <HeartPulse size={40} color="white" />
        </motion.div>
        <motion.p style={{ color: "white", marginTop: "1rem", fontSize: "1rem", textShadow: "0 0 5px rgba(0, 0, 0, 0.5)" }}>
          Swapping in progress...
        </motion.p>
      </motion.div>
    </AnimationOverlay>
  ) : null;
};

const SwapNotification = ({ message, isSuccess, onClose }) => {
  const background = isSuccess ? "linear-gradient(to right, #10b981, #3b82f6)" : "linear-gradient(to right, #ef4444, #b91c1c)";

  return (
    <motion.div
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 101 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        style={{ background, color: "white", padding: "1rem 2rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", maxWidth: "400px", textAlign: "center", wordBreak: "break-word" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isSuccess ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{message}</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: "rgba(255, 255, 255, 0.2)", color: "white", border: "none", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", cursor: "pointer", marginTop: "0.5rem" }}
        >
          OK
        </button>
      </motion.div>
    </motion.div>
  );
};

// تابع تغییر شبکه
const switchNetwork = async (networkKey, provider) => {
  const network = networks[networkKey];
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: network.chainId }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: network.chainId,
          chainName: network.name,
          rpcUrls: [network.rpcUrl],
          nativeCurrency: network.nativeCurrency,
          blockExplorerUrls: [network.explorerUrl],
        }],
      });
    } else {
      throw error;
    }
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function Swap() {
  const abortController = new AbortController();

  const [tokenFrom, setTokenFrom] = useState("USDC");
  const [tokenTo, setTokenTo] = useState("ETH");
  const [amountFrom, setAmountFrom] = useState("5");
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
  const [gasEstimate, setGasEstimate] = useState(null);
  const [swapNotification, setSwapNotification] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState("arbitrum");
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [supportedTokens, setSupportedTokens] = useState([]);

  // گرفتن لیست توکن‌های پشتیبانی‌شده
  useEffect(() => {
    const loadSupportedTokens = async () => {
      const tokens = await getSupportedTokens(networks[currentNetwork].networkId);
      setSupportedTokens(tokens);
      console.log("Supported tokens:", tokens);
    };
    loadSupportedTokens();
  }, [currentNetwork]);

  const fetchTokenBalance = async (tokenSymbol, userAddress) => {
    if (!userAddress || !provider) return "0";
    try {
      const tokenAddress = tokenAddresses[currentNetwork][tokenSymbol];
      let balance;
      if (tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        balance = await provider.getBalance(userAddress);
      } else {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        balance = await tokenContract.balanceOf(userAddress);
      }
      return ethers.formatUnits(balance, tokenDecimals[currentNetwork][tokenSymbol]);
    } catch (error) {
      console.error(`Error fetching balance for ${tokenSymbol}:`, error);
      return "0";
    }
  };

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
  }, [isConnected, address, provider, tokenFrom, tokenTo, currentNetwork]);

  useEffect(() => {
    if (isConnected && address && amountFrom && Number(amountFrom) > 0 && tokenFrom && tokenTo && tokenFrom !== tokenTo) {
      fetchBestRate();
    } else if (amountFrom && Number(amountFrom) <= 0) {
      setAmountTo("");
      setBestDex("Enter a valid amount greater than 0");
      setPriceRoute(null);
      setIsPriceRouteReady(false);
      setUsdEquivalent("");
    }
  }, [isConnected, address, amountFrom, tokenFrom, tokenTo, currentNetwork]);

  const fetchBestRate = async () => {
    try {
      if (!isConnected || !address) {
        setAmountTo("");
        setBestDex("Please connect your wallet");
        setPriceRoute(null);
        setUsdEquivalent("");
        setSwapNotification({ message: "Please connect your wallet to fetch rates.", isSuccess: false });
        setTimeout(() => setSwapNotification(null), 3000);
        return;
      }

      setIsPriceRouteReady(false);
      const amountFromInWei = ethers.parseUnits(amountFrom || "0", tokenDecimals[currentNetwork][tokenFrom]);
      if (Number(amountFrom) <= 0) {
        setAmountTo("");
        setBestDex("Enter a valid amount greater than 0");
        setPriceRoute(null);
        setUsdEquivalent("");
        return;
      }

      const url = `${apiUrl}/v${API_VERSION}/prices?` + new URLSearchParams({
        srcToken: tokenAddresses[currentNetwork][tokenFrom],
        destToken: tokenAddresses[currentNetwork][tokenTo],
        amount: amountFromInWei.toString(),
        side: "SELL",
        network: networks[currentNetwork].networkId.toString(),
        userAddress: address,
      });

      console.log("Fetching price data from URL:", url);

      const response = await fetch(url, { signal: abortController.signal });

      if (!response.ok) {
        const errorText = await response.text();
        const parsedError = JSON.parse(errorText);
        if (parsedError.error === "ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT") {
          setAmountTo("0.000000");
          setBestDex("Price Impact Too High");
          setPriceRoute(null);
          setUsdEquivalent("");
          setSwapNotification({ message: "Price impact too high! Reduce the amount.", isSuccess: false });
          setTimeout(() => setSwapNotification(null), 3000);
          return;
        }
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.priceRoute) {
        setPriceRoute(data.priceRoute);
        const rawDestAmount = data.priceRoute.destAmount;
        const formattedAmountTo = ethers.formatUnits(rawDestAmount, tokenDecimals[currentNetwork][tokenTo]);
        setAmountTo(formattedAmountTo);
        setBestDex(data.priceRoute.bestRoute[0]?.swaps[0]?.swapExchanges[0]?.exchange || "ParaSwap");
        setIsPriceRouteReady(true);

        let usdValue;
        if (tokenFrom === "USDC" || tokenFrom === "USDT" || tokenFrom === "BUSD") {
          usdValue = Number(amountFrom).toFixed(2);
        } else {
          const srcUSD = data.priceRoute.srcUSD || 1;
          const srcAmount = Number(ethers.formatUnits(amountFromInWei, tokenDecimals[currentNetwork][tokenFrom]));
          usdValue = (srcAmount * srcUSD).toFixed(2);
        }
        setUsdEquivalent(`≈ $${usdValue} USD`);
      } else {
        setAmountTo("0.000000");
        setBestDex("No route found");
        setPriceRoute(null);
        setUsdEquivalent("N/A");
      }
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Error fetching rate:", error);
      setAmountTo("");
      setBestDex("Error fetching rate");
      setPriceRoute(null);
      setUsdEquivalent("N/A");
      setSwapNotification({ message: `Error fetching rate: ${error.message}`, isSuccess: false });
      setTimeout(() => setSwapNotification(null), 3000);
    }
  };

  const estimateGas = async () => {
    if (signer && priceRoute) {
      try {
        const txParams = await buildTransaction();
        const gas = await signer.estimateGas({
          to: txParams.to,
          data: txParams.data,
          value: txParams.value ? ethers.getBigInt(txParams.value.toString()) : 0n,
          gasLimit: txParams.gas ? ethers.getBigInt(txParams.gas) : 3000000n,
        });

        const gasInWei = ethers.toBigInt(gas.toString());
        const gasInEth = ethers.formatEther(gasInWei);
        const gasInGwei = ethers.formatUnits(gasInWei, "gwei");

        const ethPriceResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const ethPriceData = await ethPriceResponse.json();
        const ethPriceInUSD = ethPriceData.ethereum.usd || 1000;
        const gasCostInUSD = (Number(gasInEth) * ethPriceInUSD).toFixed(2);

        setGasEstimate({ gwei: gasInGwei, usd: gasCostInUSD });
      } catch (error) {
        console.error("Error estimating gas:", error);
        setGasEstimate({ gwei: "Unable to estimate", usd: "N/A" });
        setErrorMessage(`Gas estimation failed: ${error.message}`);
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
      }
    }
  };

  useEffect(() => {
    if (isPriceRouteReady) estimateGas();
  }, [isPriceRouteReady]);

  const checkAndApproveToken = async () => {
    const srcTokenAddress = tokenAddresses[currentNetwork][tokenFrom];
    if (!srcTokenAddress || srcTokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      console.log("No approval needed for native token.");
      return true;
    }

    try {
      const tokenContract = new ethers.Contract(srcTokenAddress, ERC20_ABI, signer);
      const amountBN = ethers.parseUnits(amountFrom, tokenDecimals[currentNetwork][tokenFrom]);

      const network = await provider.getNetwork();
      if (network.chainId !== ethers.toBigInt(networks[currentNetwork].chainId)) {
        await switchNetwork(currentNetwork, window.ethereum);
      }

      let allowance = await tokenContract.allowance(address, PARASWAP_PROXY);
      let allowanceBN = ethers.toBigInt(allowance.toString());

      if (allowanceBN < amountBN) {
        const tx = await tokenContract.approve(PARASWAP_PROXY, amountBN);
        await tx.wait();
        await delay(10000);
        allowance = await tokenContract.allowance(address, PARASWAP_PROXY);
        allowanceBN = ethers.toBigInt(allowance.toString());
        if (allowanceBN < amountBN) throw new Error("Allowance insufficient after approval!");
      }
      return true;
    } catch (error) {
      console.error("Approval failed:", error);
      setErrorMessage(`Token approval failed: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
      throw error;
    }
  };

  const buildTransaction = async () => {
    if (!priceRoute || !isConnected) throw new Error("Cannot build transaction: missing priceRoute or wallet connection");

    const srcToken = tokenAddresses[currentNetwork][tokenFrom];
    const destToken = tokenAddresses[currentNetwork][tokenTo];
    const srcAmount = ethers.parseUnits(amountFrom, tokenDecimals[currentNetwork][tokenFrom]).toString();
    const txData = {
      srcToken,
      destToken,
      srcAmount,
      destAmount: priceRoute.destAmount.toString(),
      priceRoute,
      userAddress: address,
      receiver: address,
      slippage: 100,
      isCapSurplus: false,
      isSurplusToUser: false,
      isDirectFeeTransfer: false,
    };

    const url = `${apiUrl}/v${API_VERSION}/transactions/${networks[currentNetwork].networkId}`;
    console.log("Building transaction with URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(txData),
      signal: abortController.signal,
    });

    const responseData = await response.json();
    if (!response.ok) throw new Error(`Transaction build failed: ${responseData.error || "Unknown error"}`);
    if (!responseData.to || !responseData.data) throw new Error("Invalid transaction data from API");
    return responseData;
  };

  const handleSwap = async () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first!");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
      return;
    }

    if (!amountFrom || Number(amountFrom) <= 0) {
      setErrorMessage("Please enter a valid amount to swap!");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
      return;
    }

    if (!isPriceRouteReady) {
      setErrorMessage("Price route not ready. Please wait or try again.");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
      return;
    }

    setIsSwapping(true);
    try {
      const network = await provider.getNetwork();
      if (network.chainId !== ethers.toBigInt(networks[currentNetwork].chainId)) {
        await switchNetwork(currentNetwork, window.ethereum);
      }

      await checkAndApproveToken();
      await fetchBestRate();
      if (!isPriceRouteReady) throw new Error("Failed to refresh price route.");

      const txParams = await buildTransaction();
      const txValue = txParams.value ? ethers.getBigInt(txParams.value.toString()) : 0n;
      const gasLimit = txParams.gas ? ethers.getBigInt(txParams.gas) : 500000n;

      const tx = await signer.sendTransaction({ to: txParams.to, data: txParams.data, value: txValue, gasLimit });
      await tx.wait();

      setSwapNotification({ message: `Swap successful! Tx Hash: ${tx.hash}`, isSuccess: true });
      setTimeout(() => setSwapNotification(null), 5000);
    } catch (error) {
      console.error("Swap error:", error);
      setErrorMessage(`Swap failed: ${error.message}`);
      setSwapNotification({ message: `Swap failed: ${error.message}`, isSuccess: false });
      setTimeout(() => setSwapNotification(null), 5000);
    } finally {
      setIsSwapping(false);
    }
  };

  const openModal = (isFrom) => {
    setIsSelectingFrom(isFrom);
    setIsModalOpen(true);
  };

  const selectToken = (token) => {
    if (isSelectingFrom) setTokenFrom(token);
    else setTokenTo(token);
    setIsModalOpen(false);
  };

  const handleConnect = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();
        const networkKey = Object.keys(networks).find(key => ethers.toBigInt(networks[key].chainId) === network.chainId) || "arbitrum";
        if (!networkKey) await switchNetwork("arbitrum", window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setProvider(provider);
        setSigner(signer);
        setAddress(userAddress);
        setIsConnected(true);
        await fetch('/api/save-wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: userAddress }),
        });
        setCurrentNetwork(networkKey);
      } else {
        setErrorMessage("MetaMask is not installed!");
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setErrorMessage(`Failed to connect wallet: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
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
      setTimeout(() => setIsNotificationVisible(false), 3000);
      return;
    }

    if (ethers.isAddress(customTokenAddress)) {
      try {
        const network = await provider.getNetwork();
        if (network.chainId !== ethers.toBigInt(networks[currentNetwork].chainId)) {
          setErrorMessage(`Connected to wrong network. Switch to ${networks[currentNetwork].name}.`);
          setIsNotificationVisible(true);
          setTimeout(() => setIsNotificationVisible(false), 3000);
          await switchNetwork(currentNetwork, provider);
          return;
        }

        const contract = new ethers.Contract(customTokenAddress, ERC20_ABI, provider);
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        const newCustomToken = { symbol, address: customTokenAddress, decimals };
        setCustomTokens((prev) => [...prev, newCustomToken].filter((item, index, self) => index === self.findIndex((t) => t.address === item.address)));
        setTokenFrom(symbol);
      } catch (error) {
        console.error("Error fetching token:", error);
        setErrorMessage(`Failed to fetch token: ${error.message}`);
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
      }
    } else {
      setErrorMessage("Invalid contract address");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
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

  const setMaxAmountFrom = () => {
    if (tokenFromBalance && Number(tokenFromBalance) > 0) setAmountFrom(tokenFromBalance);
  };

  const handleNetworkChange = async (networkKey) => {
    try {
      await switchNetwork(networkKey, window.ethereum);
      setCurrentNetwork(networkKey);
      setIsNetworkDropdownOpen(false);
      setTokenFrom("USDC");
      setTokenTo("ETH");
      setAmountFrom("5");
      setAmountTo("");
      setBestDex("Fetching...");
    } catch (error) {
      console.error("Network switch failed:", error);
      setErrorMessage(`Failed to switch network: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
    }
  };

  const displayToken = (token) => token;

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
            <HeartIcon animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <HeartPulse size={20} />
            </HeartIcon>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}>TradePulse Swap</h1>
            <BetaTag>Beta</BetaTag>
          </HeaderTitle>
          <WalletContainer>
            <NetworkSelector>
              <NetworkButton onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}>
                <span>{networks[currentNetwork].name}</span>
                <ChevronDown size={16} />
              </NetworkButton>
              {isNetworkDropdownOpen && (
                <NetworkDropdown>
                  {Object.entries(networks).map(([key, network]) => (
                    <NetworkOption key={key} onClick={() => handleNetworkChange(key)}>
                      {network.name}
                    </NetworkOption>
                  ))}
                </NetworkDropdown>
              )}
            </NetworkSelector>
            <ConnectButton onClick={isConnected ? disconnectWallet : handleConnect} whileHover={{ scale: 1.05 }}>
              {isConnected ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
            </ConnectButton>
          </WalletContainer>
        </Header>

        <TrustSticker>
          <TrustText>The Dex You Can Trust</TrustText>
        </TrustSticker>

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
                    min="0.001"
                  />
                  <TokenButtonContainer>
                    {isConnected && <MaxButton onClick={setMaxAmountFrom}>Max</MaxButton>}
                    <TokenButton onClick={() => openModal(true)}>
                      <span>{displayToken(tokenFrom)}</span>
                      <ChevronDown size={16} />
                    </TokenButton>
                    {isConnected && (
                      <BalanceContainer>
                        <Wallet size={14} />
                        <span>{parseFloat(tokenFromBalance).toFixed(4)}</span>
                      </BalanceContainer>
                    )}
                  </TokenButtonContainer>
                </InputContainer>
                <UsdEquivalent>{usdEquivalent}</UsdEquivalent>

                <SwapTokensContainer>
                  <SwapTokensButton onClick={swapTokens} whileHover={{ scale: 1.05 }}>
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
                      <span>{displayToken(tokenTo)}</span>
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
                <UsdEquivalent>{/* معادل USD برای tokenTo */}</UsdEquivalent>

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

                <RateInfo>Best Rate from: <span style={{ fontWeight: "600" }}>{bestDex}</span></RateInfo>
                <RateInfo>Estimated Gas: {gasEstimate ? `${gasEstimate.gwei} Gwei (~$${gasEstimate.usd} USD)` : "Calculating..."}</RateInfo>

                <SwapButton
                  onClick={handleSwap}
                  disabled={isSwapping || !amountFrom || Number(amountFrom) <= 0 || !isPriceRouteReady}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSwapping ? "Swapping..." : `Swap ${displayToken(tokenFrom)} to ${displayToken(tokenTo)}`}
                </SwapButton>
              </div>
            </CardContent>
          </Card>
        </MainContent>

        {isModalOpen && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
              <ModalHeader>
                <ModalTitle>Select Token</ModalTitle>
                <button onClick={() => setIsModalOpen(false)} style={{ color: "white" }}><X size={24} /></button>
              </ModalHeader>
              <TokenGrid>
                {Object.keys(tokenAddresses[currentNetwork]).map((token) => (
                  <TokenOption key={token} onClick={() => selectToken(token)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {displayToken(token)}
                  </TokenOption>
                ))}
                {customTokens.map((token) => (
                  <TokenOption key={token.address} onClick={() => selectToken(token.symbol)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {token.symbol}
                  </TokenOption>
                ))}
              </TokenGrid>
            </ModalContent>
          </ModalOverlay>
        )}

        {isNotificationVisible && (
          <Notification initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }}>
            {errorMessage}
            <CloseButton onClick={() => setIsNotificationVisible(false)}><X size={18} /></CloseButton>
          </Notification>
        )}

        <SwapAnimation isSwapping={isSwapping} hasError={!!errorMessage} />

        {swapNotification && <SwapNotification message={swapNotification.message} isSuccess={swapNotification.isSuccess} onClose={() => setSwapNotification(null)} />}

        <Footer>
          <FooterText>Powered by TradePulse | Multi-Chain DEX | <FooterLink href="#">Learn More</FooterLink></FooterText>
        </Footer>
      </AppContainer>
    </>
  );
}

export default Swap;

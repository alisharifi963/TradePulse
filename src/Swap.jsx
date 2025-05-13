import { motion } from "framer-motion";
import { ChevronDown, X, HeartPulse, ArrowLeftRight, Wallet, CheckCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { ethers } from "ethers";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { constructSimpleSDK } from "@paraswap/sdk";
import { SwapSide } from "@paraswap/core";
import axios from "axios";

// استایل‌های سراسری
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

// تنظیمات شبکه‌ها
const networks = {
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
    networkId: 42161,
    apiUrl: "https://api.paraswap.io",
  },
  base: {
    chainId: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
    networkId: 8453,
    apiUrl: "https://api.paraswap.io",
  },
  ethereum: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY || ""}`,
    explorerUrl: "https://etherscan.io",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
    networkId: 1,
    apiUrl: "https://api.paraswap.io",
  },
  bnb: {
    chainId: 56,
    name: "Binance Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    explorerUrl: "https://bscscan.com",
    nativeCurrency: { symbol: "BNB", decimals: 18 },
    networkId: 56,
    apiUrl: "https://api.paraswap.io",
  },
};

// آدرس توکن‌ها
const tokenAddresses = {
  arbitrum: {
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    UNI: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f",
    LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab",
    GMX: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb",
  },
  base: {
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    WETH: "0x4200000000000000000000000000000000000006",
    DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  },
  ethereum: {
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
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

// ABI برای قراردادهای ERC20
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

// استایل‌های کامپوننت‌ها
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
  font-family: "Caveat", cursive;
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

const SettingsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SettingsInput = styled.input`
  background: rgba(55, 65, 81, 0.5);
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(75, 85, 99, 0.5);
  width: 100%;
  outline: none;
`;

const LanguageSelector = styled.select`
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  padding: 0.3rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
`;

const SwapAnimation = ({ isSwapping, hasError }) => {
  const heartVariants = {
    initial: { scale: 1 },
    animate: hasError
      ? { scale: 1 }
      : { scale: [1, 1.2, 1], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } },
  };

  return isSwapping ? (
    <AnimationOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 101,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        style={{
          background,
          color: "white",
          padding: "1rem 2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          maxWidth: "400px",
          textAlign: "center",
          wordBreak: "break-word",
        }}
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
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "none",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.25rem",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          OK
        </button>
      </motion.div>
    </motion.div>
  );
};

// توابع کمکی
const detectEthereumProvider = async () => {
  if (typeof window === "undefined" || !window.ethereum) return null;

  const providers = window.ethereum?.providers || [window.ethereum];
  return providers.find((p) => p.isMetaMask) || providers[0] || null;
};

const switchNetwork = async (networkKey, provider) => {
  if (!provider) return false;
  const network = networks[networkKey];
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${network.chainId.toString(16)}` }],
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${network.chainId.toString(16)}`,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: network.nativeCurrency,
              blockExplorerUrls: [network.explorerUrl],
            },
          ],
        });
        return true;
      } catch (addError) {
        throw addError;
      }
    }
    throw error;
  }
};

const createSwapper = (networkId) => {
  if (!networkId) {
    console.error("Network ID is undefined");
    return null;
  }
  const networkKey = Object.keys(networks).find((key) => networks[key].networkId === networkId);
  if (!networkKey) {
    console.error(`Network ID ${networkId} is not supported`);
    return null;
  }
  try {
    return constructSimpleSDK({
      chainId: networkId,
      apiURL: networks[networkKey].apiUrl,
      fetcher: axios,
    });
  } catch (error) {
    console.error("Failed to initialize Paraswap SDK:", error.message);
    return null;
  }
};

const fetchTokenPrice = async (tokenSymbol, currentNetwork) => {
  if (typeof window === "undefined") return 0;
  try {
    const tokenAddress = tokenAddresses[currentNetwork]?.[tokenSymbol];
    if (!tokenAddress) {
      console.warn(`Token address for ${tokenSymbol} not found in network ${currentNetwork}`);
      return 0;
    }

    const usdcAddress = tokenAddresses[currentNetwork]?.["USDC"] || "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const decimals = tokenDecimals[currentNetwork]?.[tokenSymbol] || 18;
    const amountInUnits = ethers.utils.parseUnits("1", decimals).toString();

    const paraswap = createSwapper(networks[currentNetwork]?.networkId);
    if (!paraswap) {
      console.warn(`Paraswap SDK could not be initialized for network ${currentNetwork}`);
      return 0;
    }

    const priceRoute = await paraswap.swap.getRate({
      srcToken: tokenAddress,
      destToken: usdcAddress,
      amount: amountInUnits,
      side: SwapSide.SELL,
    });

    if (!priceRoute || !priceRoute.destAmount) {
      throw new Error("Invalid response from Paraswap API");
    }

    return Number(priceRoute.destAmount) / 1e6; // USDC has 6 decimals
  } catch (error) {
    console.error(`Error fetching price for ${tokenSymbol} on ${currentNetwork}:`, error.message);
    return 0;
  }
};

function Swap() {
  const { t, i18n } = useTranslation();
  const abortController = new AbortController();

  const [tokenFrom, setTokenFrom] = useState("ETH");
  const [tokenTo, setTokenTo] = useState("USDC");
  const [amountFrom, setAmountFrom] = useState("0.001");
  const [amountTo, setAmountTo] = useState("");
  const [bestDex, setBestDex] = useState("Fetching...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectingFrom, setIsSelectingFrom] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState("arbitrum");
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balanceFrom, setBalanceFrom] = useState("0");
  const [balanceTo, setBalanceTo] = useState("0");
  const [isSwapping, setIsSwapping] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [swapNotification, setSwapNotification] = useState(null);
  const [priceRoute, setPriceRoute] = useState(null);
  const [isPriceRouteReady, setIsPriceRouteReady] = useState(false);
  const [usdEquivalent, setUsdEquivalent] = useState("");
  const [slippage, setSlippage] = useState("1");
  const [deadline, setDeadline] = useState("20");
  const [gasEstimate, setGasEstimate] = useState({ gwei: "0", usd: "N/A" });
  const [searchTokenAddress, setSearchTokenAddress] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchTokenBalance = async (tokenSymbol, userAddress) => {
    if (typeof window === "undefined" || !userAddress || !provider || !tokenSymbol) {
      console.warn("Missing parameters for fetchTokenBalance:", { userAddress, provider, tokenSymbol });
      return "0";
    }
    try {
      const tokenAddress = tokenAddresses[currentNetwork]?.[tokenSymbol];
      if (!tokenAddress) {
        console.warn(`Token address for ${tokenSymbol} not found in network ${currentNetwork}`);
        return "0";
      }

      let balance;
      if (tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        balance = await provider.getBalance(userAddress);
      } else {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        balance = await tokenContract.balanceOf(userAddress);
      }

      const decimals = tokenDecimals[currentNetwork]?.[tokenSymbol] || 18;
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error(`Error fetching balance for ${tokenSymbol} on ${currentNetwork}:`, error.message);
      return "0";
    }
  };

  const fetchBestRate = async (signal) => {
    if (typeof window === "undefined" || isInitialLoad) return;
    try {
      if (!isConnected || !address || !provider) {
        setAmountTo("");
        setBestDex(t("invalid_amount") || "Invalid Amount");
        setPriceRoute(null);
        setUsdEquivalent("");
        setSwapNotification({ message: t("invalid_amount") || "Invalid Amount", isSuccess: false });
        setTimeout(() => setSwapNotification(null), 3000);
        return;
      }

      const sellTokenAddress = tokenAddresses[currentNetwork]?.[tokenFrom];
      const buyTokenAddress = tokenAddresses[currentNetwork]?.[tokenTo];
      if (!sellTokenAddress || !buyTokenAddress) {
        console.error(`Token addresses not found for ${tokenFrom} or ${tokenTo} on ${currentNetwork}`);
        setErrorMessage(t("invalid_contract_address") || "Invalid Contract Address");
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
        return;
      }

      setIsPriceRouteReady(false);
      const decimalsFrom = tokenDecimals[currentNetwork]?.[tokenFrom] || 18;
      const sellAmountFormatted = ethers.utils.parseUnits(amountFrom || "0", decimalsFrom).toString();
      if (Number(amountFrom) <= 0) {
        setAmountTo("");
        setBestDex(t("invalid_amount") || "Invalid Amount");
        setPriceRoute(null);
        setUsdEquivalent("");
        return;
      }

      const paraswap = createSwapper(networks[currentNetwork]?.networkId);
      if (!paraswap) {
        setErrorMessage(
          t("network_not_supported", { networks: Object.values(networks).map(n => n.name).join(", ") }) ||
          "Network not supported"
        );
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
        return;
      }

      const priceRoute = await paraswap.swap.getRate({
        srcToken: sellTokenAddress,
        destToken: buyTokenAddress,
        amount: sellAmountFormatted,
        side: SwapSide.SELL,
        userAddress: address,
        slippage: Number(slippage) || 1,
      });

      if (!priceRoute || !priceRoute.destAmount) {
        throw new Error("No routes found with enough liquidity");
      }

      setPriceRoute(priceRoute);
      const decimalsTo = tokenDecimals[currentNetwork]?.[tokenTo] || 18;
      const formattedAmountTo = ethers.utils.formatUnits(priceRoute.destAmount, decimalsTo);
      setAmountTo(formattedAmountTo);
      setBestDex("Paraswap");
      setIsPriceRouteReady(true);

      const toPriceInUSDC = await fetchTokenPrice(tokenTo, currentNetwork);
      if (toPriceInUSDC > 0) {
        const amountToBN = ethers.utils.parseUnits(formattedAmountTo, decimalsTo);
        const usdValueBN = amountToBN.mul(Math.round(toPriceInUSDC * 1e6)).div(1e6);
        const usdValue = ethers.utils.formatUnits(usdValueBN, decimalsTo);
        setUsdEquivalent(`≈ $${Number(usdValue).toFixed(2)} USD`);
      } else {
        setUsdEquivalent("Price unavailable");
      }

      const gasEstimateValue = priceRoute.estimatedGas || "200000";
      const gasInGwei = ethers.utils.formatUnits(gasEstimateValue, "gwei");
      setGasEstimate({ gwei: gasInGwei, usd: "N/A" });
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Error fetching rate:", error.message);
      setAmountTo("");
      setBestDex(t("price_route_not_ready") || "Price Route Not Ready");
      setPriceRoute(null);
      setUsdEquivalent("N/A");
      setSwapNotification({ message: error.message || t("price_route_not_ready") || "Price Route Not Ready", isSuccess: false });
      setTimeout(() => setSwapNotification(null), 3000);
    }
  };

  const debouncedFetchBestRate = debounce(fetchBestRate, 500);

  const handleSwapTokens = () => {
    setTokenFrom(tokenTo);
    setTokenTo(tokenFrom);
    setAmountFrom(amountTo || "0");
    setAmountTo("");
    setBestDex("Fetching...");
  };

  const handleConnect = async () => {
    if (typeof window === "undefined") {
      setErrorMessage(t("metamask_not_installed") || "MetaMask Not Installed");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
      return;
    }

    try {
      const ethereumProvider = await detectEthereumProvider();
      if (!ethereumProvider) {
        setErrorMessage(t("metamask_not_installed") || "MetaMask Not Installed");
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereumProvider, "any");
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const networkKey = Object.keys(networks).find((key) => networks[key].chainId === Number(network.chainId));
      if (!networkKey) {
        const supportedNetworks = Object.values(networks)
          .map((n) => n.name)
          .join(", ");
        setErrorMessage(t("network_not_supported", { networks: supportedNetworks }) || "Network Not Supported");
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
        const switched = await switchNetwork("arbitrum", ethereumProvider);
        if (!switched) return;
        setCurrentNetwork("arbitrum");
      } else {
        setCurrentNetwork(networkKey);
      }
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      setProvider(provider);
      setSigner(signer);
      setAddress(userAddress);
      setIsConnected(true);
      setIsInitialLoad(false);

      try {
        await fetch("/api/save-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: userAddress }),
        });
      } catch (apiError) {
        console.error("Failed to save wallet:", apiError.message);
      }
    } catch (error) {
      console.error("Connection error:", error.message);
      setErrorMessage(t("failed_connect_wallet", { error: error.message }) || `Failed to Connect Wallet: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
    }
  };

  const handleNetworkChange = async (networkKey) => {
    if (typeof window === "undefined") return;
    const ethereumProvider = await detectEthereumProvider();
    if (!ethereumProvider) return;
    try {
      const switched = await switchNetwork(networkKey, ethereumProvider);
      if (switched) {
        setCurrentNetwork(networkKey);
        setIsNetworkDropdownOpen(false);
        setAmountTo("");
        setBestDex("Fetching...");
        setTokenFrom(networkKey === "bnb" ? "BNB" : "ETH");
        setTokenTo("USDC");
      }
    } catch (error) {
      console.error("Network switch error:", error.message);
      setErrorMessage(t("failed_connect_wallet", { error: error.message }) || `Failed to Switch Network: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
    }
  };

  const handleAmountFromChange = (e) => {
    const value = e.target.value;
    setAmountFrom(value);
    setAmountTo("");
    setBestDex("Fetching...");
  };

  const handleMaxClick = (balance) => {
    setAmountFrom(balance);
    setAmountTo("");
    setBestDex("Fetching...");
  };

  const handleTokenSelect = (token) => {
    if (isSelectingFrom) {
      setTokenFrom(token);
      if (token === tokenTo) {
        setTokenTo(tokenFrom);
      }
    } else {
      setTokenTo(token);
      if (token === tokenFrom) {
        setTokenFrom(tokenTo);
      }
    }
    setAmountTo("");
    setBestDex("Fetching...");
    setIsModalOpen(false);
  };

  const handleSearchToken = async () => {
    if (!ethers.utils.isAddress(searchTokenAddress)) {
      setErrorMessage(t("invalid_contract_address") || "Invalid Contract Address");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
      return;
    }

    try {
      if (!provider) {
        setErrorMessage("Provider not initialized");
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
        return;
      }
      const tokenContract = new ethers.Contract(searchTokenAddress, ERC20_ABI, provider);
      const symbol = await tokenContract.symbol();
      tokenAddresses[currentNetwork][symbol] = searchTokenAddress;
      tokenDecimals[currentNetwork][symbol] = await tokenContract.decimals();
      handleTokenSelect(symbol);
    } catch (error) {
      console.error("Error fetching token:", error.message);
      setErrorMessage(t("failed_fetch_token", { error: error.message }) || `Failed to Fetch Token: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
    }
  };

  const handleSwap = async () => {
    if (typeof window === "undefined") return;
    const ethereumProvider = await detectEthereumProvider();
    if (!ethereumProvider) return;
    try {
      if (!isConnected || !address || !priceRoute || !isPriceRouteReady) {
        setErrorMessage(t("invalid_amount") || "Invalid Amount");
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
        return;
      }

      setIsSwapping(true);
      const sellTokenAddress = tokenAddresses[currentNetwork]?.[tokenFrom];
      const buyTokenAddress = tokenAddresses[currentNetwork]?.[tokenTo];
      const amountIn = ethers.utils.parseUnits(amountFrom, tokenDecimals[currentNetwork]?.[tokenFrom] || 18);
      const minAmount = ethers.utils
        .parseUnits(amountTo, tokenDecimals[currentNetwork]?.[tokenTo] || 18)
        .mul(100 - Number(slippage))
        .div(100);

      const paraswap = createSwapper(networks[currentNetwork]?.networkId);
      if (!paraswap) {
        setErrorMessage(
          t("network_not_supported", { networks: Object.values(networks).map(n => n.name).join(", ") }) ||
          "Network not supported"
        );
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
        return;
      }

      const transactionRequest = await paraswap.swap.buildTx({
        srcToken: sellTokenAddress,
        destToken: buyTokenAddress,
        srcAmount: amountIn.toString(),
        destAmount: minAmount.toString(),
        priceRoute,
        userAddress: address,
        partner: "your_partner_name",
      });

      if (sellTokenAddress !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        setSwapNotification({ message: t("approving_token") || "Approving Token", isSuccess: false });
        const tokenContract = new ethers.Contract(sellTokenAddress, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(address, transactionRequest.to);
        if (allowance.lt(amountIn)) {
          const approveTx = await tokenContract.approve(transactionRequest.to, amountIn);
          await approveTx.wait();
          setSwapNotification({ message: t("token_approved") || "Token Approved", isSuccess: true });
          setTimeout(() => setSwapNotification(null), 3000);
        }
      }

      const tx = {
        to: transactionRequest.to,
        data: transactionRequest.data,
        value: transactionRequest.value,
        gasPrice: transactionRequest.gasPrice,
        gas: transactionRequest.estimatedGas,
      };

      const receipt = await signer.sendTransaction(tx);
      await receipt.wait();
      setSwapNotification({ message: t("swap_successful", { hash: receipt.transactionHash }) || `Swap Successful: ${receipt.transactionHash}`, isSuccess: true });
    } catch (error) {
      console.error("Swap error:", error.message);
      if (error.code === 4001) {
        setSwapNotification({ message: t("transaction_rejected") || "Transaction Rejected", isSuccess: false });
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        setSwapNotification({ message: t("insufficient_funds") || "Insufficient Funds", isSuccess: false });
      } else {
        setSwapNotification({ message: t("swap_failed", { error: error.message }) || `Swap Failed: ${error.message}`, isSuccess: false });
      }
    } finally {
      setIsSwapping(false);
      setTimeout(() => setSwapNotification(null), 5000);
    }
  };

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isConnected && address && provider) {
      fetchTokenBalance(tokenFrom, address).then((balance) => setBalanceFrom(balance || "0"));
      fetchTokenBalance(tokenTo, address).then((balance) => setBalanceTo(balance || "0"));
    }
  }, [isConnected, address, tokenFrom, tokenTo, currentNetwork, provider]);

  useEffect(() => {
    if (typeof window === "undefined" || isInitialLoad) return;
    if (amountFrom && Number(amountFrom) > 0 && isConnected && provider && address) {
      debouncedFetchBestRate(abortController.signal);
    }
    return () => abortController.abort();
  }, [amountFrom, tokenFrom, tokenTo, currentNetwork, isConnected, address, slippage, provider]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const setupListeners = async () => {
      const ethereumProvider = await detectEthereumProvider();
      if (!ethereumProvider) return;

      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          setIsInitialLoad(false);
        } else {
          setIsConnected(false);
          setAddress("");
          setProvider(null);
          setSigner(null);
          setIsInitialLoad(true);
        }
      };

      const handleChainChanged = async (chainId) => {
        const networkKey = Object.keys(networks).find((key) => networks[key].chainId === Number(chainId));
        if (networkKey) {
          setCurrentNetwork(networkKey);
          setAmountTo("");
          setBestDex("Fetching...");
          setTokenFrom(networkKey === "bnb" ? "BNB" : "ETH");
          setTokenTo("USDC");
        } else {
          setIsConnected(false);
          setAddress("");
          setProvider(null);
          setSigner(null);
          setIsInitialLoad(true);
          const supportedNetworks = Object.values(networks)
            .map((n) => n.name)
            .join(", ");
          setErrorMessage(t("network_not_supported", { networks: supportedNetworks }) || "Network Not Supported");
          setIsNotificationVisible(true);
          setTimeout(() => setIsNotificationVisible(false), 3000);
        }
      };

      ethereumProvider.on("accountsChanged", handleAccountsChanged);
      ethereumProvider.on("chainChanged", handleChainChanged);

      return () => {
        ethereumProvider.removeListener("accountsChanged", handleAccountsChanged);
        ethereumProvider.removeListener("chainChanged", handleChainChanged);
      };
    };

    setupListeners();
  }, [t]);

  return (
    <AppContainer>
      <GlobalStyle />
      <Particle />
      <ParticleBottom />
      <Header>
        <HeaderTitle>
          <HeartIcon whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <HeartPulse size={24} />
          </HeartIcon>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "white" }}>{t("title") || "Swap"}</h1>
          <BetaTag>Beta</BetaTag>
        </HeaderTitle>
        <div style={{ display: "flex", gap: "1rem" }}>
          <NetworkSelector>
            <NetworkButton onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}>
              {networks[currentNetwork]?.name || "Select Network"} <ChevronDown size={16} />
            </NetworkButton>
            {isNetworkDropdownOpen && (
              <NetworkDropdown>
                {Object.keys(networks).map((networkKey) => (
                  <NetworkOption key={networkKey} onClick={() => handleNetworkChange(networkKey)}>
                    {networks[networkKey].name}
                  </NetworkOption>
                ))}
              </NetworkDropdown>
            )}
          </NetworkSelector>
          <LanguageSelector onChange={handleLanguageChange} value={i18n.language || "en"}>
            <option value="en">English</option>
            <option value="fa">فارسی</option>
          </LanguageSelector>
          {isConnected ? (
            <WalletContainer>
              <Wallet size={20} color="#3b82f6" />
              <span style={{ color: "white", fontSize: "0.875rem" }}>
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}
              </span>
            </WalletContainer>
          ) : (
            <ConnectButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleConnect}>
              {t("connect_wallet") || "Connect Wallet"}
            </ConnectButton>
          )}
        </div>
      </Header>
      <TrustSticker>
        <TrustText>The Dex You Can Trust</TrustText>
      </TrustSticker>
      <MainContent>
        <Card>
          <CardContent>
            <Subtitle>{t("swap_tokens") || "Swap Tokens"}</Subtitle>
            <InputContainer>
              <Input
                type="number"
                value={amountFrom}
                onChange={handleAmountFromChange}
                placeholder="0.0"
                min="0"
                step="0.001"
              />
              <TokenButtonContainer>
                <TokenButton
                  onClick={() => {
                    setIsSelectingFrom(true);
                    setIsModalOpen(true);
                  }}
                >
                  {tokenFrom} <ChevronDown size={16} />
                </TokenButton>
                {isConnected && (
                  <BalanceContainer onClick={() => handleMaxClick(balanceFrom)}>
                    <span>{Number(balanceFrom).toFixed(4)}</span>
                    <MaxButton>{t("max") || "Max"}</MaxButton>
                  </BalanceContainer>
                )}
              </TokenButtonContainer>
            </InputContainer>
            <UsdEquivalent>{usdEquivalent}</UsdEquivalent>
            <SwapTokensContainer>
              <SwapTokensButton onClick={handleSwapTokens} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <ArrowLeftRight size={20} />
              </SwapTokensButton>
            </SwapTokensContainer>
            <InputContainer>
              <Input type="number" value={amountTo} placeholder="0.0" readOnly />
              <TokenButtonContainer>
                <TokenButton
                  onClick={() => {
                    setIsSelectingFrom(false);
                    setIsModalOpen(true);
                  }}
                >
                  {tokenTo} <ChevronDown size={16} />
                </TokenButton>
                {isConnected && (
                  <BalanceContainer>
                    <span>{Number(balanceTo).toFixed(4)}</span>
                  </BalanceContainer>
                )}
              </TokenButtonContainer>
            </InputContainer>
            <InputContainer>
              <Input
                type="text"
                value={searchTokenAddress}
                onChange={(e) => setSearchTokenAddress(e.target.value)}
                placeholder={t("search_token") || "Search Token by Address"}
              />
              <TokenButton onClick={handleSearchToken}>Search</TokenButton>
            </InputContainer>
            <SettingsContainer>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.875rem", color: "#9ca3af" }}>{t("slippage") || "Slippage (%)"}</label>
                <SettingsInput
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.875rem", color: "#9ca3af" }}>{t("deadline") || "Deadline (min)"}</label>
                <SettingsInput
                  type="number"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min="1"
                  step="1"
                />
              </div>
            </SettingsContainer>
            <RateInfo>
              {t("best_rate_from") || "Best rate from"}: {bestDex}
              <br />
              {t("estimated_gas") || "Estimated Gas"}: {gasEstimate.gwei} Gwei (~${gasEstimate.usd} USD)
            </RateInfo>
            <SwapButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSwap}
              disabled={!isConnected || !isPriceRouteReady || isSwapping}
            >
              {isSwapping ? (t("swapping") || "Swapping...") : t("swap_button", { from: tokenFrom, to: tokenTo }) || `Swap ${tokenFrom} to ${tokenTo}`}
            </SwapButton>
          </CardContent>
        </Card>
      </MainContent>
      {isModalOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsModalOpen(false)}
        >
          <ModalContent
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <ModalHeader>
              <ModalTitle>{t("select_token") || "Select a Token"}</ModalTitle>
              <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            <TokenGrid>
              {Object.keys(tokenAddresses[currentNetwork] || {}).map((token) => (
                <TokenOption
                  key={token}
                  onClick={() => handleTokenSelect(token)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {token}
                </TokenOption>
              ))}
            </TokenGrid>
          </ModalContent>
        </ModalOverlay>
      )}
      {isNotificationVisible && (
        <Notification initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <AlertTriangle size={20} />
          <span>{errorMessage}</span>
          <CloseButton onClick={() => setIsNotificationVisible(false)}>×</CloseButton>
        </Notification>
      )}
      {swapNotification && (
        <SwapNotification
          message={swapNotification.message}
          isSuccess={swapNotification.isSuccess}
          onClose={() => setSwapNotification(null)}
        />
      )}
      <SwapAnimation isSwapping={isSwapping} hasError={!!swapNotification && !swapNotification.isSuccess} />
      <Footer>
        <FooterText>
          {t("powered_by") || "Powered by"} <FooterLink href="https://paraswap.io/" target="_blank">Paraswap</FooterLink>
        </FooterText>
      </Footer>
    </AppContainer>
  );
}

export default Swap;
